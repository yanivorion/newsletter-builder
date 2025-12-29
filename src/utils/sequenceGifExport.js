// GIF Export using gifshot library with robust image handling
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

// Helper to load an image with timeout and CORS handling
function loadImage(src, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let timedOut = false;
    
    const timer = setTimeout(() => {
      timedOut = true;
      reject(new Error('Image load timeout'));
    }, timeout);
    
    img.onload = () => {
      if (!timedOut) {
        clearTimeout(timer);
        resolve(img);
      }
    };
    
    img.onerror = (e) => {
      if (!timedOut) {
        clearTimeout(timer);
        // Try without crossOrigin if it failed
        if (img.crossOrigin) {
          const img2 = new Image();
          img2.onload = () => resolve(img2);
          img2.onerror = () => reject(new Error('Failed to load image'));
          img2.src = src;
        } else {
          reject(new Error('Failed to load image'));
        }
      }
    };
    
    // Only set crossOrigin for non-data URLs
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
  });
}

// Draw image on canvas with cover fit
function drawImageCover(ctx, img, width, height, backgroundColor) {
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  
  if (imgW <= 0 || imgH <= 0) {
    console.warn('Invalid image dimensions:', imgW, imgH);
    return;
  }
  
  const imgRatio = imgW / imgH;
  const canvasRatio = width / height;
  let dw, dh, dx, dy;

  if (imgRatio > canvasRatio) {
    // Image is wider - scale by height
    dh = height;
    dw = height * imgRatio;
    dx = (width - dw) / 2;
    dy = 0;
  } else {
    // Image is taller - scale by width
    dw = width;
    dh = width / imgRatio;
    dx = 0;
    dy = (height - dh) / 2;
  }

  try {
    ctx.drawImage(img, dx, dy, dw, dh);
  } catch (e) {
    console.warn('Error drawing image:', e);
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

  console.log('Starting GIF export with', images?.length, 'images');
  console.log('Options:', { width, height, delay, backgroundColor });

  if (!images || images.length < 2) {
    throw new Error('Need at least 2 images to create a GIF');
  }

  // Filter valid images
  const validImages = images.filter(src => src && typeof src === 'string' && src.length > 0);
  
  if (validImages.length < 2) {
    throw new Error('Need at least 2 valid images');
  }

  if (onProgress) onProgress(5);

  // Load gifshot library
  try {
    await loadGifshot();
  } catch (e) {
    console.error('Failed to load gifshot:', e);
    throw new Error('Failed to load GIF library. Please try again.');
  }

  if (onProgress) onProgress(10);

  // Create canvas to pre-process images with cover fit
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Process each image to apply cover fit
  const processedImages = [];
  
  for (let i = 0; i < validImages.length; i++) {
    const src = validImages[i];
    
    try {
      console.log(`Processing image ${i + 1}/${validImages.length}`);
      
      // Load image
      const img = await loadImage(src);
      
      console.log(`Image ${i + 1} loaded:`, img.naturalWidth, 'x', img.naturalHeight);

      // Draw with cover fit
      drawImageCover(ctx, img, width, height, backgroundColor);

      // Get as data URL - use JPEG for smaller size and better compatibility
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      if (dataUrl && dataUrl.length > 100) {
        processedImages.push(dataUrl);
        console.log(`Image ${i + 1} processed successfully`);
      } else {
        console.warn(`Image ${i + 1} produced invalid data URL`);
      }
      
    } catch (e) {
      console.warn(`Failed to process image ${i + 1}:`, e.message);
    }

    if (onProgress) {
      onProgress(10 + Math.round((i / validImages.length) * 50));
    }
  }

  console.log(`Processed ${processedImages.length} images successfully`);

  if (processedImages.length < 2) {
    throw new Error(`Only ${processedImages.length} images could be processed. Need at least 2.`);
  }

  if (onProgress) onProgress(65);

  // Use gifshot to create the GIF
  return new Promise((resolve, reject) => {
    console.log('Creating GIF with gifshot...');
    
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
          onProgress(65 + Math.round(progress * 30));
        }
      }
    }, (result) => {
      if (result.error) {
        console.error('Gifshot error:', result.errorMsg);
        reject(new Error(result.errorMsg || 'GIF creation failed'));
        return;
      }

      console.log('GIF created successfully');
      
      if (!result.image) {
        reject(new Error('No image data returned'));
        return;
      }

      if (onProgress) onProgress(100);

      try {
        // Convert base64 to blob
        const base64 = result.image.split(',')[1];
        if (!base64) {
          reject(new Error('Invalid image data format'));
          return;
        }
        
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        
        const blob = new Blob([array], { type: 'image/gif' });
        console.log('GIF blob size:', blob.size, 'bytes');
        resolve(blob);
      } catch (e) {
        console.error('Error converting to blob:', e);
        reject(new Error('Failed to convert GIF data'));
      }
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
