import React, { useState } from 'react';
import { ArrowRight, LogIn, User } from 'lucide-react';

// Blank starter template
const blankTemplate = {
  id: 'blank',
  name: 'New Newsletter',
  sections: [
    { 
      id: 'header-1', 
      type: 'header', 
      backgroundColor: '#FFFFFF', 
      gradientEnd: '#F5F5F5', 
      logo: null, 
      title: '', 
      titleFontSize: 32,
      subtitle: '', 
      textColor: '#1C1917',
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 24,
      spacingLogoToHero: 20,
      spacingHeroToTitle: 24,
      spacingTitleToSubtitle: 8,
      showHeroPlaceholder: false
    }
  ]
};

function TemplateSelector({ onSelectTemplate, hasSavedNewsletter, onContinueEditing, onShowAuth, isAuthenticated, user }) {
  const [hoveredButton, setHoveredButton] = useState(null);

  // Colors
  const backgroundColor = "#FFFFFF";
  const dotColor = "#E7E5E4";
  const heroTextColor = "#1C1917";
  const subheadlineColor = "#78716C";
  const primaryButtonBg = "#1C1917";
  const primaryButtonText = "#FFFFFF";
  const secondaryButtonBg = "#FAFAF9";
  const secondaryButtonText = "#1C1917";
  const cardBorderColor = "#E7E5E4";
  
  // Get user display name
  const displayName = user?.email?.split('@')[0] || 'User';

  // Create dot pattern background
  const dotPattern = `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`;

  const handleStartNew = () => {
    onSelectTemplate(blankTemplate);
  };

  return (
    <div 
      className="newsletter-builder-landing" 
      style={{
        backgroundColor,
        backgroundImage: dotPattern,
        backgroundSize: '20px 20px',
        minHeight: '100vh',
        padding: '60px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* Hero Section */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Header with Logo and Auth */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '80px'
        }}>
          {/* Logo/Brand */}
          <div style={{
            fontSize: '20px',
            fontWeight: '500',
            color: heroTextColor,
            letterSpacing: '-0.02em'
          }}>
            NewsKit
          </div>
          
          {/* Auth Button */}
          {onShowAuth && (
            isAuthenticated ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: secondaryButtonBg,
                borderRadius: '8px',
                border: `1px solid ${cardBorderColor}`
              }}>
                <User size={16} color={heroTextColor} />
                <span style={{ fontSize: '14px', color: heroTextColor }}>{displayName}</span>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: secondaryButtonBg,
                  border: `1px solid ${cardBorderColor}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: heroTextColor,
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F5F5F4';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = secondaryButtonBg;
                }}
              >
                <LogIn size={16} />
                Sign in
              </button>
            )
          )}
        </div>

        {/* Hero Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: '400',
          color: heroTextColor,
          margin: '0 0 24px 0',
          lineHeight: '1.1',
          letterSpacing: '-0.03em'
        }}>
          Create Beautiful Newsletters
        </h1>

        {/* Hero Subheadline */}
        <p style={{
          fontSize: '20px',
          fontWeight: '400',
          color: subheadlineColor,
          margin: '0 0 48px 0',
          lineHeight: '1.5'
        }}>
          Professional email campaigns in minutes
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Start New Button - Primary */}
          <button
            onClick={handleStartNew}
            onMouseEnter={() => setHoveredButton('start')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              backgroundColor: primaryButtonBg,
              color: primaryButtonText,
              border: 'none',
              borderRadius: '8px',
              padding: '16px 48px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: hoveredButton === 'start' ? 0.9 : 1,
              transform: hoveredButton === 'start' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 250ms ease-out',
              boxShadow: hoveredButton === 'start' ? '0 8px 16px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            Start New
            <ArrowRight size={18} strokeWidth={2} />
          </button>

          {/* Continue Button - Secondary */}
          {hasSavedNewsletter && (
            <button
              onClick={onContinueEditing}
              onMouseEnter={() => setHoveredButton('continue')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                backgroundColor: secondaryButtonBg,
                color: secondaryButtonText,
                border: `1px solid ${cardBorderColor}`,
                borderRadius: '8px',
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: hoveredButton === 'continue' ? 0.9 : 1,
                transform: hoveredButton === 'continue' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 250ms ease-out',
                boxShadow: hoveredButton === 'continue' ? '0 8px 16px rgba(0,0,0,0.08)' : '0 2px 4px rgba(0,0,0,0.04)'
              }}
            >
              Continue Editing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector;
