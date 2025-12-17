import React from 'react';

function FooterSection({ 
  backgroundColor, 
  gradientEnd, 
  text, 
  color, 
  fontSize, 
  padding,
  textDirection = 'rtl',
  textAlign = 'right'
}) {
  const footerStyle = {
    background: `linear-gradient(135deg, ${backgroundColor || '#120F0F'} 0%, ${gradientEnd || '#5E5E5E'} 100%)`,
    padding: `${padding || 36}px 24px`,
    textAlign: textAlign || 'center',
    direction: textDirection || 'rtl',
    color: color || '#FFFFFF',
    fontFamily: 'Inter, -apple-system, sans-serif',
    fontSize: `${fontSize || 13}px`,
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap'
  };

  return (
    <div style={footerStyle}>
      {text || 'שם החברה\nפרטי התקשרות'}
    </div>
  );
}

export default FooterSection;
