import React, { useState, useRef, useCallback, useEffect } from 'react';

const FONT_STACKS = {
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

function AppCardsSection({
  title = 'אפליקציות ואינטגרציות חדשות',
  cards = [
    {
      icon: '🛒',
      iconBg: '#E8FFE8',
      name: 'שם האפליקציה',
      underlineColor: '#FF6B6B',
      description: 'לקוחות יכולים להגדיר כללי כמות למוצרים ספציפיים או לקולקציות שלמות.',
      linkText: 'בדוק את זה',
      linkUrl: '#'
    },
    {
      icon: '🖼️',
      iconBg: '#E8E0FF',
      name: 'תמונות AI',
      underlineColor: '#5856D6',
      description: 'השתמש ב-AI כדי למקם מוצרים על כל רקע וליצור תמונות סטודיו.',
      linkText: 'בדוק את זה',
      linkUrl: '#'
    },
    {
      icon: '↩️',
      iconBg: '#FFE8F0',
      name: 'החזרות',
      underlineColor: '#5856D6',
      description: 'הפוך את תהליך ההחזרה לקל ללקוחות עם דשבורד אחד.',
      linkText: 'בדוק את זה',
      linkUrl: '#'
    }
  ],
  columns = 3,
  backgroundColor = '#F5F5F7',
  cardBackgroundColor = '#FFFFFF',
  textColor = '#1D1D1F',
  descriptionColor = '#86868B',
  linkColor = '#5856D6',
  fontFamily = 'Noto Sans Hebrew',
  titleFontSize = 28,
  nameFontSize = 14,
  descFontSize = 14,
  iconSize = 48,
  paddingVertical = 48,
  paddingHorizontal = 24,
  gap = 16,
  cardPadding = 16,
  cardBorderRadius = 8,
  showBorder = true,
  textAlign = 'right',
  textDirection = 'rtl',
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

  useEffect(() => {
    if (editingField && editRef.current) {
      editRef.current.focus();
    }
  }, [editingField]);

  useEffect(() => {
    if (!isSelected) setEditingField(null);
  }, [isSelected]);

  const containerStyle = {
    backgroundColor,
    padding: `${paddingVertical}px ${paddingHorizontal}px`,
    fontFamily: fontStack,
    direction: textDirection,
  };

  const titleStyle = {
    fontSize: `${titleFontSize}px`,
    fontWeight: '600',
    color: textColor,
    margin: 0,
    marginBottom: '24px',
    textAlign,
    cursor: isSelected ? 'text' : 'default',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  };

  const cardStyle = {
    backgroundColor: cardBackgroundColor,
    borderRadius: `${cardBorderRadius}px`,
    padding: `${cardPadding}px`,
    border: showBorder ? '1px solid #E5E5E7' : 'none',
    textAlign,
  };

  const iconContainerStyle = (bg) => ({
    width: `${iconSize}px`,
    height: `${iconSize}px`,
    borderRadius: '12px',
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${iconSize * 0.5}px`,
    marginBottom: '12px',
  });

  const nameContainerStyle = {
    marginBottom: '12px',
  };

  const nameStyle = {
    fontSize: `${nameFontSize}px`,
    fontWeight: '400',
    color: descriptionColor,
    margin: 0,
    marginBottom: '4px',
    cursor: isSelected ? 'text' : 'default',
  };

  const underlineStyle = (color) => ({
    height: '3px',
    backgroundColor: color,
    borderRadius: '2px',
    width: '60px',
  });

  const descStyle = {
    fontSize: `${descFontSize}px`,
    fontWeight: '400',
    color: textColor,
    margin: 0,
    marginBottom: '12px',
    lineHeight: 1.5,
    cursor: isSelected ? 'text' : 'default',
  };

  const linkStyle = {
    fontSize: `${descFontSize}px`,
    fontWeight: '500',
    color: linkColor,
    textDecoration: 'underline',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: isSelected ? 'text' : 'pointer',
  };

  const editableProps = (field) => ({
    ref: editingField === field ? editRef : null,
    contentEditable: editingField === field,
    suppressContentEditableWarning: true,
    onDoubleClick: (e) => handleDoubleClick(field, e),
    onBlur: () => handleBlur(field),
  });

  return (
    <div style={containerStyle}>
      {title && (
        <h2 
          {...editableProps('title')}
          style={{
            ...titleStyle,
            outline: editingField === 'title' ? '2px dashed #04D1FC' : 'none',
          }}
        >
          {title}
        </h2>
      )}

      <div style={gridStyle}>
        {cards.map((card, index) => (
          <div key={index} style={cardStyle}>
            <div style={iconContainerStyle(card.iconBg)}>
              {card.icon}
            </div>
            <div style={nameContainerStyle}>
              <p 
                {...editableProps(`card-${index}-name`)}
                style={{
                  ...nameStyle,
                  outline: editingField === `card-${index}-name` ? '2px dashed #04D1FC' : 'none',
                }}
              >
                {card.name}
              </p>
              <div style={underlineStyle(card.underlineColor)} />
            </div>
            <p 
              {...editableProps(`card-${index}-description`)}
              style={{
                ...descStyle,
                outline: editingField === `card-${index}-description` ? '2px dashed #04D1FC' : 'none',
              }}
            >
              {card.description}
            </p>
            <a 
              {...editableProps(`card-${index}-linkText`)}
              style={{
                ...linkStyle,
                outline: editingField === `card-${index}-linkText` ? '2px dashed #04D1FC' : 'none',
              }}
              href={editingField ? undefined : card.linkUrl}
            >
              {card.linkText}
              <span>→</span>
            </a>
          </div>
        ))}
      </div>
      
      {isSelected && !editingField && onTextChange && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: 'rgba(0,0,0,0.4)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          Double-click to edit
        </div>
      )}
    </div>
  );
}

export default AppCardsSection;
