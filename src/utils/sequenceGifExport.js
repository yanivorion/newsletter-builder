// GIF encoder for image sequences using gifenc library
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

// Export images as animated GIF using gifenc
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

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const loadedImages = await Promise.all(
    images.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (onProgress) onProgress(Math.round((index / images.length) * 30));
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

  const gif = GIFEncoder();
  
  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    const imgRatio = img.width / img.height;
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
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const rgba = new Uint8Array(imageData.data.buffer);
    const palette = quantize(rgba, 256, { format: 'rgb444' });
    const index = applyPalette(rgba, palette);
    
    gif.writeFrame(index, width, height, { palette, delay, dispose: 1 });
          
    if (onProgress) onProgress(30 + Math.round((i / validImages.length) * 60));
        }

  gif.finish();
          if (onProgress) onProgress(100);

  const buffer = gif.bytes();
  const blob = new Blob([buffer], { type: 'image/gif' });
  
  return { blob, width, height };
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

// Export marquee as animated GIF - matches MarqueeSection exactly
export async function exportMarqueeAsGif(section, options = {}) {
  const {
    width = 600,
    onProgress = null
  } = options;

  const marqueeText = section.marqueeText || section.text || 'Special Announcement';
  const separator = section.separator || '•';
  const backgroundColor = section.backgroundColor || '#04D1FC';
  const textColor = section.textColor || '#FFFFFF';
  const fontSize = section.fontSize || 16;
  const fontWeight = section.fontWeight || '500';
  const paddingVertical = section.paddingVertical || 12;

  // Height = top padding + text line + bottom padding
  // Text line height is approximately fontSize (no extra line-height)
  const displayHeight = paddingVertical + fontSize + paddingVertical;

  const gifDuration = 4000;
  const frameCount = 30;
  const frameDelay = Math.round(gifDuration / frameCount);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = displayHeight;
  const ctx = canvas.getContext('2d');

  const singleUnit = `${marqueeText}   ${separator}   `;
  const fullText = singleUnit.repeat(8);
  
  const fontFamily = "'Poppins', 'Helvetica Neue', Arial, sans-serif";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const unitWidth = ctx.measureText(singleUnit).width;
  const scrollDistance = unitWidth;

  if (onProgress) onProgress(10);

  const gif = GIFEncoder();

  for (let i = 0; i < frameCount; i++) {
    const progress = i / frameCount;
    const offset = progress * scrollDistance;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, displayHeight);

    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const y = displayHeight / 2;
    const totalTextWidth = ctx.measureText(fullText).width;
    
    for (let j = -2; j <= Math.ceil(width / totalTextWidth) + 2; j++) {
      const x = -offset + (j * totalTextWidth);
      ctx.fillText(fullText, x, y);
    }

    const imageData = ctx.getImageData(0, 0, width, displayHeight);
    const rgba = new Uint8Array(imageData.data.buffer);
    const palette = quantize(rgba, 256, { format: 'rgb444' });
    const index = applyPalette(rgba, palette);
    
    gif.writeFrame(index, width, displayHeight, { palette, delay: frameDelay, dispose: 1 });

    if (onProgress) onProgress(10 + Math.round((i / frameCount) * 85));
  }

  gif.finish();
  if (onProgress) onProgress(100);

  const buffer = gif.bytes();
  const blob = new Blob([buffer], { type: 'image/gif' });
  
  return { blob, width, height: displayHeight };
}
