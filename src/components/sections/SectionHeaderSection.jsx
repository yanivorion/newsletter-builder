import React, { useRef, useState, useEffect } from 'react';

function SectionHeaderSection({ 
  text, 
  backgroundColor, 
  color, 
  fontSize, 
  fontWeight, 
  letterSpacing, 
  padding,
  backgroundType = 'solid',
  backgroundImage,
  gradientEnd,
  overlayColor = '#000000',
  overlayOpacity = 0,
  minHeight,
  verticalAlign = 'center', // top, center, bottom
  textDirection = 'rtl',
  textAlign = 'right',
  // Inline editing props
  isSelected = false,
  onContentChange
}) {
  const editableRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  // Determine background style
  let backgroundStyle = {};
  if (backgroundType === 'image' && backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else if (backgroundType === 'gradient' && gradientEnd) {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${backgroundColor || '#04D1FC'} 0%, ${gradientEnd} 100%)`
    };
  } else {
    backgroundStyle = {
      backgroundColor: backgroundColor || '#04D1FC'
    };
  }

  // Map vertical align to flexbox
  const alignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  };

  const headerStyle = {
    ...backgroundStyle,
    color: color || '#FFFFFF',
    padding: `${padding || 14}px 24px`,
    textAlign: textAlign || 'center',
    direction: textDirection || 'rtl',
    fontFamily: 'Inter, -apple-system, sans-serif',
    fontSize: `${fontSize || 14}px`,
    fontWeight: fontWeight || 600,
    letterSpacing: letterSpacing || '0.08em',
    textTransform: 'uppercase',
    position: 'relative',
    overflow: 'hidden',
    minHeight: minHeight ? `${minHeight}px` : undefined,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: alignMap[verticalAlign] || 'center',
    alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'
  };

  const textStyle = {
    position: 'relative',
    zIndex: 2,
    outline: 'none',
    cursor: isSelected ? 'text' : 'default'
  };

  // Handle double-click to enter edit mode
  const handleDoubleClick = (e) => {
    if (onContentChange) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  // Handle blur to save content
  const handleBlur = () => {
    if (isEditing && editableRef.current && onContentChange) {
      const newContent = editableRef.current.innerText;
      onContentChange(newContent);
      setIsEditing(false);
    }
  };

  // Focus when entering edit mode
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  // Exit edit mode when section is deselected
  useEffect(() => {
    if (!isSelected && isEditing) {
      handleBlur();
    }
  }, [isSelected]);

  return (
    <div style={headerStyle}>
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
        ref={editableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        style={textStyle}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
      >
        {text || 'SECTION TITLE'}
      </div>
      {/* Edit hint */}
      {isSelected && !isEditing && onContentChange && (
        <div 
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.6)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '1px 6px',
            borderRadius: '3px',
            zIndex: 10
          }}
        >
          Double-click to edit
        </div>
      )}
    </div>
  );
}

export default SectionHeaderSection;
