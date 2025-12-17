import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Copy, X, Mail, Undo2, Redo2, Clipboard, Check, Save, Plus, Minus, LogIn } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import TemplateSelector from './components/TemplateSelector';
import WorkspaceCanvas from './components/WorkspaceCanvas';
import FloatingToolbar from './components/FloatingToolbar';
import FloatingThemeBar from './components/FloatingThemeBar';
import SectionActionBar from './components/SectionActionBar';
import AuthPage from './components/auth/AuthPage';
import UserMenu from './components/auth/UserMenu';
import { Button } from './components/ui/Button';
import { exportToHTML, exportForGmail } from './utils/emailExport';
import { cn } from './lib/utils';
import { useWorkspace } from './hooks/useWorkspace';
import { useNewsletters } from './hooks/useNewsletters';
import { isSupabaseConfigured } from './lib/supabase';

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
  const [showAuth, setShowAuth] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedHTML, setExportedHTML] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedDesign, setCopiedDesign] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentDbNewsletterId, setCurrentDbNewsletterId] = useState(null);

  // Auth state
  const { user, isAuthenticated, loading: authLoading, isConfigured: supabaseConfigured } = useAuth();
  
  // Database newsletters (when authenticated)
  const { 
    newsletters: dbNewsletters, 
    loading: dbLoading,
    createNewsletter: dbCreateNewsletter,
    updateNewsletter: dbUpdateNewsletter,
    deleteNewsletter: dbDeleteNewsletter,
    duplicateNewsletter: dbDuplicateNewsletter
  } = useNewsletters();

  // Use workspace hook for multi-newsletter management (local state)
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
    
    const newSectionId = `section-${Date.now()}`;
    
    // Add the new section
    workspace.updateNewsletter(workspace.activeNewsletterId, prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: newSectionId,
        type: sectionType,
        ...getDefaultSectionData(sectionType)
      }]
    }));
    
    // Select the new section
    workspace.setSelectedSection(newSectionId);
    
    // Scroll to the new section after a short delay (to allow DOM to update)
    setTimeout(() => {
      const sectionElement = document.querySelector(`[data-section-id="${newSectionId}"]`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
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

  // Save to cloud (database)
  const handleSaveToCloud = async () => {
    if (!isAuthenticated || !workspace.activeNewsletter) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const newsletterData = {
        name: workspace.activeNewsletter.name || 'Untitled Newsletter',
        sections: workspace.activeNewsletter.sections || [],
        settings: {
          zoom: workspace.zoom
        }
      };

      if (currentDbNewsletterId) {
        // Update existing newsletter
        await dbUpdateNewsletter(currentDbNewsletterId, newsletterData);
      } else {
        // Create new newsletter
        const created = await dbCreateNewsletter(newsletterData);
        setCurrentDbNewsletterId(created.id);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Save to cloud failed:', err);
      alert('Failed to save to cloud: ' + err.message);
    } finally {
      setIsSaving(false);
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

  // Show auth page
  if (showAuth) {
    return (
      <AuthPage 
        onBack={() => setShowAuth(false)}
      />
    );
  }

  if (showLanding) {
    return (
      <TemplateSelector 
        onSelectTemplate={handleStart}
        hasSavedNewsletter={workspace.newsletters.length > 0}
        onContinueEditing={handleContinueEditing}
        onShowAuth={() => setShowAuth(true)}
        isAuthenticated={isAuthenticated}
        user={user}
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
              {/* Save to Cloud button - only when authenticated */}
              {isAuthenticated && (
                <Button 
                  onClick={handleSaveToCloud} 
                  size="sm"
                  variant={saveSuccess ? "default" : "outline"}
                  disabled={isSaving}
                  className={cn(
                    saveSuccess && "bg-emerald-600 hover:bg-emerald-600 border-emerald-600"
                  )}
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 animate-pulse" />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
              )}
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
          
          {/* Auth section */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-zinc-200">
            {isAuthenticated ? (
              <UserMenu />
            ) : supabaseConfigured ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAuth(true)}
                className="text-zinc-600 hover:text-zinc-900"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign in
              </Button>
            ) : null}
          </div>
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
            onReplace={(newSectionData) => {
              // Replace the current section with new section data (keeping the same ID)
              workspace.updateNewsletter(workspace.activeNewsletterId, prev => ({
                ...prev,
                sections: prev.sections.map(s => 
                  s.id === workspace.selectedSectionId 
                    ? { ...newSectionData, id: workspace.selectedSectionId }
                    : s
                )
              }));
            }}
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
      content: 'הכנס את הטקסט שלך כאן...',
      textAlign: 'right',
      textDirection: 'rtl',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      color: '#120F0F',
      backgroundColor: '#FFFFFF',
      padding: 40
    },
    sectionHeader: {
      text: 'כותרת מדור',
      backgroundColor: '#04D1FC',
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: 12,
      textDirection: 'rtl',
      textAlign: 'right'
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
      showTitle: true,
      textDirection: 'rtl',
      textAlign: 'right'
    },
    recipe: {
      title: 'שם המתכון',
      image: null,
      ingredients: '',
      instructions: '',
      backgroundColor: '#FFFFFF',
      textDirection: 'rtl',
      textAlign: 'right'
    },
    footer: {
      backgroundColor: '#120F0F',
      gradientEnd: '#5E5E5E',
      text: 'שם החברה\nפרטי התקשרות',
      color: '#FFFFFF',
      fontSize: 14,
      padding: 30,
      textDirection: 'rtl',
      textAlign: 'right'
    },
    stats: {
      title: 'במספרים',
      subtitle: '',
      stats: [
        { value: '10', label: 'שנות ניסיון' },
        { value: '3', label: 'משרדים בעולם' },
        { value: '12', label: 'מדינות פעילות' },
        { value: '+100', label: 'פרויקטים שהושלמו' }
      ],
      columns: 2,
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      accentColor: '#E5E5E5',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 32,
      valueFontSize: 48,
      labelFontSize: 14,
      labelColor: '#666666',
      paddingVertical: 40,
      paddingHorizontal: 24,
      gap: 24,
      showDividers: true,
      textDirection: 'rtl',
      textAlign: 'right'
    },
    featureGrid: {
      image: '',
      imageHeight: 300,
      imageFit: 'contain',
      imagePosition: 'top',
      title: 'כותרת ראשית',
      subtitle: 'תיאור קצר',
      features: [
        { number: '①', title: 'תכונה ראשונה', description: 'תיאור של התכונה הראשונה' },
        { number: '②', title: 'תכונה שנייה', description: 'תיאור של התכונה השנייה' },
        { number: '③', title: 'תכונה שלישית', description: 'תיאור של התכונה השלישית' },
        { number: '④', title: 'תכונה רביעית', description: 'תיאור של התכונה הרביעית' }
      ],
      featureColumns: 2,
      backgroundColor: '#F5F5F7',
      textColor: '#1D1D1F',
      accentColor: '#86868B',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 40,
      paddingVertical: 48,
      paddingHorizontal: 24,
      gap: 24,
      showNumbers: true,
      textDirection: 'rtl',
      textAlign: 'right'
    },
    specsTable: {
      title: 'מפרט טכני',
      specs: [
        { label: 'גודל', value: '6.64 × 3.28 × 7.37 אינץ׳' },
        { label: 'משקל', value: '384.8 גרם' },
        { label: 'סוללה', value: 'עד 20 שעות' },
        { label: 'קישוריות', value: 'Bluetooth 5.0' }
      ],
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      labelColor: '#1D1D1F',
      valueColor: '#86868B',
      dividerColor: '#D2D2D7',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 40,
      labelFontSize: 14,
      valueFontSize: 14,
      paddingVertical: 48,
      paddingHorizontal: 24,
      rowPadding: 16,
      textDirection: 'rtl',
      textAlign: 'right'
    },
    contactCards: {
      contacts: [
        {
          city: 'תל אביב',
          phone: '+972 (3) 123-4567',
          email: 'tlv@company.co.il',
          address: 'רחוב דיזנגוף 100\nקומה 5\nתל אביב 6433222'
        },
        {
          city: 'ירושלים',
          phone: '+972 (2) 765-4321',
          email: 'jlm@company.co.il',
          address: 'רחוב יפו 50\nקומה 3\nירושלים 9434001'
        }
      ],
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      labelColor: '#86868B',
      dividerColor: '#D2D2D7',
      fontFamily: 'Noto Sans Hebrew',
      cityFontSize: 28,
      infoFontSize: 13,
      textDirection: 'rtl',
      textAlign: 'right',
      paddingVertical: 32,
      paddingHorizontal: 24,
      cardPadding: 24,
      showDividers: true
    },
    steps: {
      sectionLabel: 'שלבי התהליך',
      title: 'איך זה עובד',
      steps: [
        { number: '01', title: 'פגישת ייעוץ ראשונית', note: '' },
        { number: '02', title: 'תכנון ועיצוב', note: 'תשלום 30%' },
        { number: '03', title: 'פיתוח', note: 'תשלום 40%' },
        { number: '04', title: 'מסירה', note: 'תשלום 30%' }
      ],
      backgroundColor: '#F5F5F5',
      textColor: '#1D1D1F',
      labelColor: '#86868B',
      noteColor: '#86868B',
      dividerColor: '#D2D2D7',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 32,
      paddingVertical: 48,
      paddingHorizontal: 24,
      stepPadding: 20,
      showDividers: true,
      textDirection: 'rtl',
      textAlign: 'right'
    },
    accentText: {
      tag: 'ילידי נובמבר',
      tagBg: '#04D1FC',
      tagColor: '#FFFFFF',
      content: 'אולג יודקביץ, אלדר בלנק, אסטבן ספולבדה אוליבה,\nדור הופמן, דין מרקוס, יניב אליהו ורועי גלבוע...\nמזל טוב! מי ייתן וכל משאלות ליבכם יתגשמו:)',
      accentColor: '#FF6B6B',
      accentPosition: 'right',
      accentWidth: 4,
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.6,
      paddingVertical: 32,
      paddingHorizontal: 24,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    featureCards: {
      cards: [
        {
          image: '',
          label: 'חדש',
          title: 'כותרת הפיצ\'ר',
          description: 'תיאור קצר של הפיצ\'ר או העדכון החדש שתרצו לשתף עם הקוראים שלכם.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        },
        {
          image: '',
          label: 'עדכון',
          title: 'כותרת נוספת',
          description: 'תיאור נוסף שמסביר על הפיצ\'ר או השירות החדש.',
          cta: 'לצפייה',
          ctaUrl: '#'
        }
      ],
      columns: 2,
      backgroundColor: '#F5F5F7',
      cardBg: '#FFFFFF',
      textColor: '#1D1D1F',
      labelColor: '#86868B',
      ctaColor: '#5856D6',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 18,
      descFontSize: 14,
      imageHeight: 180,
      imageFit: 'cover',
      imageRadius: 8,
      cardRadius: 12,
      paddingVertical: 40,
      paddingHorizontal: 24,
      gap: 24,
      showLabels: true,
      showCta: true,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    updatesList: {
      title: 'מה עוד חדש?',
      headerCta: 'כל העדכונים',
      headerCtaUrl: '#',
      items: [
        {
          icon: '📦',
          iconBg: '#E8E0FF',
          title: 'מוצרים בהזמנה אישית',
          description: 'לקוחות יכולים ליצור קולקציה שלמה של מוצרים בהתאמה למותג שלהם ללא צורך בעיצוב ידני.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        },
        {
          icon: '💳',
          iconBg: '#E0E8FF',
          title: 'קישורי תשלום אוטומטיים',
          description: 'אפשרו קישורי תשלום אוטומטיים כדי שמבקרים יוכלו לשלם ישירות מהודעות אישור.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        },
        {
          icon: '🎬',
          iconBg: '#FFE8E0',
          title: 'השקת מוצרים ביוטיוב',
          description: 'מוכרים יכולים כעת לקבוע תאריך פרסום למוצרים ביוטיוב וליצור באזז לפני ההשקה.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        }
      ],
      backgroundColor: '#F5F5F7',
      textColor: '#1D1D1F',
      descColor: '#86868B',
      ctaColor: '#5856D6',
      dividerColor: '#E5E5E7',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 28,
      itemTitleFontSize: 16,
      descFontSize: 14,
      iconSize: 48,
      paddingVertical: 40,
      paddingHorizontal: 24,
      itemPadding: 20,
      showDividers: true,
      showIcons: true,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    appCards: {
      title: 'אפליקציות ואינטגרציות חדשות',
      cards: [
        {
          icon: '🛒',
          iconBg: '#E8FFE8',
          name: 'הזמנות חכמות',
          accentColor: '#FF6B6B',
          description: 'לקוחות יכולים להגדיר כללי כמות למוצרים או קולקציות שלמות כדי למנוע בעיות מלאי.',
          cta: 'לבדיקה',
          ctaUrl: '#'
        },
        {
          icon: '🖼️',
          iconBg: '#E0E8FF',
          name: 'תמונות מוצר AI',
          accentColor: '#5856D6',
          description: 'השתמשו ב-AI כדי למקם מוצרים על כל רקע וליצור תמונות מקצועיות בשניות.',
          cta: 'לבדיקה',
          ctaUrl: '#'
        },
        {
          icon: '↩️',
          iconBg: '#FFE8F0',
          name: 'ניהול החזרות',
          accentColor: '#7B5CF0',
          description: 'הפכו את תהליך ההחזרות לקל ללקוחות עם מדיניות מותאמת אישית.',
          cta: 'לבדיקה',
          ctaUrl: '#'
        }
      ],
      columns: 3,
      backgroundColor: '#F5F5F7',
      cardBg: '#FFFFFF',
      textColor: '#1D1D1F',
      descColor: '#86868B',
      ctaColor: '#5856D6',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 28,
      nameFontSize: 14,
      descFontSize: 13,
      iconSize: 48,
      iconRadius: 12,
      cardRadius: 12,
      paddingVertical: 40,
      paddingHorizontal: 24,
      cardPadding: 20,
      gap: 20,
      showAccentLine: true,
      accentLineHeight: 3,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    featureHighlight: {
      highlights: [
        {
          image: '',
          title: 'טיפים מאפליקציית Wix',
          description: 'אפשרו לעסקים קטנים לקבל תשלומי Venmo ישירות מהטלפונים של הלקוחות. לאחר חיבור PayPal כספק תשלום, Venmo מופעל אוטומטית בקופה.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        },
        {
          image: '',
          title: 'מחשבון שכר',
          description: 'קבלו סקירה על הביצועים האונליין של העסק עם דף האנליטיקס החדש. אתם והלקוחות שלכם יכולים לקבל החלטות מבוססות נתונים.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        },
        {
          image: '',
          title: 'הגשימו את הרעיונות שלכם',
          description: 'כשההשראה מכה, הביאו את הרעיונות שלכם לחיים באמצעות כתיבה. כשההשראה מכה, הביאו את הרעיונות שלכם לחיים.',
          cta: 'למידע נוסף',
          ctaUrl: '#'
        }
      ],
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      descColor: '#666666',
      ctaColor: '#1D1D1F',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 20,
      descFontSize: 14,
      imageWidth: 280,
      imageHeight: 200,
      imageFit: 'cover',
      imageRadius: 16,
      paddingVertical: 40,
      paddingHorizontal: 24,
      itemGap: 48,
      alternateLayout: true,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    heroBanner: {
      title: 'כותרת ראשית',
      subtitle: '',
      image: '',
      imageFit: 'cover',
      imageHeight: 400,
      titleFontSize: 72,
      titleFontWeight: '900',
      titleLetterSpacing: '-0.02em',
      subtitleFontSize: 16,
      backgroundColor: '#F5F5F7',
      textColor: '#1D1D1F',
      subtitleColor: '#666666',
      fontFamily: 'Noto Sans Hebrew',
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 24,
      titlePosition: 'top',
      textAlign: 'center',
      textDirection: 'ltr'
    },
    celebration: {
      badgeText: 'ילידי נובמבר',
      badgeColor: '#04D1FC',
      badgeTextColor: '#FFFFFF',
      names: 'שם ראשון, שם שני, שם שלישי,\nשם רביעי, שם חמישי ושם שישי...',
      message: 'מזל טוב! מי ייתן וכל משאלות ליבכם יתגשמו :)',
      accentColor: '#FF6B6B',
      accentWidth: 4,
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Noto Sans Hebrew',
      nameFontSize: 18,
      messageFontSize: 18,
      badgeFontSize: 16,
      paddingVertical: 40,
      paddingHorizontal: 24,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    heroSplit: {
      headline: 'היי,\nיוצרים',
      description: 'אנחנו יודעים שהזמן שלכם יקר. לכן אנחנו מקלים עליכם ללמוד מיומנויות חדשות, מהר יותר. מציגים סדרה חדשה של מדריכים קצרים עם טיפים מעשיים ודוגמאות אמיתיות.',
      linkText: 'צפו עכשיו',
      linkUrl: '#',
      image: '',
      imageHeight: 400,
      imageFit: 'cover',
      imagePosition: 'top',
      backgroundColor: '#F5F5F7',
      textColor: '#1D1D1F',
      linkColor: '#5856D6',
      fontFamily: 'Noto Sans Hebrew',
      headlineFontSize: 48,
      descFontSize: 16,
      paddingVertical: 48,
      paddingHorizontal: 24,
      gap: 48,
      headlinePosition: 'left',
      textAlign: 'right',
      textDirection: 'rtl'
    },
    alternating: {
      rows: [
        {
          image: '',
          title: 'טיפים מאפליקציה',
          description: 'אפשר ללקוחות לקבל תשלומים ישירות מהטלפון. לאחר חיבור לספק תשלומים, התשלום מופעל אוטומטית.',
          linkText: 'למד עוד',
          linkUrl: '#'
        },
        {
          image: '',
          title: 'מחשבון שכר',
          description: 'קבל סקירה כללית של הביצועים העסקיים עם דף האנליטיקס החדש. אתה והלקוחות שלך יכולים לקבל החלטות מבוססות נתונים.',
          linkText: 'למד עוד',
          linkUrl: '#'
        }
      ],
      imageWidth: '45%',
      imageHeight: 250,
      imageFit: 'cover',
      imageBorderRadius: 12,
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      descriptionColor: '#86868B',
      linkColor: '#1D1D1F',
      fontFamily: 'Noto Sans Hebrew',
      titleFontSize: 20,
      descFontSize: 14,
      paddingVertical: 32,
      paddingHorizontal: 24,
      rowGap: 48,
      startImagePosition: 'left',
      textAlign: 'right',
      textDirection: 'rtl'
    }
  };

  return defaults[sectionType] || {};
}

export default App;
