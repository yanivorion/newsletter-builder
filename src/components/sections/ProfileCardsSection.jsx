import React from 'react';

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
  verticalAlign = 'center' // top, center, bottom
}) {
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns || 4}, 1fr)`,
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
    margin: '8px 0 4px'
  };

  const titleStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
    color: '#666666',
    margin: '0'
  };

  const placeholderCount = columns || 4;
  const displayProfiles = profiles && profiles.length > 0 ? profiles : Array(placeholderCount).fill(null);

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
                <div 
                  style={{
                    ...imageStyle,
                    backgroundColor: '#E0E0E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999999',
                    fontSize: '32px'
                  }}
                >
                  👤
                </div>
              )}
              {showName && (
                <div style={nameStyle}>
                  {profile?.name || `Name ${index + 1}`}
                </div>
              )}
              {showTitle && (
                <div style={titleStyle}>
                  {profile?.title || 'Position'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileCardsSection;
