// GIF Export using gifshot library
// This library is loaded from CDN and handles all the complexity of GIF encoding

let gifshotLoaded = false;
let gifshotPromise = null;

// Load gifshot library from CDN
function loadGifshot() {
  if (gifshotLoaded && window.gifshot) {
    return Promise.resolve();
  }
  
  if (gifshotPromise) {
    return gifshotPromise;
  }
  
  gifshotPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.gifshot) {
      gifshotLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/gifshot@0.4.5/dist/gifshot.min.js';
    script.onload = () => {
      gifshotLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load gifshot library'));
    document.head.appendChild(script);
  });
  
  return gifshotPromise;
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

  // Filter valid images
  const validImages = images.filter(src => src && typeof src === 'string' && src.length > 0);
  
  if (validImages.length < 2) {
    throw new Error('Need at least 2 valid images');
  }

  if (onProgress) onProgress(10);

  // Load gifshot library
  try {
    await loadGifshot();
  } catch (e) {
    console.error('Failed to load gifshot:', e);
    throw new Error('Failed to load GIF library. Please try again.');
  }

  if (onProgress) onProgress(20);

  // Create canvas to pre-process images with cover fit
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Process each image to apply cover fit
  const processedImages = [];
  
  for (let i = 0; i < validImages.length; i++) {
    const src = validImages[i];
    
    try {
      // Load image
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });

      // Clear canvas with background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Calculate cover fit
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      
      if (imgW > 0 && imgH > 0) {
        const imgRatio = imgW / imgH;
        const canvasRatio = width / height;
        let dw, dh, dx, dy;

        if (imgRatio > canvasRatio) {
          dh = height;
          dw = height * imgRatio;
          dx = (width - dw) / 2;
          dy = 0;
        } else {
          dw = width;
          dh = width / imgRatio;
          dx = 0;
          dy = (height - dh) / 2;
        }

        ctx.drawImage(img, dx, dy, dw, dh);
      }

      // Get as data URL
      processedImages.push(canvas.toDataURL('image/png'));
      
    } catch (e) {
      console.warn('Failed to process image', i, e);
    }

    if (onProgress) {
      onProgress(20 + Math.round((i / validImages.length) * 40));
    }
  }

  if (processedImages.length < 2) {
    throw new Error('Failed to process enough images');
  }

  if (onProgress) onProgress(65);

  // Use gifshot to create the GIF
  return new Promise((resolve, reject) => {
    window.gifshot.createGIF({
      images: processedImages,
      gifWidth: width,
      gifHeight: height,
      interval: delay / 1000, // gifshot uses seconds
      numFrames: processedImages.length,
      frameDuration: 1,
      sampleInterval: 10,
      numWorkers: 2,
      progressCallback: (progress) => {
        if (onProgress) {
          onProgress(65 + Math.round(progress * 35));
        }
      }
    }, (result) => {
      if (result.error) {
        reject(new Error(result.errorMsg || 'GIF creation failed'));
        return;
      }

      if (onProgress) onProgress(100);

      // Convert base64 to blob
      const base64 = result.image.split(',')[1];
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      
      const blob = new Blob([array], { type: 'image/gif' });
      resolve(blob);
    });
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
