import React, { useState, useRef, useCallback, useEffect } from 'react';

const FONT_STACKS = {
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
  'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif"
};

function AccentTextSection({
  tag = 'מילות פתיחה',
  tagBg = '#04D1FC',
  tagColor = '#FFFFFF',
  tagPosition = 'sidebar-right', // 'sidebar-right', 'sidebar-left', 'top-right', 'top-left', 'top-center'
  tagHeight = 'auto', // 'auto' or number in px
  tagGap = 24, // gap between tag and content
  content = 'החודש ציינו את יום הטבעונות הבינלאומי עם ארוחת חומוס טעימה במיוחד, הזדמנות נהדרת להתכנס יחד, לטעום, ליהנות ולחוות את האוכל טבעוני.\n\nכמובן שגם חגגנו ימי הולדת לילידי נובמבר, הייתה אווירה חמימה ומשמחת. כמו תמיד היה כיף לראות את כולם מתאחדים כדי לחגוג יחד.',
  accentColor = '#04D1FC',
  showAccentBar = false,
  accentPosition = 'right',
  accentWidth = 4,
  backgroundColor = '#FFFFFF',
  textColor = '#1D1D1F',
  fontFamily = 'Noto Sans Hebrew',
  fontSize = 16,
  fontWeight = '400',
  lineHeight = 1.7,
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
  const isSidebarTag = tagPosition === 'sidebar-right' || tagPosition === 'sidebar-left';

  const containerStyle = {
    backgroundColor,
    padding: `${paddingVertical}px ${paddingHorizontal}px`,
    fontFamily: fontStack,
    position: 'relative',
    borderBottom: dividerBottom ? `${dividerThickness}px solid ${dividerColor}` : 'none'
  };

  // Main layout: tag position is VISUAL (not affected by RTL)
  // For sidebar-right: tag on right visually, content on left
  // For sidebar-left: tag on left visually, content on right
  const outerLayoutStyle = {
    display: 'flex',
    flexDirection: 'row', // Always LTR order for layout
    alignItems: 'flex-start',
    gap: `${tagGap}px`,
  };

  const contentWrapperStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: showAccentBar ? '20px' : '0',
  };

  const innerContentStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: showAccentBar ? '16px' : '0',
  };

  const accentStyle = {
    width: `${accentWidth}px`,
    backgroundColor: accentColor,
    borderRadius: '2px',
    flexShrink: 0,
    minHeight: '100%'
  };

  const textContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  // Sidebar tag style (positioned on side)
  const sidebarTagStyle = {
    backgroundColor: tagBg,
    color: tagColor,
    padding: '12px 20px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    alignSelf: 'stretch', // Stretch to match content height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tagHeight === 'auto' ? 'auto' : `${tagHeight}px`,
    height: tagHeight === 'auto' ? 'auto' : `${tagHeight}px`,
    cursor: isSelected ? 'text' : 'default',
    outline: editingField === 'tag' ? '2px dashed #04D1FC' : 'none'
  };

  // Top tag style (positioned above content)
  const getTopTagContainerStyle = () => {
    let justifyContent = 'flex-end';
    if (tagPosition === 'top-left') justifyContent = 'flex-start';
    if (tagPosition === 'top-center') justifyContent = 'center';
    return {
      display: 'flex',
      justifyContent,
      marginBottom: '16px',
    };
  };

  const topTagStyle = {
    display: 'inline-block',
    backgroundColor: tagBg,
    color: tagColor,
    padding: '8px 20px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isSelected ? 'text' : 'default',
    outline: editingField === 'tag' ? '2px dashed #04D1FC' : 'none'
  };

  const textStyle = {
    fontSize: `${fontSize}px`,
    fontWeight,
    color: textColor,
    lineHeight,
    textAlign,
    direction: textDirection, // Apply RTL/LTR only to text content
    margin: 0,
    whiteSpace: 'pre-wrap',
    cursor: isSelected ? 'text' : 'default',
    outline: editingField === 'content' ? '2px dashed #04D1FC' : 'none',
    borderRadius: '4px',
  };

  const editableProps = (field) => ({
    ref: editingField === field ? editRef : null,
    contentEditable: editingField === field,
    suppressContentEditableWarning: true,
    onDoubleClick: (e) => handleDoubleClick(field, e),
    onBlur: () => handleBlur(field),
    onKeyDown: (e) => handleKeyDown(field, e)
  });

  // Render tag based on position
  const renderSidebarTag = () => {
    if (!isSidebarTag || (!hasTag && !isSelected)) return null;
    return (
      <span {...editableProps('tag')} style={sidebarTagStyle}>
        {tag || (isSelected ? 'תג...' : '')}
      </span>
    );
  };

  const renderTopTag = () => {
    if (isSidebarTag || (!hasTag && !isSelected)) return null;
    return (
      <div style={getTopTagContainerStyle()}>
        <span {...editableProps('tag')} style={topTagStyle}>
          {tag || (isSelected ? 'תג...' : '')}
        </span>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={outerLayoutStyle}>
        {/* Sidebar tag on left */}
        {tagPosition === 'sidebar-left' && renderSidebarTag()}
        
        {/* Main content area */}
        <div style={contentWrapperStyle}>
          {/* Top-positioned tag */}
          {renderTopTag()}
          
          {/* Content with optional accent bar */}
          <div style={innerContentStyle}>
            {/* Accent bar on left */}
            {showAccentBar && accentPosition === 'left' && <div style={accentStyle} />}
            
            <div style={textContentStyle}>
              {(hasContent || isSelected) && (
                <p {...editableProps('content')} style={textStyle}>
                  {content || (isSelected ? 'הכנס טקסט כאן...' : '')}
                </p>
              )}
            </div>
            
            {/* Accent bar on right */}
            {showAccentBar && accentPosition === 'right' && <div style={accentStyle} />}
          </div>
        </div>
        
        {/* Sidebar tag on right */}
        {tagPosition === 'sidebar-right' && renderSidebarTag()}
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
