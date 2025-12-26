import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

// Font stack for Hebrew text
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif";

// Default segments for "ElectreoNews" style
const DEFAULT_SEGMENTS = [
  { id: '1', text: 'Electreo', fontWeight: '700', fontStyle: 'normal', color: '#FFFFFF' },
  { id: '2', text: 'News', fontWeight: '300', fontStyle: 'italic', color: '#FFFFFF' }
];

function StyledTitleSection({
  // Background
  backgroundColor = '#7B68EE',
  gradientEnd = '#9370DB',
  backgroundType = 'gradient',
  backgroundImage,
  overlayColor = '#000000',
  overlayOpacity = 0,
  // Logo
  logo,
  logoWidth = 120,
  logoAlignment = 'center',
  // Title segments - each segment has: text, fontWeight, fontStyle, color
  segments = DEFAULT_SEGMENTS,
  // Global title styling
  fontSize = 72,
  letterSpacing = '-0.02em',
  lineHeight = 1.1,
  textAlign = 'center',
  fontFamily = 'Poppins',
  // Subtitle
  subtitle,
  subtitleFontSize = 18,
  subtitleFontWeight = '400',
  subtitleColor = '#FFFFFF',
  subtitleOpacity = 0.8,
  // Spacing (inner padding)
  paddingTop = 48,
  paddingBottom = 48,
  paddingHorizontal = 24,
  spacingLogoToTitle = 24,
  spacingTitleToSubtitle = 16,
  // Outer container (wrapper)
  outerBackgroundColor = 'transparent',
  outerPaddingTop = 0,
  outerPaddingRight = 0,
  outerPaddingBottom = 0,
  outerPaddingLeft = 0,
  borderRadius = 0,
  // Edit mode
  isEditing = false,
  onUpdate,
  // Text direction
  textDirection = 'ltr'
}) {
  const [editingSegment, setEditingSegment] = useState(null);

  // Get font stack
  const getFontStack = (family) => {
    const stacks = {
      'Noto Sans Hebrew': HEBREW_FONT_STACK,
      'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      'Montserrat': "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      'Playfair Display': "'Playfair Display', Georgia, serif",
      'Bebas Neue': "'Bebas Neue', Impact, sans-serif",
      'Space Grotesk': "'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    };
    return stacks[family] || `'${family}', sans-serif`;
  };

  // Determine background style
  let backgroundStyle = {};
  if (backgroundType === 'image' && backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else if (backgroundType === 'gradient' || gradientEnd) {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${backgroundColor} 0%, ${gradientEnd} 100%)`
    };
  } else {
    backgroundStyle = { backgroundColor };
  }

  // Check if we have outer wrapper settings
  const hasOuterWrapper = outerBackgroundColor !== 'transparent' || 
    outerPaddingTop > 0 || outerPaddingRight > 0 || 
    outerPaddingBottom > 0 || outerPaddingLeft > 0 ||
    borderRadius > 0;

  const outerWrapperStyle = hasOuterWrapper ? {
    backgroundColor: outerBackgroundColor,
    paddingTop: `${outerPaddingTop}px`,
    paddingRight: `${outerPaddingRight}px`,
    paddingBottom: `${outerPaddingBottom}px`,
    paddingLeft: `${outerPaddingLeft}px`
  } : {};

  const containerStyle = {
    ...backgroundStyle,
    padding: `${paddingTop}px ${paddingHorizontal}px ${paddingBottom}px`,
    textAlign,
    position: 'relative',
    overflow: 'hidden',
    direction: textDirection,
    borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined
  };

  const titleContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
    alignItems: 'baseline',
    gap: '0',
    fontFamily: getFontStack(fontFamily),
    fontSize: `${fontSize}px`,
    letterSpacing,
    lineHeight
  };

  const handleSegmentChange = (segmentId, field, value) => {
    if (!onUpdate) return;
    const newSegments = segments.map(seg =>
      seg.id === segmentId ? { ...seg, [field]: value } : seg
    );
    onUpdate({ segments: newSegments });
  };

  const addSegment = () => {
    if (!onUpdate) return;
    const newSegment = {
      id: `seg-${Date.now()}`,
      text: 'Text',
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#FFFFFF'
    };
    onUpdate({ segments: [...segments, newSegment] });
  };

  const removeSegment = (segmentId) => {
    if (!onUpdate || segments.length <= 1) return;
    onUpdate({ segments: segments.filter(seg => seg.id !== segmentId) });
  };

  const renderSegment = (segment, index) => {
    const segmentStyle = {
      fontWeight: segment.fontWeight || '400',
      fontStyle: segment.fontStyle || 'normal',
      color: segment.color || '#FFFFFF',
      display: 'inline',
      position: 'relative'
    };

    if (isEditing && editingSegment === segment.id) {
      return (
        <span key={segment.id} style={segmentStyle} className="group relative">
          <input
            type="text"
            value={segment.text}
            onChange={(e) => handleSegmentChange(segment.id, 'text', e.target.value)}
            onBlur={() => setEditingSegment(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingSegment(null)}
            autoFocus
            style={{
              ...segmentStyle,
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '4px',
              padding: '0 8px',
              outline: 'none',
              minWidth: '60px',
              width: `${Math.max(60, segment.text.length * (fontSize * 0.6))}px`
            }}
          />
        </span>
      );
    }

    return (
      <span
        key={segment.id}
        style={segmentStyle}
        className={isEditing ? 'cursor-pointer hover:bg-white/10 rounded px-1 transition-colors' : ''}
        onClick={() => isEditing && setEditingSegment(segment.id)}
        title={isEditing ? 'Click to edit text' : ''}
      >
        {segment.text}
        {isEditing && (
          <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); removeSegment(segment.id); }}
              className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              title="Remove segment"
            >
              <Trash2 size={10} />
            </button>
          </span>
        )}
      </span>
    );
  };

  const content = (
    <div style={containerStyle}>
      {/* Background overlay for images */}
      {backgroundType === 'image' && backgroundImage && overlayOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100,
            zIndex: 1,
            borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        {logo && (
          <>
            <div style={{ textAlign: logoAlignment, marginBottom: `${spacingLogoToTitle}px` }}>
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: `${logoWidth}px`,
                  height: 'auto',
                  display: 'inline-block'
                }}
              />
            </div>
          </>
        )}

        {/* Styled Title */}
        <div style={titleContainerStyle}>
          {segments.map((segment, index) => renderSegment(segment, index))}
          
          {/* Add segment button in edit mode */}
          {isEditing && (
            <button
              onClick={addSegment}
              className="ml-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              title="Add text segment"
              style={{ fontSize: '16px' }}
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p style={{
            fontFamily: getFontStack(fontFamily),
            fontSize: `${subtitleFontSize}px`,
            fontWeight: subtitleFontWeight,
            color: subtitleColor,
            opacity: subtitleOpacity,
            margin: `${spacingTitleToSubtitle}px 0 0`,
            letterSpacing: '0'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  // If we have outer wrapper settings, wrap the content
  if (hasOuterWrapper) {
    return (
      <div style={outerWrapperStyle}>
        {content}
      </div>
    );
  }

  return content;
}

export default StyledTitleSection;

