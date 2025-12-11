import React from 'react';

function FooterSection({ backgroundColor, gradientEnd, text, color, fontSize, padding }) {
  const footerStyle = {
    background: `linear-gradient(135deg, ${backgroundColor || '#120F0F'} 0%, ${gradientEnd || '#5E5E5E'} 100%)`,
    padding: `${padding || 36}px 24px`,
    textAlign: 'center',
    color: color || '#FFFFFF',
    fontFamily: 'Inter, -apple-system, sans-serif',
    fontSize: `${fontSize || 13}px`,
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap'
  };

  return (
    <div style={footerStyle}>
      {text || 'Your Company Name\nContact Information'}
    </div>
  );
}

export default FooterSection;
