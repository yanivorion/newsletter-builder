import React, { useState, useRef } from 'react';
import { ArrowRight, FolderOpen, Upload, Trash2, FileJson } from 'lucide-react';

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
      title: 'Newsletter', 
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

function TemplateSelector({ 
  onSelectTemplate, 
  hasSavedNewsletter, 
  onContinueEditing,
  projects = [],
  onLoadProject,
  onDeleteProject,
  onImportJSON
}) {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && onImportJSON) {
      try {
        await onImportJSON(file);
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      }
    }
    e.target.value = '';
  };

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
        {/* Logo/Brand */}
        <div style={{
          fontSize: '20px',
          fontWeight: '500',
          color: heroTextColor,
          marginBottom: '80px',
          letterSpacing: '-0.02em'
        }}>
          NewsKit
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

          {/* Upload JSON Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setHoveredButton('upload')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              backgroundColor: secondaryButtonBg,
              color: secondaryButtonText,
              border: `1px solid ${cardBorderColor}`,
              borderRadius: '8px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: hoveredButton === 'upload' ? 0.9 : 1,
              transform: hoveredButton === 'upload' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 250ms ease-out',
              boxShadow: hoveredButton === 'upload' ? '0 8px 16px rgba(0,0,0,0.08)' : '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <Upload size={18} />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Saved Projects Section */}
        {projects.length > 0 && (
          <div style={{
            marginTop: '80px',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              justifyContent: 'center'
            }}>
              <FolderOpen size={20} color={subheadlineColor} />
              <h2 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: heroTextColor,
                margin: 0
              }}>
                Your Projects ({projects.length})
              </h2>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => onLoadProject?.(project.id)}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${hoveredProject === project.id ? '#1C1917' : cardBorderColor}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 200ms ease-out',
                    transform: hoveredProject === project.id ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredProject === project.id ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: heroTextColor,
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {project.name}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: subheadlineColor
                      }}>
                        {new Date(project.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    {onDeleteProject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this project?')) {
                            onDeleteProject(project.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          opacity: hoveredProject === project.id ? 1 : 0,
                          transition: 'opacity 150ms',
                          color: '#EF4444',
                          borderRadius: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: subheadlineColor
                  }}>
                    <FileJson size={14} />
                    {project.data?.sections?.length || 0} sections
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateSelector;
