import React from 'react';

function ProfileCardsSection({ profiles, columns, imageShape, backgroundColor, showName, showTitle }) {
  const containerStyle = {
    backgroundColor: backgroundColor || '#FFFFFF',
    padding: '30px 20px'
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
      <div style={gridStyle}>
        {displayProfiles.map((profile, index) => (
          <div key={index} style={cardStyle}>
            {profile && profile.image ? (
              <img src={profile.image} alt={profile.name || `Profile ${index + 1}`} style={imageStyle} />
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
        ))}
      </div>
    </div>
  );
}

export default ProfileCardsSection;
