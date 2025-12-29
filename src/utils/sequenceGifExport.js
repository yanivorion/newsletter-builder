// Simple GIF encoder for image sequences
// Creates animated GIF using a pure JavaScript approach with proper color handling

class ByteArray {
  constructor() {
    this.data = [];
  }

  writeByte(val) {
    this.data.push(val & 0xff);
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

// Create a 216-color web-safe palette (6x6x6 color cube)
function createWebSafePalette() {
  const palette = [];
  const levels = [0, 51, 102, 153, 204, 255];
  
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette.push([levels[r], levels[g], levels[b]]);
      }
    }
  }
  
  // Fill remaining 40 slots with grayscale
  for (let i = 216; i < 256; i++) {
    const gray = Math.round((i - 216) * 255 / 39);
    palette.push([gray, gray, gray]);
  }
  
  return palette;
}

// Find closest color in palette
function findClosestColor(r, g, b, palette) {
  let minDist = Infinity;
  let bestIndex = 0;
  
  for (let i = 0; i < palette.length; i++) {
    const pr = palette[i][0];
    const pg = palette[i][1];
    const pb = palette[i][2];
    
    // Simple Euclidean distance
    const dist = (r - pr) * (r - pr) + (g - pg) * (g - pg) + (b - pb) * (b - pb);
    
    if (dist < minDist) {
      minDist = dist;
      bestIndex = i;
      if (dist === 0) break; // Exact match
    }
  }
  
  return bestIndex;
}

// LZW Encoder
function lzwEncode(pixels, minCodeSize, output) {
  const clearCode = 1 << minCodeSize;
  const eofCode = clearCode + 1;
  
  let codeSize = minCodeSize + 1;
  let nextCode = eofCode + 1;
  let maxCode = (1 << codeSize) - 1;
  
  // Use object for code table (faster than Map for this use case)
  let codeTable = {};
  for (let i = 0; i < clearCode; i++) {
    codeTable[i] = i;
  }
  
  let buffer = 0;
  let bufferBits = 0;
  const outputBytes = [];
  
  const outputCode = (code) => {
    buffer |= (code << bufferBits);
    bufferBits += codeSize;
    
    while (bufferBits >= 8) {
      outputBytes.push(buffer & 0xff);
      buffer >>= 8;
      bufferBits -= 8;
    }
  };
  
  // Start with clear code
  outputCode(clearCode);
  
  let indexBuffer = pixels[0];
  
  for (let i = 1; i < pixels.length; i++) {
    const k = pixels[i];
    const key = indexBuffer + ',' + k;
    
    if (codeTable[key] !== undefined) {
      indexBuffer = key;
    } else {
      outputCode(typeof indexBuffer === 'string' ? codeTable[indexBuffer] : indexBuffer);
      
      if (nextCode <= 4095) {
        codeTable[key] = nextCode++;
        
        if (nextCode > maxCode && codeSize < 12) {
          codeSize++;
          maxCode = (1 << codeSize) - 1;
        }
      } else {
        // Table full, reset
        outputCode(clearCode);
        codeSize = minCodeSize + 1;
        nextCode = eofCode + 1;
        maxCode = (1 << codeSize) - 1;
        codeTable = {};
        for (let j = 0; j < clearCode; j++) {
          codeTable[j] = j;
        }
      }
      
      indexBuffer = k;
    }
  }
  
  // Output remaining
  outputCode(typeof indexBuffer === 'string' ? codeTable[indexBuffer] : indexBuffer);
  outputCode(eofCode);
  
  // Flush remaining bits
  if (bufferBits > 0) {
    outputBytes.push(buffer & 0xff);
  }
  
  // Write as sub-blocks (max 255 bytes each)
  output.writeByte(minCodeSize);
  
  let pos = 0;
  while (pos < outputBytes.length) {
    const blockSize = Math.min(255, outputBytes.length - pos);
    output.writeByte(blockSize);
    for (let i = 0; i < blockSize; i++) {
      output.writeByte(outputBytes[pos++]);
    }
  }
  
  output.writeByte(0); // Block terminator
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

  if (!images || images.length < 2) {
    throw new Error('Need at least 2 images to create a GIF');
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Parse background color
  const bgHex = backgroundColor.replace('#', '');
  const bgR = parseInt(bgHex.substr(0, 2), 16) || 255;
  const bgG = parseInt(bgHex.substr(2, 2), 16) || 255;
  const bgB = parseInt(bgHex.substr(4, 2), 16) || 255;

  if (onProgress) onProgress(5);

  // Load all images first
  const loadedImages = [];
  for (let i = 0; i < images.length; i++) {
    const src = images[i];
    if (!src) continue;
    
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = src;
      });
      loadedImages.push(img);
    } catch (e) {
      console.warn('Failed to load image:', i, e);
    }
    
    if (onProgress) onProgress(5 + Math.round((i / images.length) * 20));
  }

  if (loadedImages.length < 2) {
    throw new Error('Failed to load enough images (need at least 2)');
  }

  if (onProgress) onProgress(30);

  // Create color palette
  const palette = createWebSafePalette();

  // Start building GIF
  const output = new ByteArray();
  
  // GIF Header
  output.writeString('GIF89a');
  
  // Logical Screen Descriptor
  output.writeShort(width);
  output.writeShort(height);
  output.writeByte(0xf7); // Global color table, 256 colors, 8 bits
  output.writeByte(0);    // Background color index
  output.writeByte(0);    // Pixel aspect ratio

  // Global Color Table (256 colors = 768 bytes)
  for (let i = 0; i < 256; i++) {
    output.writeByte(palette[i][0]); // R
    output.writeByte(palette[i][1]); // G
    output.writeByte(palette[i][2]); // B
  }

  // NETSCAPE2.0 Extension for looping
  output.writeByte(0x21); // Extension introducer
  output.writeByte(0xff); // Application extension
  output.writeByte(11);   // Block size
  output.writeString('NETSCAPE2.0');
  output.writeByte(3);    // Sub-block size
  output.writeByte(1);    // Sub-block ID
  output.writeShort(0);   // Loop count (0 = infinite)
  output.writeByte(0);    // Block terminator

  if (onProgress) onProgress(35);

  // Add each frame
  for (let frameIndex = 0; frameIndex < loadedImages.length; frameIndex++) {
    const img = loadedImages[frameIndex];
    
    // Clear canvas with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate cover fit dimensions
    const imgRatio = img.naturalWidth / img.naturalHeight;
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
    
    // Draw image
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = new Uint8Array(width * height);
    
    // Map each pixel to palette index
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      pixels[i / 4] = findClosestColor(r, g, b, palette);
    }

    // Graphic Control Extension
    output.writeByte(0x21); // Extension introducer
    output.writeByte(0xf9); // Graphic control label
    output.writeByte(4);    // Block size
    output.writeByte(0x00); // Disposal method: none
    output.writeShort(Math.round(delay / 10)); // Delay in centiseconds
    output.writeByte(0);    // Transparent color index (not used)
    output.writeByte(0);    // Block terminator

    // Image Descriptor
    output.writeByte(0x2c); // Image separator
    output.writeShort(0);   // Left position
    output.writeShort(0);   // Top position
    output.writeShort(width);
    output.writeShort(height);
    output.writeByte(0);    // No local color table

    // LZW Encoded Image Data
    lzwEncode(pixels, 8, output);

    if (onProgress) {
      onProgress(35 + Math.round(((frameIndex + 1) / loadedImages.length) * 60));
    }
  }

  // GIF Trailer
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
