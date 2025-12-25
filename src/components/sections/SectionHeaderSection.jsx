import React, { useRef, useState, useEffect } from 'react';

// Font stack for Hebrew text
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif";

// Font stacks mapping
const FONT_STACKS = {
  'Noto Sans Hebrew': HEBREW_FONT_STACK,
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
  'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif"
};

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
  fontFamily = 'Noto Sans Hebrew', // Font family prop
  // Inline editing props
  isSelected = false,
  onContentChange
}) {
  const fontStack = FONT_STACKS[fontFamily] || HEBREW_FONT_STACK;
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

  // Map horizontal align - account for RTL direction
  // In RTL mode, flex-start is on the right, flex-end is on the left
  const getHorizontalAlign = () => {
    const isRtl = (textDirection || 'rtl') === 'rtl';
    if (textAlign === 'center') return 'center';
    // Visual "right" should be flex-start in RTL, flex-end in LTR
    if (textAlign === 'right') return isRtl ? 'flex-start' : 'flex-end';
    // Visual "left" should be flex-end in RTL, flex-start in LTR
    if (textAlign === 'left') return isRtl ? 'flex-end' : 'flex-start';
    return 'center';
  };

  const headerStyle = {
    ...backgroundStyle,
    color: color || '#FFFFFF',
    padding: `${padding || 14}px 24px`,
    textAlign: textAlign || 'center',
    direction: textDirection || 'rtl',
    fontFamily: fontStack,
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
    alignItems: getHorizontalAlign()
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
