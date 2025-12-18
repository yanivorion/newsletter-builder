import React, { useState, useEffect, forwardRef } from 'react';
import { iconMap } from '../IconPicker';

const MarqueeSection = forwardRef(function MarqueeSection({
  // New simple props
  selectedIcon = null,
  text = 'Special Announcement',
  // Legacy props (items) for backwards compatibility
  items,
  // Style props
  speed = 30,
  direction = 'left',
  backgroundColor = '#04D1FC',
  textColor = '#FFFFFF',
  fontSize = 16,
  fontWeight = '500',
  letterSpacing = '0.02em',
  paddingVertical = 12,
  separator = '•',
  pauseOnHover = true,
}, ref) {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Number of repetitions for seamless loop
  const repetitions = 8;

  const keyframes = `
    @keyframes marqueeScrollLeft {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes marqueeScrollRight {
      from { transform: translateX(-50%); }
      to { transform: translateX(0); }
    }
  `;

  const containerStyle = {
    backgroundColor,
    padding: `${paddingVertical}px 0`,
    overflow: 'hidden',
    position: 'relative'
  };

  const trackStyle = {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    animation: prefersReducedMotion 
      ? 'none' 
      : `marqueeScroll${direction === 'left' ? 'Left' : 'Right'} ${speed}s linear infinite`,
    animationPlayState: (pauseOnHover && isPaused) ? 'paused' : 'running',
    willChange: 'transform'
  };

  const itemStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 20px',
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing,
    color: textColor,
    fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif"
  };

  const separatorStyle = {
    opacity: 0.5,
    fontSize: `${fontSize}px`,
    color: textColor,
    padding: '0 8px'
  };

  const iconStyle = {
    width: `${fontSize + 2}px`,
    height: `${fontSize + 2}px`,
    flexShrink: 0
  };

  // Render the selected icon
  const renderIcon = () => {
    if (!selectedIcon) return null;
    
    // Check if it's a react-icons icon
    const IconComponent = iconMap[selectedIcon];
      if (IconComponent) {
        return <IconComponent style={iconStyle} />;
      }
    
    // Check if it's an emoji (short string)
    if (selectedIcon.length <= 4) {
      return <span style={{ fontSize: `${fontSize + 2}px` }}>{selectedIcon}</span>;
    }
    
    return null;
  };

  // Create array of items for the marquee
  const marqueeItems = Array(repetitions * 2).fill(null);

  return (
    <div 
      ref={ref}
      style={containerStyle}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      className="marquee-section"
    >
      <style>{keyframes}</style>
      <div style={trackStyle}>
        {marqueeItems.map((_, index) => (
          <React.Fragment key={index}>
              <span style={itemStyle}>
              {renderIcon()}
              <span>{text}</span>
              </span>
            {index < marqueeItems.length - 1 && (
                <span style={separatorStyle}>{separator}</span>
              )}
            </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default MarqueeSection;
