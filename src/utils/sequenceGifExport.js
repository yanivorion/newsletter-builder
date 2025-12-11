// Simple GIF encoder for image sequences
// Uses the GIF format to create animated GIFs from a sequence of images

class GifEncoder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.frames = [];
  }

  addFrame(imageData, delay = 100) {
    this.frames.push({ imageData, delay });
  }

  // Simple GIF generation - creates a downloadable blob
  async render() {
    // For simplicity, we'll create an animated GIF using canvas manipulation
    // This is a basic implementation that works for most use cases
    
    if (this.frames.length === 0) {
      throw new Error('No frames to render');
    }

    // Use the browser's native encoding capabilities
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    // Return the frames as a format that can be converted
    return this.frames;
  }
}

// Export images as animated GIF using a simple approach
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

  // Load all images
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

  // Generate frames as data URLs
  const frames = [];
  
  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate cover fit dimensions
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas ratio
      drawHeight = height;
      drawWidth = height * imgRatio;
      drawX = (width - drawWidth) / 2;
      drawY = 0;
    } else {
      // Image is taller than canvas ratio
      drawWidth = width;
      drawHeight = width / imgRatio;
      drawX = 0;
      drawY = (height - drawHeight) / 2;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    frames.push(canvas.toDataURL('image/png'));
    
    if (onProgress) onProgress(30 + Math.round((i / validImages.length) * 30));
  }

  if (onProgress) onProgress(60);

  // Create animated GIF using gif.js library loaded from CDN
  return new Promise((resolve, reject) => {
    // Load gif.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
    script.onload = async () => {
      try {
        const gif = new window.GIF({
          workers: 2,
          quality: 10,
          width,
          height,
          workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });

        // Add frames
        for (let i = 0; i < validImages.length; i++) {
          const img = validImages[i];
          
          // Redraw on canvas
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
          gif.addFrame(ctx, { copy: true, delay });
          
          if (onProgress) onProgress(60 + Math.round((i / validImages.length) * 20));
        }

        gif.on('progress', (p) => {
          if (onProgress) onProgress(80 + Math.round(p * 20));
        });

        gif.on('finished', (blob) => {
          if (onProgress) onProgress(100);
          resolve(blob);
        });

        gif.render();
      } catch (error) {
        reject(error);
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load GIF library'));
    };
    
    // Check if already loaded
    if (window.GIF) {
      script.onload();
    } else {
      document.head.appendChild(script);
    }
  });
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

