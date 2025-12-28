import React, { useState } from 'react';
import { Image, GripHorizontal, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Inline draggable spacer for edit mode
function InlineSpacerHandle({ value, onChange, min = 0, max = 100, label, isEditing }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const startYRef = React.useRef(0);
  const startValueRef = React.useRef(0);

  const handleMouseDown = React.useCallback((e) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startYRef.current;
      const newValue = Math.min(max, Math.max(min, startValueRef.current + deltaY));
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [value, onChange, min, max, isEditing]);

  if (!isEditing) {
    // Just render the spacing
    return <div style={{ height: `${value}px` }} />;
  }

  const showHandle = isDragging || isHovered;

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center select-none transition-all group/spacer",
        "cursor-ns-resize"
      )}
      style={{ height: `${Math.max(value, 16)}px`, minHeight: '16px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Always visible indicator dots */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1 opacity-30 group-hover/spacer:opacity-0 transition-opacity">
        <div className="w-1 h-1 rounded-full bg-white" />
        <div className="w-1 h-1 rounded-full bg-white" />
        <div className="w-1 h-1 rounded-full bg-white" />
      </div>
      
      {/* Visual spacer line on hover */}
      <div 
        className={cn(
          "absolute inset-x-8 top-1/2 -translate-y-1/2 h-[2px] rounded-full transition-all",
          showHandle ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
        }}
      />
      
      {/* Handle pill */}
      <div 
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10",
          "flex items-center gap-1 px-2.5 py-1 rounded-full",
          "text-[10px] font-semibold whitespace-nowrap",
          "transition-all duration-150",
          showHandle 
            ? "opacity-100 bg-white text-zinc-800 shadow-xl scale-100" 
            : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <GripHorizontal className="w-3.5 h-3.5 text-zinc-400" />
        <span>{value}px</span>
        {label && <span className="text-zinc-400 ml-1">{label}</span>}
      </div>
    </div>
  );
}

// Font stack for Hebrew text
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif";

