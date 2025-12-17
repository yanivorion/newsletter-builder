import React, { useState, useRef, useCallback, useEffect } from 'react';

const FONT_STACKS = {
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
  'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif"
};

function AccentTextSection({
  tag = 'ילידי נובמבר',
  tagBg = '#04D1FC',
  tagColor = '#FFFFFF',
  content = 'אולג יודקביץ, אלדר בלנק, אסטבן ספולבדה אוליבה,\nדור הופמן, דין מרקוס, יניב אליהו ורועי גלבוע...\nמזל טוב! מי ייתן וכל משאלות ליבכם יתגשמו:)',
  accentColor = '#FF6B6B',
  accentPosition = 'right', // 'left' or 'right'
  accentWidth = 4,
  backgroundColor = '#FFFFFF',
  textColor = '#1D1D1F',
  fontFamily = 'Noto Sans Hebrew',
  fontSize = 16,
  fontWeight = '400',
  lineHeight = 1.6,
  paddingVertical = 32,
  paddingHorizontal = 24,
  // RTL support
  textAlign = 'right',
  textDirection = 'rtl',
  // Divider
  dividerBottom = false,
  dividerColor = '#E5E5E5',
  dividerThickness = 1,
  // Inline editing
  isSelected = false,
  onTextChange
}) {
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  const [editingField, setEditingField] = useState(null);
  const editRef = useRef(null);

  const handleDoubleClick = useCallback((field, e) => {
    if (!onTextChange) return;
    e.stopPropagation();
    setEditingField(field);
  }, [onTextChange]);

  const handleBlur = useCallback((field) => {
    if (editRef.current && onTextChange) {
      const newValue = editRef.current.innerText.trim();
      onTextChange(field, newValue);
    }
    setEditingField(null);
  }, [onTextChange]);

  const handleKeyDown = useCallback((field, e) => {
    if (e.key === 'Escape') {
      setEditingField(null);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur(field);
    }
  }, [handleBlur]);

  useEffect(() => {
    if (editingField && editRef.current) {
      editRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingField]);

  useEffect(() => {
    if (!isSelected) setEditingField(null);
  }, [isSelected]);

  const hasTag = tag && tag.trim().length > 0;
  const hasContent = content && content.trim().length > 0;

  const containerStyle = {
    backgroundColor,
    padding: `${paddingVertical}px ${paddingHorizontal}px`,
    fontFamily: fontStack,
    direction: textDirection,
    position: 'relative',
    borderBottom: dividerBottom ? `${dividerThickness}px solid ${dividerColor}` : 'none'
  };

  const innerStyle = {
    display: 'flex',
    flexDirection: textDirection === 'rtl' ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    gap: '20px'
  };

  const accentStyle = {
    width: `${accentWidth}px`,
    backgroundColor: accentColor,
    alignSelf: 'stretch',
    borderRadius: '2px',
    flexShrink: 0
  };

  const contentWrapperStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const tagStyle = {
    display: 'inline-block',
    backgroundColor: tagBg,
    color: tagColor,
    padding: '6px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    alignSelf: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start',
    cursor: isSelected ? 'text' : 'default',
    outline: editingField === 'tag' ? '2px dashed #04D1FC' : 'none'
  };

  const textStyle = {
    fontSize: `${fontSize}px`,
    fontWeight,
    color: textColor,
    lineHeight,
    textAlign,
    margin: 0,
    whiteSpace: 'pre-wrap',
    cursor: isSelected ? 'text' : 'default',
    outline: editingField === 'content' ? '2px dashed #04D1FC' : 'none',
    borderRadius: '4px'
  };

  const editableProps = (field) => ({
    ref: editingField === field ? editRef : null,
    contentEditable: editingField === field,
    suppressContentEditableWarning: true,
    onDoubleClick: (e) => handleDoubleClick(field, e),
    onBlur: () => handleBlur(field),
    onKeyDown: (e) => handleKeyDown(field, e)
  });

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        {accentPosition === 'left' && <div style={accentStyle} />}
        
        <div style={contentWrapperStyle}>
          {(hasTag || isSelected) && (
            <span {...editableProps('tag')} style={tagStyle}>
              {tag || (isSelected ? 'Add tag...' : '')}
            </span>
          )}
          
          {(hasContent || isSelected) && (
            <p {...editableProps('content')} style={textStyle}>
              {content || (isSelected ? 'הכנס טקסט כאן...' : '')}
            </p>
          )}
        </div>
        
        {accentPosition === 'right' && <div style={accentStyle} />}
      </div>
      
      {isSelected && !editingField && onTextChange && (
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

export default AccentTextSection;

