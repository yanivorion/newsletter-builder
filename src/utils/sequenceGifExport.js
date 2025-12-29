// Simple GIF encoder for image sequences
// Creates animated GIF using a pure JavaScript approach

// LZW Encoding for GIF
class LZWEncoder {
  constructor(width, height, pixels, colorDepth) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
    this.colorDepth = Math.max(2, colorDepth);
    this.initCodeSize = Math.max(2, colorDepth);
  }

  encode(outputStream) {
    outputStream.writeByte(this.initCodeSize);
    
    const clearCode = 1 << this.initCodeSize;
    const eofCode = clearCode + 1;
    let codeSize = this.initCodeSize + 1;
    let nextCode = eofCode + 1;
    let maxCode = (1 << codeSize) - 1;
    
    const codeTable = new Map();
    for (let i = 0; i < clearCode; i++) {
      codeTable.set(String(i), i);
    }
    
    let buffer = 0;
    let bufferSize = 0;
    const outputBuffer = [];
    
    const output = (code) => {
      buffer |= code << bufferSize;
      bufferSize += codeSize;
      while (bufferSize >= 8) {
        outputBuffer.push(buffer & 0xff);
        buffer >>= 8;
        bufferSize -= 8;
      }
    };
    
    // Output clear code
    output(clearCode);
    
    let indexBuffer = String(this.pixels[0]);
    
    for (let i = 1; i < this.pixels.length; i++) {
      const k = String(this.pixels[i]);
      const indexBufferK = indexBuffer + ',' + k;
      
      if (codeTable.has(indexBufferK)) {
        indexBuffer = indexBufferK;
      } else {
        output(codeTable.get(indexBuffer));
        
        if (nextCode <= 4095) {
          codeTable.set(indexBufferK, nextCode++);
          if (nextCode > maxCode && codeSize < 12) {
            codeSize++;
            maxCode = (1 << codeSize) - 1;
          }
        } else {
          // Reset
          output(clearCode);
          codeSize = this.initCodeSize + 1;
          nextCode = eofCode + 1;
          maxCode = (1 << codeSize) - 1;
          codeTable.clear();
          for (let j = 0; j < clearCode; j++) {
            codeTable.set(String(j), j);
          }
        }
        indexBuffer = k;
      }
    }
    
    output(codeTable.get(indexBuffer));
    output(eofCode);
    
    if (bufferSize > 0) {
      outputBuffer.push(buffer & 0xff);
    }
    
    // Write sub-blocks
    let pos = 0;
    while (pos < outputBuffer.length) {
      const blockSize = Math.min(255, outputBuffer.length - pos);
      outputStream.writeByte(blockSize);
      for (let i = 0; i < blockSize; i++) {
        outputStream.writeByte(outputBuffer[pos++]);
      }
    }
    
    outputStream.writeByte(0); // Block terminator
  }
}

class ByteArray {
  constructor() {
    this.data = [];
  }

  writeByte(val) {
    this.data.push(val & 0xff);
  }

  writeBytes(arr) {
    for (let i = 0; i < arr.length; i++) {
      this.writeByte(arr[i]);
    }
  }

  writeShort(val) {
    this.writeByte(val & 0xff);
    this.writeByte((val >> 8) & 0xff);
  }

  writeString(str) {
    for (let i = 0; i < str.length; i++) {
      this.writeByte(str.charCodeAt(i));
    }
  }

  toBlob() {
    return new Blob([new Uint8Array(this.data)], { type: 'image/gif' });
  }
}

class NeuQuant {
  constructor(pixels, sampleFac) {
    this.pixels = pixels;
    this.sampleFac = sampleFac || 10;
    this.networkSize = 256;
    this.network = [];
    this.colorMap = [];
    
    for (let i = 0; i < this.networkSize; i++) {
      this.network[i] = [(i << 12) / this.networkSize, (i << 12) / this.networkSize, (i << 12) / this.networkSize];
    }
  }

  buildColorMap() {
    this.learn();
    this.colorMap = [];
    for (let i = 0; i < this.networkSize; i++) {
      this.colorMap[i] = [
        Math.round(this.network[i][0] / 16),
        Math.round(this.network[i][1] / 16),
        Math.round(this.network[i][2] / 16)
      ];
    }
  }

  learn() {
    const lengthCount = this.pixels.length / 4;
    const samplePixels = Math.floor(lengthCount / this.sampleFac);
    let alpha = 30;
    const radius = Math.floor(this.networkSize / 8);
    
    for (let i = 0; i < samplePixels; i++) {
      const p = Math.floor(Math.random() * lengthCount) * 4;
      const b = this.pixels[p];
      const g = this.pixels[p + 1];
      const r = this.pixels[p + 2];
      
      let bestD = 1e10;
      let bestI = 0;
      
      for (let j = 0; j < this.networkSize; j++) {
        const d = Math.abs(this.network[j][0] - (b << 4)) +
                  Math.abs(this.network[j][1] - (g << 4)) +
                  Math.abs(this.network[j][2] - (r << 4));
        if (d < bestD) {
          bestD = d;
          bestI = j;
        }
      }
      
      const lo = Math.max(0, bestI - radius);
      const hi = Math.min(this.networkSize - 1, bestI + radius);
      
      for (let j = lo; j <= hi; j++) {
        const a = alpha * (1 - Math.abs(j - bestI) / radius) / 1000;
        this.network[j][0] += a * ((b << 4) - this.network[j][0]);
        this.network[j][1] += a * ((g << 4) - this.network[j][1]);
        this.network[j][2] += a * ((r << 4) - this.network[j][2]);
      }
      
      alpha = Math.max(1, alpha - 1);
    }
  }

