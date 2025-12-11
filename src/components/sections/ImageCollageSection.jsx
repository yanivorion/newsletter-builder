import React from 'react';
import { getPresetById } from '../../lib/collagePresets';

function ImageCollageSection({ 
  layout, 
  images = [], 
  gap, 
  imageHeight, 
  backgroundColor, 
  focalPoints = [],
  imageBackgrounds = [],  // Per-image background colors (for cutouts)
  imageOverlays = []      // Per-image overlay colors with opacity
}) {
  const preset = getPresetById(layout) || getPresetById('featured-left');
  const containerStyle = {
    backgroundColor: backgroundColor || '#FFFFFF',
    padding: '16px'
  };

  if (!preset) {
    return (
      <div style={containerStyle}>
        <p>Invalid layout</p>
      </div>
    );
  }

  const { preview } = preset;
  const rows = preview.length;
  const cols = preview[0].length;
  const gapPx = gap || 8;

  // Process cells to get unique cell definitions with their spans
  const processedCells = [];
  const rendered = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = preview[r][c];
      
      if (rendered.has(cellId)) continue;
      
      let colSpan = 1;
      let rowSpan = 1;
      
      while (c + colSpan < cols && preview[r][c + colSpan] === cellId) {
        colSpan++;
      }
      
      while (r + rowSpan < rows && preview[r + rowSpan]?.[c] === cellId) {
        rowSpan++;
      }
      
      rendered.add(cellId);
      
      processedCells.push({
        id: cellId,
        col: c + 1,
        row: r + 1,
        colSpan,
        rowSpan,
        imageIndex: cellId - 1
      });
    }
  }

  return (
    <div style={containerStyle}>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, ${imageHeight / rows}px)`,
          gap: `${gapPx}px`
        }}
      >
        {processedCells.map((cell) => {
          const image = images?.[cell.imageIndex];
          const focalPoint = focalPoints?.[cell.imageIndex] || { x: 50, y: 50 };
          const imageBg = imageBackgrounds?.[cell.imageIndex] || null;
          const overlay = imageOverlays?.[cell.imageIndex] || null;
          
          return (
            <div
              key={cell.id}
              style={{
                gridColumn: `${cell.col} / span ${cell.colSpan}`,
                gridRow: `${cell.row} / span ${cell.rowSpan}`,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: imageBg || '#f4f4f5',
                minHeight: '80px',
                position: 'relative'
              }}
            >
              {image ? (
                <>
                  <img 
                    src={image} 
                    alt={`Image ${cell.id}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: imageBg ? 'contain' : 'cover',
                      objectPosition: `${focalPoint.x}% ${focalPoint.y}%`,
                      display: 'block'
                    }}
                  />
                  {/* Overlay */}
                  {overlay && overlay.color && overlay.opacity > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: overlay.color,
                        opacity: overlay.opacity / 100,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </>
              ) : (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a1a1aa',
                    fontSize: '12px',
                    gap: '4px'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span>{cell.id}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ImageCollageSection;
