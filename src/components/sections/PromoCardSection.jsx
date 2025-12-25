import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

const FONT_STACKS = {
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
  'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif"
};

function PromoCardSection({
  // Content
  title = 'טיפים מאפליקציית Wix',
  description = 'אפשרו לעסקים קטנים לקבל תשלומי Venmo ישירות מהטלפונים של הלקוחות. לאחר חיבור PayPal כספק תשלום, Venmo מופעל אוטומטית בקופה.',
  ctaText = 'למידע נוסף ←',
  ctaUrl = '#',
  image = '',
  // Layout
  layout = 'image-left', // 'image-left', 'image-right', 'image-top', 'no-image', 'text-only'
  contentAlign = 'right', // 'left', 'center', 'right'
  verticalAlign = 'center', // 'top', 'center', 'bottom'
  // Image settings
  imageWidth = 200,
  imageHeight = 180,
  imageFit = 'cover',
  imageRadius = 12,
  showImagePlaceholder = true,
  // Colors
  backgroundColor = '#F5F5F7',
  titleColor = '#1D1D1F',
  descColor = '#666666',
  ctaColor = '#1D1D1F',
  // Typography
  fontFamily = 'Noto Sans Hebrew',
  titleFontSize = 24,
  titleFontWeight = '600',
  descFontSize = 15,
  descFontWeight = '400',
  ctaFontSize = 14,
  ctaFontWeight = '500',
  lineHeight = 1.6,
  // Spacing
  paddingVertical = 32,
  paddingHorizontal = 32,
  contentGap = 24,
  textGap = 12,
  // RTL
  textDirection = 'rtl',
  // CTA style
  showCta = true,
  ctaStyle = 'link', // 'link', 'button'
  ctaButtonBg = '#1D1D1F',
  ctaButtonColor = '#FFFFFF',
  // Border
  showBorder = false,
  borderColor = '#E5E5E5',
  borderRadius = 0,
  // Divider
  dividerBottom = false,
  dividerColor = '#E5E5E5',
  dividerThickness = 1,
  // Edit mode
  isSelected = false,
  onTextChange,
  onImageUpload
}) {
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  const [editingField, setEditingField] = useState(null);
  const editRef = useRef(null);
  const fileInputRef = useRef(null);

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
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editingField]);

  const handleImageClick = () => {
    if (isSelected && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isHorizontal = layout === 'image-left' || layout === 'image-right';
  const showImage = layout !== 'text-only' && layout !== 'no-image';
  const isImageFirst = layout === 'image-left' || layout === 'image-top';
  const isRTL = textDirection === 'rtl';

  // In RTL mode, we need to flip 'left' and 'right' to achieve visual alignment
  // User picks "left" = they want content on the LEFT side of the screen
  const getVisualTextAlign = () => {
    if (contentAlign === 'center') return 'center';
    if (isRTL) {
      // In RTL, CSS 'left' = visual right, CSS 'right' = visual left
      return contentAlign === 'left' ? 'right' : 'left';
    }
    return contentAlign;
  };

  const getVisualAlignItems = () => {
    if (contentAlign === 'center') return 'center';
    if (isRTL) {
      // In RTL, flex-start = visual right, flex-end = visual left
      return contentAlign === 'left' ? 'flex-end' : 'flex-start';
    }
    return contentAlign === 'left' ? 'flex-start' : 'flex-end';
  };

  const getVisualMargin = () => {
    if (contentAlign === 'center') return '0 auto';
    if (isRTL) {
      // In RTL, margin-right auto = visual left, margin-left auto = visual right
      return contentAlign === 'left' ? '0 0 0 auto' : '0 auto 0 0';
    }
    return contentAlign === 'left' ? '0 auto 0 0' : '0 0 0 auto';
  };

  const containerStyle = {
    backgroundColor,
    padding: `${paddingVertical}px ${paddingHorizontal}px`,
    fontFamily: fontStack,
    direction: textDirection,
    borderBottom: dividerBottom ? `${dividerThickness}px solid ${dividerColor}` : 'none',
    border: showBorder ? `1px solid ${borderColor}` : 'none',
    borderRadius: borderRadius ? `${borderRadius}px` : 0
  };

  const contentWrapperStyle = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
    gap: `${contentGap}px`,
    maxWidth: '800px',
    margin: getVisualMargin()
  };

  const imageContainerStyle = {
    flexShrink: 0,
    width: isHorizontal ? `${imageWidth}px` : '100%',
    height: `${imageHeight}px`,
    borderRadius: `${imageRadius}px`,
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isSelected ? 'pointer' : 'default',
    order: isImageFirst ? 0 : 1
  };

  const textContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: `${textGap}px`,
    textAlign: getVisualTextAlign(),
    alignItems: getVisualAlignItems()
  };

  const titleStyle = {
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    margin: 0,
    lineHeight: 1.3,
    cursor: isSelected ? 'text' : 'default'
  };

  const descStyle = {
    fontSize: `${descFontSize}px`,
    fontWeight: descFontWeight,
    color: descColor,
    margin: 0,
    lineHeight,
    cursor: isSelected ? 'text' : 'default',
    maxWidth: contentAlign === 'center' ? '500px' : 'none'
  };

  const ctaLinkStyle = {
    fontSize: `${ctaFontSize}px`,
    fontWeight: ctaFontWeight,
    color: ctaColor,
    textDecoration: 'none',
    cursor: isSelected ? 'text' : 'pointer',
    display: 'inline-block',
    marginTop: '4px'
  };

  const ctaButtonStyle = {
    fontSize: `${ctaFontSize}px`,
    fontWeight: ctaFontWeight,
    color: ctaButtonColor,
    backgroundColor: ctaButtonBg,
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: isSelected ? 'text' : 'pointer',
    display: 'inline-block',
    marginTop: '8px',
    border: 'none'
  };

  const renderImage = () => {
    if (!showImage) return null;

    return (
      <div style={imageContainerStyle} onClick={handleImageClick}>
        {image ? (
          <img 
            src={image} 
            alt={title}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: imageFit 
            }} 
          />
        ) : showImagePlaceholder ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '8px',
            color: '#999'
          }}>
            <ImageIcon size={32} strokeWidth={1.5} />
            {isSelected && <span style={{ fontSize: '11px' }}>Click to add image</span>}
          </div>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  const renderContent = () => (
    <div style={textContainerStyle}>
      {/* Title */}
      <h3
        ref={editingField === 'title' ? editRef : null}
        contentEditable={editingField === 'title'}
        suppressContentEditableWarning
        onDoubleClick={(e) => handleDoubleClick('title', e)}
        onBlur={() => editingField === 'title' && handleBlur('title')}
        onKeyDown={(e) => editingField === 'title' && handleKeyDown('title', e)}
        style={titleStyle}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        ref={editingField === 'description' ? editRef : null}
        contentEditable={editingField === 'description'}
        suppressContentEditableWarning
        onDoubleClick={(e) => handleDoubleClick('description', e)}
        onBlur={() => editingField === 'description' && handleBlur('description')}
        onKeyDown={(e) => editingField === 'description' && handleKeyDown('description', e)}
        style={descStyle}
      >
        {description}
      </p>

      {/* CTA */}
      {showCta && (
        ctaStyle === 'button' ? (
          <button
            ref={editingField === 'ctaText' ? editRef : null}
            contentEditable={editingField === 'ctaText'}
            suppressContentEditableWarning
            onDoubleClick={(e) => handleDoubleClick('ctaText', e)}
            onBlur={() => editingField === 'ctaText' && handleBlur('ctaText')}
            onKeyDown={(e) => editingField === 'ctaText' && handleKeyDown('ctaText', e)}
            style={ctaButtonStyle}
          >
            {ctaText}
          </button>
        ) : (
          <a
            ref={editingField === 'ctaText' ? editRef : null}
            contentEditable={editingField === 'ctaText'}
            suppressContentEditableWarning
            onDoubleClick={(e) => handleDoubleClick('ctaText', e)}
            onBlur={() => editingField === 'ctaText' && handleBlur('ctaText')}
            onKeyDown={(e) => editingField === 'ctaText' && handleKeyDown('ctaText', e)}
            href={ctaUrl}
            style={ctaLinkStyle}
          >
            {ctaText}
          </a>
        )
      )}
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        {isImageFirst ? (
          <>
            {renderImage()}
            {renderContent()}
          </>
        ) : (
          <>
            {renderContent()}
            {renderImage()}
          </>
        )}
      </div>

      {/* Edit hint */}
      {isSelected && !editingField && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: 'rgba(0,0,0,0.4)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          Double-click text to edit
        </div>
      )}
    </div>
  );
}

export default PromoCardSection;

