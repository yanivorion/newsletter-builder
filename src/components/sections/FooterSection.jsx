import React from 'react';

// Font stacks mapping
const FONT_STACKS = {
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
  'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif"
};

function FooterSection({ 
  backgroundColor, 
  gradientEnd, 
  text, 
  color, 
  fontSize, 
  padding,
  textDirection = 'rtl',
  textAlign = 'right',
  fontFamily = 'Noto Sans Hebrew'
}) {
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  
  const footerStyle = {
    background: `linear-gradient(135deg, ${backgroundColor || '#120F0F'} 0%, ${gradientEnd || '#5E5E5E'} 100%)`,
    padding: `${padding || 36}px 24px`,
    textAlign: textAlign || 'center',
    direction: textDirection || 'rtl',
    color: color || '#FFFFFF',
    fontFamily: fontStack,
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
