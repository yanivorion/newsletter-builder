import React, { useState, useEffect, forwardRef } from 'react';
import * as LucideIcons from 'lucide-react';

// Map of icon names to components
const iconMap = {
  'star': LucideIcons.Star,
  'heart': LucideIcons.Heart,
  'zap': LucideIcons.Zap,
  'rocket': LucideIcons.Rocket,
  'gift': LucideIcons.Gift,
  'bell': LucideIcons.Bell,
  'check': LucideIcons.Check,
  'award': LucideIcons.Award,
  'trophy': LucideIcons.Trophy,
  'flame': LucideIcons.Flame,
  'sparkles': LucideIcons.Sparkles,
  'crown': LucideIcons.Crown,
  'gem': LucideIcons.Gem,
  'target': LucideIcons.Target,
  'lightbulb': LucideIcons.Lightbulb,
  'megaphone': LucideIcons.Megaphone,
  'party': LucideIcons.PartyPopper,
  'calendar': LucideIcons.Calendar,
  'clock': LucideIcons.Clock,
  'mail': LucideIcons.Mail,
  'send': LucideIcons.Send,
  'thumbsup': LucideIcons.ThumbsUp,
  'users': LucideIcons.Users,
  'trending': LucideIcons.TrendingUp,
  'sun': LucideIcons.Sun,
  'moon': LucideIcons.Moon,
  'cloud': LucideIcons.Cloud,
  'music': LucideIcons.Music,
  'camera': LucideIcons.Camera,
  'coffee': LucideIcons.Coffee,
};

// Parse item to extract icon and text
// Format: "[icon:star] New Feature" or "🎉 New Feature" or just "New Feature"
function parseItem(item) {
  const iconMatch = item.match(/^\[icon:(\w+)\]\s*/);
  if (iconMatch) {
    const iconName = iconMatch[1].toLowerCase();
    const text = item.replace(iconMatch[0], '');
    return { icon: iconName, text, type: 'lucide' };
  }
  
  // Check if starts with emoji
  const emojiMatch = item.match(/^(\p{Emoji})\s*/u);
  if (emojiMatch) {
    return { icon: emojiMatch[1], text: item.replace(emojiMatch[0], ''), type: 'emoji' };
  }
  
  return { icon: null, text: item, type: 'none' };
}

const MarqueeSection = forwardRef(function MarqueeSection({
  items = '🎉 New Announcement,⭐ Special Offer,🚀 Coming Soon',
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
  showSubtitle = false,
  subtitle = ''
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

  const itemsArray = typeof items === 'string' 
    ? items.split(',').map(item => item.trim()).filter(Boolean)
    : items;
  
  // Duplicate for seamless loop
  const duplicatedItems = [...itemsArray, ...itemsArray];

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
    gap: '8px',
    padding: '0 24px',
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing,
    color: textColor,
    fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif"
  };

  const separatorStyle = {
    opacity: 0.5,
    fontSize: `${fontSize}px`,
    color: textColor
  };

  const iconStyle = {
    width: `${fontSize}px`,
    height: `${fontSize}px`,
    flexShrink: 0
  };

  const renderIcon = (parsed) => {
    if (parsed.type === 'lucide' && parsed.icon) {
      const IconComponent = iconMap[parsed.icon];
      if (IconComponent) {
        return <IconComponent style={iconStyle} />;
      }
    }
    if (parsed.type === 'emoji' && parsed.icon) {
      return <span>{parsed.icon}</span>;
    }
    return null;
  };

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
        {duplicatedItems.map((item, index) => {
          const parsed = parseItem(item);
          return (
            <React.Fragment key={`${item}-${index}`}>
              <span style={itemStyle}>
                {renderIcon(parsed)}
                <span>{parsed.text}</span>
              </span>
              {index < duplicatedItems.length - 1 && (
                <span style={separatorStyle}>{separator}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

export default MarqueeSection;
