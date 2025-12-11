import React from 'react';

const FONT_STACKS = {
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
};

function TextSection({ content, textAlign, direction, fontFamily, fontSize, color, backgroundColor, padding }) {
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Poppins'];
  
  const textStyle = {
    backgroundColor: backgroundColor || '#FFFFFF',
    padding: `${padding || 40}px 20px`,
    fontFamily: fontStack,
    fontSize: `${fontSize || 16}px`,
    color: color || '#333333',
    textAlign: textAlign || 'center',
    direction: direction || 'ltr',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  };

  return (
    <div style={textStyle}>
      {content || 'Enter your text here...'}
    </div>
  );
}

export default TextSection;
