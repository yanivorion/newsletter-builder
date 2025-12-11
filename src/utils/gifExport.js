import html2canvas from 'html2canvas';

// Export a DOM element as animated GIF
export async function exportToGif(element, options = {}) {
  const {
    duration = 3000,    // Total animation duration in ms
    frameRate = 10,     // Frames per second
    quality = 0.8,      // Image quality 0-1
    width = null,       // Output width (null = auto)
    height = null,      // Output height (null = auto)
    onProgress = null   // Progress callback (0-100)
  } = options;

  const frames = Math.ceil(duration / 1000 * frameRate);
  const frameDelay = 1000 / frameRate;
  const capturedFrames = [];

  try {
    // Capture frames
    for (let i = 0; i < frames; i++) {
      if (onProgress) {
        onProgress(Math.round((i / frames) * 50)); // First 50% is capturing
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Higher quality
        width: width || element.offsetWidth,
        height: height || element.offsetHeight,
        logging: false
      });

      capturedFrames.push(canvas.toDataURL('image/png', quality));
      
      // Wait for next frame
      await new Promise(resolve => setTimeout(resolve, frameDelay));
    }

    if (onProgress) {
      onProgress(50);
    }

    // Use gifshot to create GIF
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.gifshot) {
        window.gifshot.createGIF({
          images: capturedFrames,
          gifWidth: width || element.offsetWidth,
          gifHeight: height || element.offsetHeight,
          interval: frameDelay / 1000,
          numFrames: frames,
          frameDuration: 1,
          sampleInterval: 10,
          numWorkers: 2,
          progressCallback: (progress) => {
            if (onProgress) {
              onProgress(50 + Math.round(progress * 50));
            }
          }
        }, (obj) => {
          if (!obj.error) {
            if (onProgress) {
              onProgress(100);
            }
            resolve(obj.image);
          } else {
            reject(new Error(obj.errorMsg));
          }
        });
      } else {
        // Fallback: return first frame as static image
        resolve(capturedFrames[0]);
      }
    });
  } catch (error) {
    console.error('GIF export error:', error);
    throw error;
  }
}

// Simple single-frame capture
export async function captureElement(element) {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 2,
      logging: false
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Capture error:', error);
    throw error;
  }
}

// Download a data URL as file
export function downloadDataUrl(dataUrl, filename = 'export.gif') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default { exportToGif, captureElement, downloadDataUrl };


