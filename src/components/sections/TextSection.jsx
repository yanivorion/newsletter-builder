import React, { useRef, useEffect, useState, useCallback } from 'react';

const FONT_STACKS = {
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
};

function TextSection({ 
  content, 
  textAlign, 
  direction, 
  fontFamily, 
  fontSize, 
  color, 
  backgroundColor, 
  padding,
  backgroundType = 'solid',
  backgroundImage,
  gradientEnd,
  overlayColor = '#000000',
  overlayOpacity = 0,
  letterSpacing,
  lineHeight: customLineHeight,
  verticalAlign = 'center', // top, center, bottom
  // Inline editing props
  isSelected = false,
  onContentChange,
  minHeight
}) {
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Poppins'];
  const editableRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content || '');
  
  // Sync local content when prop changes (from panel)
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content || '');
    }
  }, [content, isEditing]);
  
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
  
  // Map vertical align to flexbox
  const alignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  };

  const containerStyle = {
    ...backgroundStyle,
    padding: `${padding || 40}px 20px`,
    position: 'relative',
    overflow: 'hidden',
    minHeight: minHeight ? `${minHeight}px` : undefined,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: alignMap[verticalAlign] || 'center'
  };

  const textStyle = {
    fontFamily: fontStack,
    fontSize: `${fontSize || 16}px`,
    color: color || '#333333',
    textAlign: textAlign || 'center',
    direction: direction || 'ltr',
    lineHeight: customLineHeight || 1.6,
    letterSpacing: letterSpacing || 'normal',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    zIndex: 2,
    outline: isEditing ? '2px dashed #04D1FC' : 'none',
    outlineOffset: '4px',
    cursor: isSelected ? 'text' : 'default',
    minHeight: '1em',
    borderRadius: '4px'
  };

  // Handle double-click to enter edit mode
  const handleDoubleClick = useCallback((e) => {
    if (onContentChange) {
      e.stopPropagation();
      setIsEditing(true);
    }
  }, [onContentChange]);

  // Handle blur to save content
  const handleBlur = useCallback(() => {
    if (isEditing && editableRef.current && onContentChange) {
      const newContent = editableRef.current.innerText;
      onContentChange(newContent);
      setIsEditing(false);
    }
  }, [isEditing, onContentChange]);

  // Handle input to update local content
  const handleInput = useCallback(() => {
    if (editableRef.current) {
      setLocalContent(editableRef.current.innerText);
    }
  }, []);

  // Handle key events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      editableRef.current?.blur();
    }
  }, []);

  // Focus when entering edit mode and set content
  useEffect(() => {
    if (isEditing && editableRef.current) {
      // Set the content first
      editableRef.current.innerText = localContent;
      editableRef.current.focus();
      // Place cursor at end
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
  }, [isSelected, isEditing, handleBlur]);

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
        ref={editableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        style={textStyle}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      >
        {isEditing ? null : (localContent || 'Enter your text here...')}
      </div>
      {/* Edit hint when selected but not editing */}
      {isSelected && !isEditing && onContentChange && (
        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: 'rgba(0,0,0,0.4)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '2px 8px',
            borderRadius: '4px',
            zIndex: 10
          }}
        >
          Double-click to edit
        </div>
      )}
    </div>
  );
}

export default TextSection;