  map(b, g, r) {
    let bestD = 1e10;
    let bestI = 0;
    
    for (let i = 0; i < this.networkSize; i++) {
      const d = Math.abs(this.colorMap[i][0] - b) +
                Math.abs(this.colorMap[i][1] - g) +
                Math.abs(this.colorMap[i][2] - r);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    
    return bestI;
  }

  getColorMap() {
    return this.colorMap;
  }
}

// Export images as animated GIF
export async function exportSequenceAsGif(images, options = {}) {
  const {
    width = 600,
    height = 400,
    delay = 500,
    backgroundColor = '#FFFFFF',
    onProgress = null
  } = options;

  if (images.length < 2) {
    throw new Error('Need at least 2 images to create a GIF');
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Parse background color
  const bgHex = backgroundColor.replace('#', '');
  const bgR = parseInt(bgHex.substr(0, 2), 16) || 255;
  const bgG = parseInt(bgHex.substr(2, 2), 16) || 255;
  const bgB = parseInt(bgHex.substr(4, 2), 16) || 255;

  // Load all images
  if (onProgress) onProgress(5);
  
  const loadedImages = await Promise.all(
    images.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (onProgress) onProgress(5 + Math.round((index / images.length) * 20));
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = src;
      });
    })
  );

  const validImages = loadedImages.filter(img => img !== null);
  if (validImages.length < 2) {
    throw new Error('Failed to load images');
  }

  if (onProgress) onProgress(30);

  // Start GIF
  const output = new ByteArray();
  
  // Header
  output.writeString('GIF89a');
  
  // Logical screen descriptor
  output.writeShort(width);
  output.writeShort(height);
  output.writeByte(0xf7); // Global color table flag, 256 colors
  output.writeByte(0); // Background color index
  output.writeByte(0); // Pixel aspect ratio

  // Build color palette from first frame
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const firstImg = validImages[0];
  const imgRatio = firstImg.width / firstImg.height;
  const canvasRatio = width / height;
  let drawWidth, drawHeight, drawX, drawY;
  
  if (imgRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * imgRatio;
    drawX = (width - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = width;
    drawHeight = width / imgRatio;
    drawX = 0;
    drawY = (height - drawHeight) / 2;
  }
  
  ctx.drawImage(firstImg, drawX, drawY, drawWidth, drawHeight);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const nq = new NeuQuant(imageData.data, 10);
  nq.buildColorMap();
  const colorMap = nq.getColorMap();

  // Global color table
  for (let i = 0; i < 256; i++) {
    output.writeByte(colorMap[i] ? colorMap[i][2] : 0); // R
    output.writeByte(colorMap[i] ? colorMap[i][1] : 0); // G
    output.writeByte(colorMap[i] ? colorMap[i][0] : 0); // B
  }

  // Netscape extension for looping
  output.writeByte(0x21); // Extension
  output.writeByte(0xff); // Application extension
  output.writeByte(11);   // Block size
  output.writeString('NETSCAPE2.0');
  output.writeByte(3);    // Sub-block size
  output.writeByte(1);    // Loop indicator
  output.writeShort(0);   // Loop count (0 = infinite)
  output.writeByte(0);    // Block terminator

  if (onProgress) onProgress(40);

  // Add frames
  for (let frameIndex = 0; frameIndex < validImages.length; frameIndex++) {
    const img = validImages[frameIndex];
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate cover fit
    const ratio = img.width / img.height;
    const cRatio = width / height;
    
    if (ratio > cRatio) {
      drawHeight = height;
      drawWidth = height * ratio;
      drawX = (width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = width;
      drawHeight = width / ratio;
      drawX = 0;
      drawY = (height - drawHeight) / 2;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    const frameData = ctx.getImageData(0, 0, width, height);
    const pixels = new Uint8Array(width * height);
    
    for (let i = 0; i < frameData.data.length; i += 4) {
      pixels[i / 4] = nq.map(
        frameData.data[i],     // R
        frameData.data[i + 1], // G
        frameData.data[i + 2]  // B
      );
    }

    // Graphic control extension
    output.writeByte(0x21); // Extension
    output.writeByte(0xf9); // Graphic control
    output.writeByte(4);    // Block size
    output.writeByte(0);    // Disposal method
    output.writeShort(Math.round(delay / 10)); // Delay (in centiseconds)
    output.writeByte(0);    // Transparent color index
    output.writeByte(0);    // Block terminator

    // Image descriptor
    output.writeByte(0x2c); // Image separator
    output.writeShort(0);   // Left
    output.writeShort(0);   // Top
    output.writeShort(width);
    output.writeShort(height);
    output.writeByte(0);    // No local color table

    // LZW encode
    const encoder = new LZWEncoder(width, height, pixels, 8);
    encoder.encode(output);

    if (onProgress) onProgress(40 + Math.round((frameIndex / validImages.length) * 55));
  }

  // Trailer
  output.writeByte(0x3b);

  if (onProgress) onProgress(100);

  return output.toBlob();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
