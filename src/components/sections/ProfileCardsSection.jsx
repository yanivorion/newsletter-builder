import React, { useState, useRef, useCallback, useEffect } from 'react';

// Minimalistic profile placeholder icon
const ProfilePlaceholderIcon = ({ size = 100, shape = 'circular' }) => {
  const borderRadius = shape === 'circular' ? '50%' : '8px';
  
  return (
    <div 
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        backgroundColor: '#F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 10px'
      }}
    >
      <svg 
        width={size * 0.5} 
        height={size * 0.5} 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="#C0C0C0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    </div>
  );
};

function ProfileCardsSection({ 
  profiles, 
  columns, 
  imageShape, 
  backgroundColor, 
  showName, 
  showTitle,
  backgroundType = 'solid',
  backgroundImage,
  gradientEnd,
  overlayColor = '#000000',
  overlayOpacity = 0,
  minHeight,
  verticalAlign = 'center',
  // Inline editing props
  isSelected = false,
  onTextChange
}) {
  const [editingField, setEditingField] = useState(null);
  const editRef = useRef(null);

  // Handle double-click to start editing
  const handleDoubleClick = useCallback((field, e) => {
    if (!onTextChange) return;
    e.stopPropagation();
    setEditingField(field);
  }, [onTextChange]);

  // Handle blur to save
  const handleBlur = useCallback((field) => {
    if (editRef.current && onTextChange) {
      const newValue = editRef.current.innerText.trim();
      onTextChange(field, newValue);
    }
    setEditingField(null);
  }, [onTextChange]);

  // Handle key events
  const handleKeyDown = useCallback((field, e) => {
    if (e.key === 'Escape') {
      setEditingField(null);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur(field);
    }
  }, [handleBlur]);

  // Focus when editing starts
  useEffect(() => {
    if (editingField && editRef.current) {
      editRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingField]);

  // Exit edit mode when deselected
  useEffect(() => {
    if (!isSelected) setEditingField(null);
  }, [isSelected]);

  // Determine background style based on type
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

  // Map vertical align to flexbox
  const alignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  };

  const containerStyle = {
    ...backgroundStyle,
    padding: '30px 20px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: minHeight ? `${minHeight}px` : undefined,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: alignMap[verticalAlign] || 'center'
  };

  // Column count and profile display logic - must be defined before gridStyle
  const columnCount = columns || 4;
  const existingProfiles = profiles && profiles.length > 0 ? profiles : [];
  
  // Show exactly columnCount profiles - truncate if more, fill with nulls if fewer
  const displayProfiles = [];
  for (let i = 0; i < columnCount; i++) {
    displayProfiles.push(existingProfiles[i] || null);
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
    gap: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const cardStyle = {
    textAlign: 'center'
  };

  const imageStyle = {
    width: '100px',
    height: '100px',
    borderRadius: imageShape === 'circular' ? '50%' : '8px',
    objectFit: 'cover',
    margin: '0 auto 10px',
    display: 'block'
  };

  const nameStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333333',
    margin: '8px 0 4px',
    cursor: isSelected ? 'text' : 'default',
    borderRadius: '4px',
    outline: 'none'
  };

  const titleStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
    color: '#666666',
    margin: '0',
    cursor: isSelected ? 'text' : 'default',
    borderRadius: '4px',
    outline: 'none'
  };

  const editableProps = (field) => ({
    ref: editingField === field ? editRef : null,
    contentEditable: editingField === field,
    suppressContentEditableWarning: true,
    onDoubleClick: (e) => handleDoubleClick(field, e),
    onBlur: () => handleBlur(field),
    onKeyDown: (e) => handleKeyDown(field, e)
  });

  return (
    <div style={containerStyle}>
      {/* Background overlay */}
      {backgroundType === 'image' && backgroundImage && overlayOpacity > 0 && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100,
            zIndex: 1
          }}
        />
      )}
      <div style={{ ...gridStyle, position: 'relative', zIndex: 2 }}>
        {displayProfiles.map((profile, index) => {
          // Calculate profile image background
          let profileImageBg = {};
          if (profile?.bgType === 'solid' && profile?.bgColor) {
            profileImageBg = { backgroundColor: profile.bgColor };
          } else if (profile?.bgType === 'gradient' && profile?.bgGradientStart && profile?.bgGradientEnd) {
            profileImageBg = { 
              background: `linear-gradient(${profile.bgGradientDirection || 'to bottom'}, ${profile.bgGradientStart}, ${profile.bgGradientEnd})`
            };
          }
          
          return (
            <div key={index} style={cardStyle}>
              {profile && profile.image ? (
                <div 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: imageShape === 'circular' ? '50%' : '8px',
                    margin: '0 auto 10px',
                    overflow: 'hidden',
                    position: 'relative',
                    ...profileImageBg
                  }}
                >
                  <img 
                    src={profile.image} 
                    alt={profile.name || `Profile ${index + 1}`} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                </div>
              ) : (
                <ProfilePlaceholderIcon size={100} shape={imageShape} />
              )}
              {showName && (
                <div 
                  {...editableProps(`profile-${index}-name`)}
                  style={{
                    ...nameStyle,
                    outline: editingField === `profile-${index}-name` ? '2px dashed #04D1FC' : 'none'
                  }}
                >
                  {profile?.name || `Name ${index + 1}`}
                </div>
              )}
              {showTitle && (
                <div 
                  {...editableProps(`profile-${index}-title`)}
                  style={{
                    ...titleStyle,
                    outline: editingField === `profile-${index}-title` ? '2px dashed #04D1FC' : 'none'
                  }}
                >
                  {profile?.title || 'Position'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Edit hint */}
      {isSelected && !editingField && onTextChange && (
        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: 'rgba(0,0,0,0.4)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '2px 8px',
            borderRadius: '4px',
            zIndex: 10
          }}
        >
          Double-click to edit
        </div>
      )}
    </div>
  );
}

export default ProfileCardsSection;
