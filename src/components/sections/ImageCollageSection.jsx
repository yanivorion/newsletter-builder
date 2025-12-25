import React, { useRef } from 'react';
import { getPresetById } from '../../lib/collagePresets';

function ImageCollageSection({ 
  layout, 
  images = [], 
  gap, 
  imageHeight, 
  backgroundColor, 
  focalPoints = [],
  imageBackgrounds = [],  // Per-image background colors (for cutouts)
  imageOverlays = [],     // Per-image overlay colors with opacity
  minHeight,
  backgroundType = 'solid',
  backgroundImage,
  gradientEnd,
  overlayColor = '#000000',
  overlayOpacity = 0,
  padding: sectionPadding,
  // Interactive props
  isSelected = false,
  onImageReplace
}) {
  const fileInputRefs = useRef({});
  const preset = getPresetById(layout) || getPresetById('featured-left');
  
  // Determine background style based on type
  let backgroundStyle = {};
  if (backgroundType === 'image' && backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else if (backgroundType === 'gradient' && gradientEnd) {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${backgroundColor || '#FFFFFF'} 0%, ${gradientEnd} 100%)`
    };
  } else {
    backgroundStyle = {
      backgroundColor: backgroundColor || '#FFFFFF'
    };
  }

  const padding = sectionPadding ?? 20;
  const actualImageHeight = imageHeight || 200;
  
  // Container style - always auto height based on content
  const containerStyle = {
    ...backgroundStyle,
    padding: `${padding}px`,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };
  
  // Grid style - height controlled by imageHeight prop
  const gridStyle = {
    position: 'relative',
    zIndex: 2,
    height: `${actualImageHeight}px`
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
      {/* Background overlay */}
      {backgroundType === 'image' && backgroundImage && overlayOpacity > 0 && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100,
            zIndex: 1
          }}
        />
      )}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${gapPx}px`,
          ...gridStyle
        }}
      >
        {processedCells.map((cell) => {
          const image = images?.[cell.imageIndex];
          const focalPoint = focalPoints?.[cell.imageIndex] || { x: 50, y: 50 };
          const imageBg = imageBackgrounds?.[cell.imageIndex] || null;
          const overlay = imageOverlays?.[cell.imageIndex] || null;
          
          const handleImageClick = (e) => {
            if (isSelected && onImageReplace) {
              e.stopPropagation();
              // Trigger file input for this specific image
              const input = fileInputRefs.current[cell.imageIndex];
              if (input) input.click();
            }
          };
          
          const handleFileChange = (e) => {
            const file = e.target.files?.[0];
            if (file && onImageReplace) {
              const reader = new FileReader();
              reader.onload = (event) => {
                onImageReplace(cell.imageIndex, event.target.result);
              };
              reader.readAsDataURL(file);
            }
            e.target.value = ''; // Reset for next selection
          };
          
          return (
            <div
              key={cell.id}
              onClick={handleImageClick}
              style={{
                gridColumn: `${cell.col} / span ${cell.colSpan}`,
                gridRow: `${cell.row} / span ${cell.rowSpan}`,
                borderRadius: '0px',
                overflow: 'hidden',
                backgroundColor: imageBg || 'transparent',
                position: 'relative',
                cursor: isSelected ? 'pointer' : 'default'
              }}
            >
              {/* Hidden file input for this cell */}
              <input
                ref={el => fileInputRefs.current[cell.imageIndex] = el}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
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
                  {/* Click to replace hint when selected */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 500,
                        gap: '4px'
                      }}
                      className="image-replace-hint"
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Click to replace</span>
                    </div>
                  )}
                </>
              ) : (
                <div 
                  onClick={handleImageClick}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a1a1aa',
                    fontSize: '12px',
                    gap: '4px',
                    cursor: isSelected ? 'pointer' : 'default',
                    backgroundColor: isSelected ? 'rgba(4, 209, 252, 0.1)' : 'transparent',
                    border: isSelected ? '2px dashed #04D1FC' : 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span>{isSelected ? 'Click to add' : cell.id}</span>
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
