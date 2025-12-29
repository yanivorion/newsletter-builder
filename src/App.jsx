import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Copy, X, Mail, Undo2, Redo2, Clipboard, Check, Save } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import TemplateSelector from './components/TemplateSelector';
import NewsletterEditor from './components/NewsletterEditor';
import SidebarEditor from './components/SidebarEditor';
import { Button } from './components/ui/Button';
import { exportToHTML, exportForGmail } from './utils/emailExport';
import { cn } from './lib/utils';
import { useHistory } from './hooks/useHistory';
import { useAutosave } from './hooks/useAutosave';

function AppContent() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedHTML, setExportedHTML] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedDesign, setCopiedDesign] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  // Use history hook for undo/redo
  const {
    state: newsletter,
    setState: setNewsletter,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory(null);

  // Use autosave hook
  const {
    loadSavedNewsletter,
    clearSavedNewsletter,
    getLastSaveTime,
    hasSavedNewsletter
  } = useAutosave(newsletter, setNewsletter);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setNewsletter(JSON.parse(JSON.stringify(template)));
  };

  const handleContinueEditing = () => {
    const saved = loadSavedNewsletter();
    if (saved) {
      setSelectedTemplate({ name: saved.name || 'Saved Newsletter' });
      setNewsletter(saved);
    }
  };

  const handleSectionClick = (sectionId) => {
    setSelectedSection(sectionId);
  };

  const handleSectionUpdate = useCallback((sectionId, updates) => {
    setNewsletter(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  }, [setNewsletter]);

  const handleToggleUnlock = useCallback(() => {
    setIsUnlocked(prev => !prev);
  }, []);

  const handleAddSection = (sectionType) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: sectionType,
      ...getDefaultSectionData(sectionType)
    };
    
    setNewsletter(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const handleDeleteSection = useCallback((sectionId) => {
    setNewsletter(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
    setSelectedSection(null);
  }, [setNewsletter]);

  const handleMoveSection = useCallback((sectionId, direction) => {
    setNewsletter(prev => {
      const sections = [...prev.sections];
      const index = sections.findIndex(s => s.id === sectionId);
      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }
      return { ...prev, sections };
    });
  }, [setNewsletter]);

  const handleReorderSections = useCallback((fromIndex, toIndex) => {
    setNewsletter(prev => {
      const sections = [...prev.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);
      return { ...prev, sections };
    });
  }, [setNewsletter]);

  const handleExport = () => {
    const html = exportToHTML(newsletter);
    setExportedHTML(html);
    setShowExportModal(true);
  };

  const handleCopyHTML = async () => {
    await navigator.clipboard.writeText(exportedHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([exportedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyDesign = async () => {
    const html = exportForGmail(newsletter);
    
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([html], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopiedDesign(true);
      setTimeout(() => setCopiedDesign(false), 2500);
    } catch (err) {
      console.error('Clipboard API failed, trying fallback:', err);
      try {
        await navigator.clipboard.writeText(html);
        setCopiedDesign(true);
        setTimeout(() => setCopiedDesign(false), 2500);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        alert('Failed to copy. Please use the Export button instead.');
      }
    }
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setNewsletter(null);
    setSelectedSection(null);
  };

  const handleStartFresh = () => {
    clearSavedNewsletter();
    setSelectedTemplate(null);
    setNewsletter(null);
    setSelectedSection(null);
  };

  if (!selectedTemplate) {
    return (
      <TemplateSelector 
        onSelectTemplate={handleTemplateSelect}
        hasSavedNewsletter={hasSavedNewsletter()}
        onContinueEditing={handleContinueEditing}
        lastSaveTime={getLastSaveTime()}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToTemplates}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Templates
          </Button>
          
          <div className="h-5 w-px bg-zinc-200" />
          
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-700">
              {newsletter?.name || 'Newsletter'}
            </span>
          </div>

          {/* Autosave indicator - static to avoid re-renders */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Save className="w-3 h-3" />
            <span>Auto-saved</span>
          </div>
        </div>

        {/* Center - Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "text-zinc-500",
              !canUndo && "opacity-40 cursor-not-allowed"
            )}
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              "text-zinc-500",
              !canRedo && "opacity-40 cursor-not-allowed"
            )}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCopyDesign} 
            size="sm"
            variant={copiedDesign ? "default" : "outline"}
            className={cn(
              copiedDesign && "bg-emerald-600 hover:bg-emerald-600 border-emerald-600"
            )}
          >
            {copiedDesign ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" />
                Copy for Gmail
              </>
            )}
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-100/50">
          <NewsletterEditor
            newsletter={newsletter}
            selectedSection={selectedSection}
            onSectionClick={handleSectionClick}
            onAddSection={handleAddSection}
            onReorderSections={handleReorderSections}
            onSectionUpdate={handleSectionUpdate}
            isUnlocked={isUnlocked}
          />
        </div>

        {/* Sidebar */}
        <SidebarEditor
          newsletter={newsletter}
          selectedSection={selectedSection}
          onSectionUpdate={handleSectionUpdate}
          onDeleteSection={handleDeleteSection}
          onMoveSection={handleMoveSection}
          isUnlocked={isUnlocked}
          onToggleUnlock={handleToggleUnlock}
        />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in"
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Export Newsletter</h2>
                <p className="text-sm text-zinc-500">Copy or download the HTML code</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowExportModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-3">
                <Button 
                  onClick={handleCopyHTML}
                  className={cn(
                    "flex-1",
                    copied && "bg-emerald-600 hover:bg-emerald-600"
                  )}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy HTML'}
                </Button>
                <Button variant="outline" onClick={handleDownloadHTML} className="flex-1">
                  <Download className="w-4 h-4" />
                  Download File
                </Button>
              </div>

              <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <pre className="p-4 text-xs text-zinc-600 font-mono overflow-auto h-full max-h-[400px]">
                  {exportedHTML}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function getDefaultSectionData(sectionType) {
  const defaults = {
    header: {
      backgroundColor: '#04D1FC',
      gradientEnd: '#17A298',
      logo: null,
      logoWidth: 120,
      logoHeight: 'auto',
      logoAlignment: 'center',
      heroImage: null,
      heroImageHeight: 200,
      heroImageFit: 'cover',
      showHeroPlaceholder: true,
      title: 'Newsletter',
      titleFontSize: 28,
      titleFontWeight: '700',
      titleFontStyle: 'normal',
      titleLetterSpacing: '-0.02em',
      titleLineHeight: 1.2,
      subtitle: 'Your Newsletter Title',
      subtitleFontSize: 16,
      subtitleFontWeight: '400',
      subtitleLetterSpacing: '0',
      subtitleLineHeight: 1.4,
      textColor: '#FFFFFF',
      showDateBadge: false,
      dateBadgeText: 'JULY 2025',
      dateBadgeBg: '#04D1FC',
      dateBadgeColor: '#FFFFFF',
      // Spacing
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 24,
      spacingLogoToHero: 20,
      spacingHeroToTitle: 24,
      spacingTitleToSubtitle: 8
    },
    marquee: {
      items: '🎉 New Announcement,⭐ Special Offer,🚀 Coming Soon,💡 Did You Know',
      speed: 30,
      direction: 'left',
      backgroundColor: '#04D1FC',
      textColor: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: '0.02em',
      paddingVertical: 10,
      separator: '•',
      pauseOnHover: true
    },
    text: {
      content: 'Enter your text here...',
      textAlign: 'center',
      direction: 'ltr',
      fontFamily: 'Poppins',
      fontSize: 16,
      color: '#120F0F',
      backgroundColor: '#FFFFFF',
      padding: 40
    },
    sectionHeader: {
      text: 'SECTION TITLE',
      backgroundColor: '#04D1FC',
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: 12
    },
    imageCollage: {
      layout: '4-column',
      images: [],
      gap: 10,
      imageHeight: 200,
      backgroundColor: '#FFFFFF'
    },
    imageSequence: {
      images: [],
      frameDuration: 500,
      backgroundColor: '#F8F9FA',
      showControls: false,
      showThumbnails: false,
      showFrameCounter: false,
      autoPlay: true,
      previewHeight: 300
    },
    accentText: {
      tagText: 'HIGHLIGHT',
      tagBackgroundColor: '#04D1FC',
      tagTextColor: '#FFFFFF',
      tagPosition: 'top-right',
      tagFontSize: 14,
      tagBorderRadius: 8,
      content: 'Enter your highlighted text content here...',
      contentFontSize: 18,
      contentLineHeight: 1.8,
      contentColor: '#333333',
      contentAlign: 'right',
      backgroundColor: '#FFFFFF',
      padding: 40,
      direction: 'rtl',
      fontFamily: 'Noto Sans Hebrew'
    },
    promoCard: {
      title: 'Card Title',
      titleFontSize: 28,
      titleFontWeight: '700',
      titleColor: '#1A1A1A',
      body: 'Add your promotional content here.',
      bodyFontSize: 16,
      bodyLineHeight: 1.7,
      bodyColor: '#555555',
      ctaText: 'Learn More →',
      ctaColor: '#04D1FC',
      ctaFontSize: 16,
      ctaLink: '#',
      showCta: true,
      image: null,
      imagePosition: 'right',
      imageWidth: 200,
      imageHeight: 160,
      imageBorderRadius: 12,
      showImagePlaceholder: true,
      backgroundColor: '#F8F9FA',
      padding: 32,
      borderRadius: 16,
      gap: 24,
      direction: 'rtl',
      fontFamily: 'Noto Sans Hebrew',
      contentAlign: 'right'
    },
    profileCards: {
      profiles: [],
      columns: 4,
      imageShape: 'circular',
      backgroundColor: '#FFFFFF',
      showName: true,
      showTitle: true
    },
    recipe: {
      title: 'Recipe Title',
      image: null,
      ingredients: '',
      instructions: '',
      backgroundColor: '#FFFFFF'
    },
    footer: {
      backgroundColor: '#120F0F',
      gradientEnd: '#5E5E5E',
      text: 'Your Company\nContact Information',
      color: '#FFFFFF',
      fontSize: 14,
      padding: 30
    }
  };

  return defaults[sectionType] || {};
}

export default App;
