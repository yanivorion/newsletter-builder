import React from 'react';

function SectionHeaderSection({ text, backgroundColor, color, fontSize, fontWeight, letterSpacing, padding }) {
  const headerStyle = {
    backgroundColor: backgroundColor || '#04D1FC',
    color: color || '#FFFFFF',
    padding: `${padding || 14}px 24px`,
    textAlign: 'center',
    fontFamily: 'Inter, -apple-system, sans-serif',
    fontSize: `${fontSize || 14}px`,
    fontWeight: fontWeight || 600,
    letterSpacing: letterSpacing || '0.08em',
    textTransform: 'uppercase'
  };

  return (
    <div style={headerStyle}>
      {text || 'SECTION TITLE'}
    </div>
  );
}

export default SectionHeaderSection;
