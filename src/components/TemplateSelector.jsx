import React, { useState } from 'react';
import { ArrowRight, LogIn, User, FolderOpen, Clock, Mail, Plus, Newspaper, Building2 } from 'lucide-react';

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

// Company Newsletter Template
const companyNewsletterTemplate = {
  id: 'company-newsletter',
  name: 'Company Newsletter',
  description: 'Internal newsletter with sections for birthdays, events, team updates, and recipes',
  color: '#0284C7'
};

function TemplateSelector({ 
  onSelectTemplate, 
  onSelectCompanyTemplate,
  hasSavedNewsletter, 
  onContinueEditing, 
  onShowAuth, 
  isAuthenticated, 
  user,
  savedProjects = [],
  onViewAllProjects,
  onSelectProject
}) {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show recent projects (max 4)
  const recentProjects = savedProjects
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 4);

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
        maxWidth: '1000px',
        margin: '0 auto'
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
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={20} color="white" />
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: '600',
              color: heroTextColor,
              letterSpacing: '-0.02em'
            }}>
              NewsKit
            </span>
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
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
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

          {/* Template Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            maxWidth: '500px',
            margin: '0 auto 48px'
          }}>
            {/* Blank Template */}
            <button
              onClick={handleStartNew}
              onMouseEnter={() => setHoveredTemplate('blank')}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${hoveredTemplate === 'blank' ? heroTextColor : cardBorderColor}`,
                borderRadius: '12px',
                padding: '24px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transform: hoveredTemplate === 'blank' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 200ms ease-out',
                boxShadow: hoveredTemplate === 'blank' ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: '#F5F5F5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Plus size={24} color="#78716C" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: heroTextColor }}>Blank</div>
                <div style={{ fontSize: '12px', color: subheadlineColor }}>Start from scratch</div>
              </div>
            </button>

            {/* Company Newsletter Template */}
            <button
              onClick={() => onSelectCompanyTemplate?.()}
              onMouseEnter={() => setHoveredTemplate('company')}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${hoveredTemplate === 'company' ? '#0284C7' : cardBorderColor}`,
                borderRadius: '12px',
                padding: '0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                overflow: 'hidden',
                transform: hoveredTemplate === 'company' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 200ms ease-out',
                boxShadow: hoveredTemplate === 'company' ? '0 8px 24px rgba(2,132,199,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {/* Thumbnail Image */}
              <div style={{
                width: '100%',
                height: '120px',
                overflow: 'hidden',
                backgroundColor: '#F5F5F5'
              }}>
                <img 
                  src="https://static.wixstatic.com/media/796f64_f6aab3e23ea84dea995f8e863701b17f~mv2.png"
                  alt="Company Newsletter Template"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center'
                  }}
                />
              </div>
              {/* Label */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: heroTextColor }}>Company Newsletter</div>
                <div style={{ fontSize: '12px', color: subheadlineColor }}>Events, birthdays, updates</div>
              </div>
            </button>
          </div>

          {/* View All Projects Button */}
          {savedProjects.length > 0 && onViewAllProjects && (
            <button
              onClick={onViewAllProjects}
              onMouseEnter={() => setHoveredButton('projects')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                backgroundColor: secondaryButtonBg,
                color: secondaryButtonText,
                border: `1px solid ${cardBorderColor}`,
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: hoveredButton === 'projects' ? 0.9 : 1,
                transform: hoveredButton === 'projects' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 250ms ease-out',
                boxShadow: hoveredButton === 'projects' ? '0 8px 16px rgba(0,0,0,0.08)' : '0 2px 4px rgba(0,0,0,0.04)'
              }}
            >
              <FolderOpen size={16} />
              My Projects ({savedProjects.length})
            </button>
          )}
        </div>

        {/* Recent Projects Section */}
        {recentProjects.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: subheadlineColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Recent Projects
              </h2>
              {savedProjects.length > 4 && (
                <button
                  onClick={onViewAllProjects}
                  style={{
                    fontSize: '14px',
                    color: '#3B82F6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  View all →
                </button>
              )}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              {recentProjects.map((project) => {
                const previewColor = project.sections?.[0]?.backgroundColor || '#E5E5E5';
                const isHovered = hoveredProject === project.id;
                
                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject ? onSelectProject(project) : onContinueEditing?.()}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${isHovered ? '#D4D4D4' : cardBorderColor}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 200ms ease-out'
                    }}
                  >
                    {/* Preview */}
                    <div style={{
                      height: '100px',
                      backgroundColor: previewColor,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Thumbnail preview of sections */}
                      <div style={{
                        position: 'absolute',
                        inset: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        opacity: 0.6
                      }}>
                        {project.sections?.slice(0, 3).map((section, i) => (
                          <div 
                            key={i}
                            style={{
                              height: '20px',
                              borderRadius: '4px',
                              backgroundColor: section.backgroundColor || '#f5f5f5',
                              border: '1px solid rgba(0,0,0,0.05)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div style={{ padding: '12px 14px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: heroTextColor,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {project.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '6px',
                        fontSize: '12px',
                        color: subheadlineColor
                      }}>
                        <Clock size={12} />
                        <span>{formatDate(project.updatedAt || project.createdAt)}</span>
                        <span style={{ color: '#D4D4D4' }}>•</span>
                        <span>{project.sections?.length || 0} sections</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateSelector;
