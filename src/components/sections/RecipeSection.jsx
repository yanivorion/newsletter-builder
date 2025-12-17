import React, { useRef, useState, useEffect } from 'react';
import { ImageIcon, Upload } from 'lucide-react';

function RecipeSection({ 
  title, 
  image, 
  ingredients, 
  instructions, 
  backgroundColor, 
  backgroundImage, 
  backgroundType = 'solid',
  gradientEnd,
  overlayColor, 
  overlayOpacity,
  minHeight,
  imageHeight = 200,
  imageFit = 'cover',
  // Inline editing props
  isSelected = false,
  onTitleChange,
  onIngredientsChange,
  onInstructionsChange
}) {
  const titleRef = useRef(null);
  const [editingField, setEditingField] = useState(null);

  // Determine background style
  let backgroundStyle = {};
  if (backgroundType === 'image' && backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else if (backgroundType === 'gradient' && gradientEnd) {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${backgroundColor || '#FFFFFF'} 0%, ${gradientEnd} 100%)`
    };
  } else {
    backgroundStyle = {
      backgroundColor: backgroundColor || '#FFFFFF'
    };
  }

  const containerStyle = {
    ...backgroundStyle,
    padding: '30px 20px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: minHeight ? `${minHeight}px` : undefined
  };

  const contentStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2
  };

  // Check if content exists
  const hasTitle = title && title.trim().length > 0;
  const hasImage = image && image.trim && image.trim().length > 0;
  const hasIngredients = ingredients && ingredients.trim().length > 0;
  const hasInstructions = instructions && instructions.trim().length > 0;
  const hasContentAfterTitle = hasImage || hasIngredients || hasInstructions;
  const hasContentAfterImage = hasIngredients || hasInstructions;
  const hasContentAfterIngredients = hasInstructions;

  const titleStyle = {
    fontFamily: 'Noto Sans Hebrew, sans-serif',
    fontSize: '24px',
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: hasContentAfterTitle ? '20px' : 0,
    direction: 'rtl'
  };

  const imageContainerStyle = {
    width: '100%',
    height: `${imageHeight}px`,
    marginBottom: hasContentAfterImage ? '20px' : 0,
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative'
  };

  const textBlockStyle = {
    fontFamily: 'Noto Sans Hebrew, sans-serif',
    fontSize: '14px',
    color: '#333333',
    lineHeight: '1.8',
    direction: 'rtl',
    textAlign: 'right',
    marginBottom: '15px',
    whiteSpace: 'pre-wrap'
  };

  const placeholderStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4F4F5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#A1A1AA',
    border: '2px dashed #E4E4E7',
    borderRadius: '8px'
  };

  return (
    <div style={containerStyle}>
      {/* Background overlay */}
      {backgroundImage && overlayOpacity > 0 && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor || '#000000',
            opacity: (overlayOpacity || 0) / 100,
            zIndex: 1
          }}
        />
      )}
      
      <div style={contentStyle}>
        {hasTitle && <h2 style={titleStyle}>{title}</h2>}
        
        {(hasImage || isSelected) && (
          <div style={imageContainerStyle}>
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
            ) : isSelected ? (
              <div style={placeholderStyle}>
                <ImageIcon size={48} strokeWidth={1} />
                <span style={{ marginTop: '8px', fontSize: '14px' }}>Click to add recipe image</span>
              </div>
            ) : null}
          </div>
        )}

        {hasIngredients && (
          <div style={{ ...textBlockStyle, marginBottom: hasContentAfterIngredients ? '15px' : 0 }}>
            {ingredients}
          </div>
        )}

        {hasInstructions && (
          <div style={{ ...textBlockStyle, marginBottom: 0 }}>
            {instructions}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeSection;
