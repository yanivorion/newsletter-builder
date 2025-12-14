import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Copy, X, Mail, Undo2, Redo2, Clipboard, Check, Save, Plus, Minus } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import TemplateSelector from './components/TemplateSelector';
import WorkspaceCanvas from './components/WorkspaceCanvas';
import FloatingToolbar from './components/FloatingToolbar';
import FloatingThemeBar from './components/FloatingThemeBar';
import SectionActionBar from './components/SectionActionBar';
import { Button } from './components/ui/Button';
import { exportToHTML, exportForGmail } from './utils/emailExport';
import { cn } from './lib/utils';
import { useWorkspace } from './hooks/useWorkspace';

// Blank starter template
const blankTemplate = {
  name: 'New Newsletter',
  sections: [
    { 
      id: 'header-1', 
      type: 'header', 
      backgroundColor: '#FFFFFF', 
      gradientEnd: '#F5F5F5', 
      logo: null, 
      logoWidth: 120,
      logoHeight: 'auto',
      logoAlignment: 'center',
      heroImage: null,
      heroImageHeight: 200,
      heroImageFit: 'cover',
      showHeroPlaceholder: false,
      title: '', 
      titleFontSize: 32,
      titleFontWeight: '700',
      titleFontStyle: 'normal',
      titleLetterSpacing: '-0.02em',
      titleLineHeight: 1.2,
      subtitle: '', 
      subtitleFontSize: 16,
      subtitleFontWeight: '400',
      subtitleLetterSpacing: '0',
      subtitleLineHeight: 1.4,
      textColor: '#1C1917',
      showDateBadge: false,
      dateBadgeText: 'JULY 2025',
      dateBadgeBg: '#04D1FC',
      dateBadgeColor: '#FFFFFF',
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 24,
      spacingLogoToHero: 20,
      spacingHeroToTitle: 24,
      spacingTitleToSubtitle: 8
    }
  ]
};