function HeaderSection({ 
  backgroundColor, 
  gradientEnd, 
  backgroundType = 'gradient',
  backgroundImage,
  overlayColor = '#000000',
  overlayOpacity = 0,
  logo, 
  logoWidth = 120,
  logoHeight = 'auto',
  logoAlignment = 'center',
  logoOffsetY = 0,
  // Hero image (below logo)
  heroImage,
  heroImageWidth = '100%',
  heroImageHeight = 200,
  heroImageFit = 'cover',
  showHeroPlaceholder = true,
  // Title - can be a simple string OR segments for multi-styled title
  title, 
  titleSegments = null, // Array of { id, text, fontWeight, fontStyle, color }
  useTitleSegments = false, // Enable/disable segmented title mode
  titleFontSize = 28,
  titleFontWeight = '700',
  titleFontStyle = 'normal',
  titleLetterSpacing = '-0.02em',
  titleLineHeight = 1.2,
  titleAlign = 'center', // left, center, right
  subtitle,
  subtitleFontSize = 16,
  subtitleFontWeight = '400',
  subtitleLetterSpacing = '0',
  subtitleLineHeight = 1.4,
  showDateBadge = false,
  dateBadgeText = 'JULY 2025',
  dateBadgeBg = '#04D1FC',
  dateBadgeColor = '#FFFFFF',
  dateBadgeOffsetX = 0,
  dateBadgeOffsetY = 0,
  textColor = '#FFFFFF',
  fontFamily = 'Noto Sans Hebrew', // Font family prop
  // Spacing controls (inner padding)
  paddingTop = 48,
  paddingBottom = 48,
  paddingHorizontal = 24,
  spacingLogoToHero = 20,
  spacingHeroToTitle = 24,
  spacingTitleToSubtitle = 8,
  // Outer container (wrapper)
  outerBackgroundColor = 'transparent',
  outerPaddingTop = 0,
  outerPaddingRight = 0,
  outerPaddingBottom = 0,
  outerPaddingLeft = 0,
  borderRadius = 0,
  // Edit mode
  isEditing = false,
  onSpacingChange,
  onUpdate, // For updating segments
  // Resize
  minHeight,
  verticalAlign = 'center' // top, center, bottom
}) {
  const [editingSegment, setEditingSegment] = useState(null);
  // Determine font stack based on selected font family
  const getFontStack = (family) => {
    const stacks = {
      'Noto Sans Hebrew': HEBREW_FONT_STACK,
      'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
      'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif"
    };
    return stacks[family] || HEBREW_FONT_STACK;
  };
  
  const fontStack = getFontStack(fontFamily);
  const handleSpacingChange = (field, value) => {
    if (onSpacingChange) {
      onSpacingChange(field, value);
    }
  };

  // Determine background style based on type
  let backgroundStyle = {};
  if (backgroundType === 'image' && backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else if (backgroundType === 'gradient' || gradientEnd) {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${backgroundColor || '#04D1FC'} 0%, ${gradientEnd || '#17A298'} 100%)`
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

  // Check if we have outer padding/wrapper
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

  const headerStyle = {
    ...backgroundStyle,
    paddingLeft: `${paddingHorizontal}px`,
    paddingRight: `${paddingHorizontal}px`,
    textAlign: 'center',
    color: textColor,
    position: 'relative',
    overflow: 'hidden',
    minHeight: minHeight ? `${minHeight}px` : undefined,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: alignMap[verticalAlign] || 'center',
    borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined
  };

  const logoContainerStyle = {
    textAlign: logoAlignment,
    transform: logoOffsetY !== 0 ? `translateY(${logoOffsetY}px)` : undefined
  };

  const logoStyle = {
    width: `${logoWidth}px`,
    height: logoHeight === 'auto' ? 'auto' : `${logoHeight}px`,
    maxWidth: '100%',
    display: 'inline-block',
    objectFit: 'contain'
  };

  const heroContainerStyle = {
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const heroImageStyle = {
    width: heroImageWidth,
    height: `${heroImageHeight}px`,
    objectFit: heroImageFit,
    display: 'block',
    margin: '0 auto',
    borderRadius: '8px'
  };

  const heroPlaceholderStyle = {
    width: '100%',
    height: `${heroImageHeight}px`,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '2px dashed rgba(255,255,255,0.3)'
  };

  const titleStyle = {
    fontFamily: fontStack, 
    fontSize: `${titleFontSize}px`, 
    fontWeight: titleFontWeight,
    fontStyle: titleFontStyle,
    margin: '0',
    letterSpacing: titleLetterSpacing,
    lineHeight: titleLineHeight,
    color: textColor
  };

  // Segmented title container style
  const segmentedTitleContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: titleAlign === 'center' ? 'center' : titleAlign === 'right' ? 'flex-end' : 'flex-start',
    alignItems: 'baseline',
    gap: '0',
    fontFamily: fontStack,
    fontSize: `${titleFontSize}px`,
    letterSpacing: titleLetterSpacing,
    lineHeight: titleLineHeight,
    margin: '0'
  };

  // Handle segment text change
  const handleSegmentChange = (segmentId, field, value) => {
    if (!onUpdate || !titleSegments) return;
    const newSegments = titleSegments.map(seg =>
      seg.id === segmentId ? { ...seg, [field]: value } : seg
    );
    onUpdate({ titleSegments: newSegments });
  };

  // Add a new segment
  const addSegment = () => {
    if (!onUpdate) return;
    const newSegment = {
      id: `seg-${Date.now()}`,
      text: 'Text',
      fontWeight: '400',
      fontStyle: 'normal',
      color: textColor
    };
    const currentSegments = titleSegments || [];
    onUpdate({ titleSegments: [...currentSegments, newSegment], useTitleSegments: true });
  };

  // Remove a segment
  const removeSegment = (segmentId) => {
    if (!onUpdate || !titleSegments || titleSegments.length <= 1) return;
    onUpdate({ titleSegments: titleSegments.filter(seg => seg.id !== segmentId) });
  };

  // Render a single segment
  const renderSegment = (segment) => {
    const segmentStyle = {
      fontWeight: segment.fontWeight || '400',
      fontStyle: segment.fontStyle || 'normal',
      color: segment.color || textColor,
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
              width: `${Math.max(60, segment.text.length * (titleFontSize * 0.6))}px`
            }}
          />
        </span>
      );
    }

    return (
      <span
        key={segment.id}
        style={segmentStyle}
        className={isEditing ? 'cursor-pointer hover:bg-white/10 rounded px-1 transition-colors group relative' : ''}
        onClick={() => isEditing && setEditingSegment(segment.id)}
        title={isEditing ? 'Click to edit text' : ''}
      >
        {segment.text}
        {isEditing && titleSegments && titleSegments.length > 1 && (
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

  // Render title (simple or segmented)
  const renderTitle = () => {
    if (useTitleSegments && titleSegments && titleSegments.length > 0) {
      return (
        <div style={segmentedTitleContainerStyle}>
          {titleSegments.map((segment) => renderSegment(segment))}
          {isEditing && (
            <button
              onClick={addSegment}
              className="ml-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              title="Add text segment"
              style={{ fontSize: '14px' }}
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      );
    }
    
    // Simple title
    return (
      <h1 style={titleStyle}>
        {title}
      </h1>
    );
  };

  const dateBadgeStyle = {
    position: 'absolute',
    bottom: `${16 + dateBadgeOffsetY}px`,
    right: `${16 + dateBadgeOffsetX}px`,
    backgroundColor: dateBadgeBg,
    color: dateBadgeColor,
    padding: '6px 14px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: fontStack,
    letterSpacing: '0.05em'
  };

  // Only show hero if there's an actual image, OR if in editing mode with placeholder enabled
  const showHero = heroImage || (isEditing && showHeroPlaceholder);
  
  // Check if there's any text content
  const hasTitle = (title && title.trim().length > 0) || (useTitleSegments && titleSegments && titleSegments.length > 0);
  const hasSubtitle = subtitle && subtitle.trim().length > 0;
  const hasAnyContent = logo || showHero || hasTitle || hasSubtitle;

  const headerContent = (
    <div style={headerStyle}>
      {/* Background overlay */}
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
      
      {/* Content wrapper with z-index */}
      <div style={{ position: 'relative', zIndex: 2 }}>
      {/* Top Padding Handle - only show if there's any content */}
      {hasAnyContent && (
      <InlineSpacerHandle
        value={paddingTop}
        onChange={(v) => handleSpacingChange('paddingTop', v)}
        min={8}
        max={120}
        isEditing={isEditing}
      />
      )}

      {logo && (
        <>
          <div style={logoContainerStyle}>
            <img 
              src={logo} 
              alt="Logo" 
              style={logoStyle}
            />
          </div>
          
          {/* Logo to Hero/Title Spacing Handle - show if there's something after logo */}
          {(showHero || hasTitle || hasSubtitle) && (
            <InlineSpacerHandle
              value={showHero ? spacingLogoToHero : spacingHeroToTitle}
              onChange={(v) => handleSpacingChange(showHero ? 'spacingLogoToHero' : 'spacingHeroToTitle', v)}
              min={0}
              max={80}
              isEditing={isEditing}
            />
          )}
        </>
      )}

      {/* Hero Image Section */}
      {showHero && (
        <>
          <div style={heroContainerStyle}>
            {heroImage ? (
              <img 
                src={heroImage} 
                alt="Hero" 
                style={heroImageStyle}
              />
            ) : (
              <div style={heroPlaceholderStyle}>
                <Image style={{ width: 32, height: 32, opacity: 0.5 }} />
                <span style={{ fontSize: '12px', opacity: 0.6 }}>Hero Image</span>
              </div>
            )}
          </div>
          
          {/* Hero to Title Spacing Handle - only if there's title or subtitle after */}
          {(hasTitle || hasSubtitle) && (
            <InlineSpacerHandle
              value={spacingHeroToTitle}
              onChange={(v) => handleSpacingChange('spacingHeroToTitle', v)}
              min={0}
              max={80}
              isEditing={isEditing}
            />
          )}
        </>
      )}
      
      {hasTitle && renderTitle()}
      
      {/* Title to Subtitle Spacing Handle - only if both exist */}
      {hasTitle && hasSubtitle && (
        <InlineSpacerHandle
          value={spacingTitleToSubtitle}
          onChange={(v) => handleSpacingChange('spacingTitleToSubtitle', v)}
          min={0}
          max={40}
          isEditing={isEditing}
        />
      )}
      
      {hasSubtitle && (
        <p style={{ 
          fontFamily: fontStack, 
          fontSize: `${subtitleFontSize}px`,
          fontWeight: subtitleFontWeight,
          margin: '0',
          opacity: 0.9,
          letterSpacing: subtitleLetterSpacing,
          lineHeight: subtitleLineHeight,
          color: textColor
        }}>
          {subtitle}
        </p>
      )}

      {/* Bottom Padding Handle - only show if there's any content */}
      {hasAnyContent && (
      <InlineSpacerHandle
        value={paddingBottom}
        onChange={(v) => handleSpacingChange('paddingBottom', v)}
        min={8}
        max={120}
        isEditing={isEditing}
      />
      )}

      {showDateBadge && dateBadgeText && (
        <div style={dateBadgeStyle}>
          {dateBadgeText}
        </div>
      )}
      </div>
    </div>
  );

  // If we have outer wrapper settings, wrap the content
  if (hasOuterWrapper) {
    return (
      <div style={outerWrapperStyle}>
        {headerContent}
      </div>
    );
  }

  return headerContent;
}

export default HeaderSection;