const WORKSPACE_STORAGE_KEY = 'newsletter-workspace-v2';

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedHTML, setExportedHTML] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedDesign, setCopiedDesign] = useState(false);

  // Use workspace hook for multi-newsletter management
  const workspace = useWorkspace();

  // Load saved workspace on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.newsletters && parsed.newsletters.length > 0) {
          workspace.loadState(parsed);
          setShowLanding(false);
        }
      }
    } catch (e) {
      console.error('Failed to load workspace:', e);
    }
  }, []);

  // Autosave workspace
  useEffect(() => {
    if (!showLanding && workspace.newsletters.length > 0) {
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace.getFullState()));
        } catch (e) {
          console.error('Failed to save workspace:', e);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [workspace.newsletters, workspace.zoom, showLanding, workspace.getFullState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) workspace.redo();
        else workspace.undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        workspace.redo();
      }
      // Duplicate newsletter
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && workspace.activeNewsletterId) {
        e.preventDefault();
        workspace.duplicateNewsletter(workspace.activeNewsletterId);
      }
      // Copy newsletter
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && workspace.activeNewsletterId && !window.getSelection()?.toString()) {
        workspace.copyNewsletter(workspace.activeNewsletterId);
      }
      // Paste newsletter
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && workspace.hasClipboard) {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement?.tagName === 'INPUT' || 
                              activeElement?.tagName === 'TEXTAREA' || 
                              activeElement?.isContentEditable;
        if (!isInputFocused) {
          e.preventDefault();
          workspace.pasteNewsletter();
        }
      }
      // New newsletter
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !showLanding) {
        e.preventDefault();
        workspace.addNewsletter(blankTemplate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspace, showLanding]);

  const handleStart = useCallback(() => {
    workspace.addNewsletter(blankTemplate);
    setShowLanding(false);
  }, [workspace]);

  const handleContinueEditing = useCallback(() => {
    setShowLanding(false);
  }, []);

  const handleSectionUpdate = useCallback((sectionId, updates) => {
    if (!workspace.activeNewsletterId) return;
    workspace.updateNewsletter(workspace.activeNewsletterId, prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  }, [workspace]);

  const handleAddSection = useCallback((sectionType) => {
    if (!workspace.activeNewsletterId) return;
    workspace.updateNewsletter(workspace.activeNewsletterId, prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: `section-${Date.now()}`,
        type: sectionType,
        ...getDefaultSectionData(sectionType)
      }]
    }));
  }, [workspace]);

  const handleDeleteSection = useCallback((sectionId) => {
    if (!workspace.activeNewsletterId) return;
    workspace.updateNewsletter(workspace.activeNewsletterId, prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
    workspace.setSelectedSection(null);
  }, [workspace]);

  const handleMoveSection = useCallback((sectionId, direction) => {
    if (!workspace.activeNewsletterId) return;
    workspace.updateNewsletter(workspace.activeNewsletterId, prev => {
      const sections = [...prev.sections];
      const index = sections.findIndex(s => s.id === sectionId);
      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }
      return { ...prev, sections };
    });
  }, [workspace]);

  const handleReorderSections = useCallback((fromIndex, toIndex) => {
    if (!workspace.activeNewsletterId) return;
    workspace.updateNewsletter(workspace.activeNewsletterId, prev => {
      const sections = [...prev.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);
      return { ...prev, sections };
    });
  }, [workspace]);

  const handleApplyColor = useCallback((color) => {
    if (!workspace.activeNewsletterId || !workspace.selectedSectionId) return;
    const section = workspace.activeNewsletter?.sections?.find(s => s.id === workspace.selectedSectionId);
    if (!section) return;
    
    // Apply color based on section type
    if (section.type === 'header' || section.type === 'footer' || section.type === 'sectionHeader' || section.type === 'marquee') {
      handleSectionUpdate(workspace.selectedSectionId, { backgroundColor: color });
    } else if (section.type === 'text') {
      handleSectionUpdate(workspace.selectedSectionId, { color: color });
    }
  }, [workspace, handleSectionUpdate]);

  const handleExport = useCallback(() => {
    if (workspace.activeNewsletter) {
      const html = exportToHTML(workspace.activeNewsletter);
      setExportedHTML(html);
      setShowExportModal(true);
    }
  }, [workspace.activeNewsletter]);

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
    a.download = `${workspace.activeNewsletterName || 'newsletter'}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyDesign = async () => {
    if (!workspace.activeNewsletter) return;
    const html = exportForGmail(workspace.activeNewsletter);
    
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

  const handleBackToLanding = useCallback(() => {
    setShowLanding(true);
  }, []);

  const handleStartFresh = useCallback(() => {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    workspace.loadState({ newsletters: [], zoom: 1 });
    setShowLanding(true);
  }, [workspace]);

  const handleZoomReset = useCallback((value = 1) => {
    workspace.setZoom(value);
  }, [workspace]);

  if (showLanding) {
    return (
      <TemplateSelector 
        onSelectTemplate={handleStart}
        hasSavedNewsletter={workspace.newsletters.length > 0}
        onContinueEditing={handleContinueEditing}
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
            onClick={handleBackToLanding}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
          
          <div className="h-5 w-px bg-zinc-200" />
          
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-700">
              {workspace.activeNewsletterName || 'Workspace'}
            </span>
            <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
              {workspace.newsletters.length} {workspace.newsletters.length === 1 ? 'newsletter' : 'newsletters'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Save className="w-3 h-3" />
            <span>Auto-saved</span>
          </div>
        </div>

        {/* Center - Actions + Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => workspace.addNewsletter(blankTemplate)}
            className="text-zinc-500 hover:text-zinc-900"
            title="New newsletter (⌘N)"
          >
            <Plus className="w-4 h-4" />
            New
          </Button>
          
          <div className="w-px h-4 bg-zinc-200 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.undo}
            disabled={!workspace.canUndo}
            className={cn("text-zinc-500", !workspace.canUndo && "opacity-40 cursor-not-allowed")}
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.redo}
            disabled={!workspace.canRedo}
            className={cn("text-zinc-500", !workspace.canRedo && "opacity-40 cursor-not-allowed")}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>

          <div className="w-px h-4 bg-zinc-200 mx-2" />

          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.zoomOut}
            className="text-zinc-500 h-8 w-8 p-0"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono text-zinc-500 w-10 text-center">
            {Math.round(workspace.zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.zoomIn}
            className="text-zinc-500 h-8 w-8 p-0"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {workspace.activeNewsletter && (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Toolbar - Add Section + Reorder */}
        <FloatingToolbar
          onAddSection={handleAddSection}
          hasActiveNewsletter={!!workspace.activeNewsletterId}
          isUnlocked={isUnlocked}
          onToggleUnlock={() => setIsUnlocked(prev => !prev)}
        />

        {/* Floating Theme Bar */}
        <FloatingThemeBar
          onSelectColor={handleApplyColor}
          onSelectGradient={(start, end) => {
            if (workspace.selectedSectionId) {
              handleSectionUpdate(workspace.selectedSectionId, { 
                backgroundColor: start, 
                gradientEnd: end 
              });
            }
          }}
          selectedSection={workspace.selectedSectionId}
        />

        {/* Section Action Bar - appears next to selected section */}
        {workspace.selectedSectionId && workspace.activeNewsletter && (
          <SectionActionBar
            section={workspace.activeNewsletter.sections?.find(s => s.id === workspace.selectedSectionId)}
            onUpdate={(updates) => handleSectionUpdate(workspace.selectedSectionId, updates)}
            onDelete={() => handleDeleteSection(workspace.selectedSectionId)}
            onDuplicate={() => {
              const section = workspace.activeNewsletter.sections?.find(s => s.id === workspace.selectedSectionId);
              if (section) {
                workspace.updateNewsletter(workspace.activeNewsletterId, prev => ({
                  ...prev,
                  sections: [...prev.sections, { ...section, id: `section-${Date.now()}` }]
                }));
              }
            }}
            onMoveUp={() => handleMoveSection(workspace.selectedSectionId, 'up')}
            onMoveDown={() => handleMoveSection(workspace.selectedSectionId, 'down')}
            position={{ top: 80, right: 20 }}
          />
        )}

        {/* Workspace Canvas */}
        <WorkspaceCanvas
          zoom={workspace.zoom}
          newsletters={workspace.newsletters}
          activeNewsletterId={workspace.activeNewsletterId}
          selectedSectionId={workspace.selectedSectionId}
          onZoomIn={workspace.zoomIn}
          onZoomOut={workspace.zoomOut}
          onZoomReset={handleZoomReset}
          onAddNewsletter={() => workspace.addNewsletter(blankTemplate)}
          onSelectNewsletter={workspace.setActiveNewsletter}
          onSelectSection={workspace.setSelectedSection}
          onRenameNewsletter={workspace.renameNewsletter}
          onDuplicateNewsletter={workspace.duplicateNewsletter}
          onDeleteNewsletter={workspace.deleteNewsletter}
          onUpdateNewsletterPosition={workspace.updateNewsletterPosition}
          onSectionUpdate={handleSectionUpdate}
          onAddSection={handleAddSection}
          onReorderSections={handleReorderSections}
          isUnlocked={isUnlocked}
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
                <p className="text-sm text-zinc-500">
                  Exporting: {workspace.activeNewsletterName || 'Newsletter'}
                </p>
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
      title: '',
      titleFontSize: 28,
      titleFontWeight: '700',
      titleFontStyle: 'normal',
      titleLetterSpacing: '-0.02em',
      titleLineHeight: 1.2,
      subtitle: '',
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
