import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Copy, X, Mail, Undo2, Redo2, Clipboard, Check, Save, Plus, Minus, LogIn, FolderOpen, Upload, FileJson } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import TemplateSelector from './components/TemplateSelector';
import ProjectsDashboard from './components/ProjectsDashboard';
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

// ElectroNews Template - Company Newsletter Structure
const electroNewsTemplate = {
  name: 'ElectroNews',
  sections: [
    // 1. Header with blue gradient, logo and hero image
    { 
      id: 'header-1', 
      type: 'header', 
      backgroundColor: '#60A5FA', 
      gradientEnd: '#1D4ED8', 
      logo: null, 
      logoWidth: 100,
      logoHeight: 'auto',
      logoAlignment: 'left',
      heroImage: null,
      heroImageHeight: 200,
      heroImageFit: 'cover',
      showHeroPlaceholder: true,
      title: 'ElectroNews', 
      titleFontSize: 56,
      titleFontWeight: '700',
      titleFontStyle: 'italic',
      titleLetterSpacing: '0',
      titleLineHeight: 1.1,
      subtitle: '', 
      subtitleFontSize: 16,
      subtitleFontWeight: '400',
      subtitleLetterSpacing: '0',
      subtitleLineHeight: 1.4,
      textColor: '#1E3A8A',
      showDateBadge: true,
      dateBadgeText: 'JULY 2025',
      dateBadgeBg: '#67E8F9',
      dateBadgeColor: '#000000',
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 24,
      spacingLogoToHero: 16,
      spacingHeroToTitle: 0,
      spacingTitleToSubtitle: 8
    },
    // 2. Opening words with tag (מילות פתיחה)
    {
      id: 'accent-opening',
      type: 'accentText',
      tag: 'מילות פתיחה',
      tagBg: '#04D1FC',
      tagColor: '#FFFFFF',
      tagPosition: 'sidebar-right',
      content: 'החודש ציינו את יום הטבעונות הבינלאומי עם ארוחת חומוס טעימה במיוחד, הזדמנות נהדרת להתכנס יחד, לטעום, ליהנות ולחוות את האוכל טבעוני.\n\nכמובן שגם חגגנו ימי הולדת לילידי נובמבר, הייתה אווירה חמימה ומשמחת. כמו תמיד היה כיף לראות את כולם מתאחדים כדי לחגוג יחד.\n\nבנוסף, שמחנו לארח אצלנו אורחים מחברת IEV, שהגיעו לביקור מקצועי ומעשיר.\nהיה מרתק להכיר, לשתף, ולהציג בפניהם את העשייה שלנו מקרוב.',
      accentColor: '#04D1FC',
      showAccentBar: false,
      accentPosition: 'right',
      accentWidth: 4,
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.7,
      paddingVertical: 40,
      paddingHorizontal: 40,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    // 3. Section Header - Happy Birthday
    {
      id: 'section-birthday',
      type: 'sectionHeader',
      text: 'HAPPY BIRTHDAY',
      backgroundColor: '#FACC15',
      color: '#000000',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: 12,
      textDirection: 'ltr',
      textAlign: 'center'
    },
    // 4. Birthday Celebration Content
    {
      id: 'celebration-1',
      type: 'accentText',
      tag: 'ילידי החודש',
      tagBg: '#04D1FC',
      tagColor: '#FFFFFF',
      tagPosition: 'sidebar-right',
      content: 'שם ראשון, שם שני, שם שלישי,\nשם רביעי, שם חמישי ושם שישי...\nמזל טוב! מי ייתן וכל משאלות ליבכם יתגשמו :)',
      accentColor: '#FF6B6B',
      showAccentBar: true,
      accentPosition: 'right',
      accentWidth: 4,
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.6,
      paddingVertical: 32,
      paddingHorizontal: 24,
      textAlign: 'right',
      textDirection: 'rtl'
    },
    // 5. Section Header - Special Event
    {
      id: 'section-event',
      type: 'sectionHeader',
      text: 'INTERNATIONAL VEGAN DAY 11/2',
      backgroundColor: '#22C55E',
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '0.05em',
      padding: 12,
      textDirection: 'ltr',
      textAlign: 'center'
    },
    // 6. Event content
    {
      id: 'text-event',
      type: 'text',
      content: 'יום הטבעונות הבינלאומי 2.11\n\nהשנה אנחנו מציינים את יום הטבעונות הבינלאומי עם מגוון פעילויות מיוחדות. הצטרפו אלינו לסדנאות בישול, הרצאות והטעמות.',
      textAlign: 'right',
      textDirection: 'rtl',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      color: '#1D1D1F',
      backgroundColor: '#F0FDF4',
      padding: 32
    },
    // 7. Image collage for event
    {
      id: 'collage-event',
      type: 'imageCollage',
      layout: '2-column',
      images: [],
      gap: 8,
      imageHeight: 200,
      backgroundColor: '#FFFFFF'
    },
    // 8. Section Header - Special Guests
    {
      id: 'section-guests',
      type: 'sectionHeader',
      text: 'SPECIAL GUESTS',
      backgroundColor: '#8B5CF6',
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: 12,
      textDirection: 'ltr',
      textAlign: 'center'
    },
    // 9. Guest visit content with image
    {
      id: 'collage-guests',
      type: 'imageCollage',
      layout: '3-column',
      images: [],
      gap: 8,
      imageHeight: 180,
      backgroundColor: '#FFFFFF'
    },
    // 10. Visit details text
    {
      id: 'text-visit',
      type: 'text',
      content: 'IEV Visit\n\nהשבוע ארחנו משלחת מיוחדת של אורחים בינלאומיים. הביקור כלל סיור במתקנים, פגישות עם הצוות והצגת הפרויקטים האחרונים שלנו.',
      textAlign: 'right',
      textDirection: 'rtl',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      color: '#1D1D1F',
      backgroundColor: '#FFFFFF',
      padding: 32
    },
    // 11. Section Header - Celebrating Work Anniversary
    {
      id: 'section-anniversary',
      type: 'sectionHeader',
      text: 'CELEBRATING ELECTRILEDET',
      backgroundColor: '#0284C7',
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: 12,
      textDirection: 'ltr',
      textAlign: 'center'
    },
    // 12. Work anniversary profiles (4 columns)
    {
      id: 'profiles-anniversary',
      type: 'profileCards',
      profiles: [
        { name: 'שם עובד', title: '4 שנים', image: '' },
        { name: 'שם עובד', title: '4 שנים', image: '' },
        { name: 'שם עובד', title: '4 שנים', image: '' },
        { name: 'שם עובד', title: '4 שנים', image: '' }
      ],
      columns: 4,
      imageShape: 'circular',
      backgroundColor: '#F0F9FF',
      showName: true,
      showTitle: true,
      textDirection: 'rtl',
      textAlign: 'center'
    },
    // 13. Section Header - New Team Members
    {
      id: 'section-newplayers',
      type: 'sectionHeader',
      text: 'SAY HELLO TO OUR NEW PLAYERS!',
      backgroundColor: '#22C55E',
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.05em',
      padding: 12,
      textDirection: 'ltr',
      textAlign: 'center'
    },
    // 14. New team members profiles (2 columns)
    {
      id: 'profiles-new',
      type: 'profileCards',
      profiles: [
        { name: 'שם עובד חדש', title: 'תפקיד', image: '' },
        { name: 'שם עובד חדש', title: 'תפקיד', image: '' }
      ],
      columns: 2,
      imageShape: 'circular',
      backgroundColor: '#F0FDF4',
      showName: true,
      showTitle: true,
      textDirection: 'rtl',
      textAlign: 'center'
    },
    // 15. Section Header - Recipe
    {
      id: 'section-recipe',
      type: 'sectionHeader',
      text: 'THIS MONTH\'S RECIPE CORNER',
      backgroundColor: '#F97316',
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.05em',
      padding: 12,
      textDirection: 'ltr',
      textAlign: 'center'
    },
    // 16. Recipe section
    {
      id: 'recipe-1',
      type: 'recipe',
      title: 'שם המתכון',
      image: null,
      ingredients: 'רכיב 1\nרכיב 2\nרכיב 3\nרכיב 4\nרכיב 5',
      instructions: 'שלב 1: הכנת החומרים\nשלב 2: ערבוב\nשלב 3: בישול\nשלב 4: הגשה',
      backgroundColor: '#FFF7ED',
      textDirection: 'rtl',
      textAlign: 'right'
    },
    // 17. Additional text content
    {
      id: 'text-closing',
      type: 'text',
      content: 'תודה שקראתם את הניוזלטר שלנו!\n\nנתראה בגיליון הבא עם עוד חדשות ועדכונים מרתקים. אם יש לכם נושאים שתרצו שנכסה או רעיונות לשיפור, אנא שתפו אותנו.',
      textAlign: 'right',
      textDirection: 'rtl',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      color: '#1D1D1F',
      backgroundColor: '#FFFFFF',
      padding: 32
    },
    // 18. Footer
    {
      id: 'footer-1',
      type: 'footer',
      backgroundColor: '#0284C7',
      gradientEnd: '#0369A1',
      text: 'Electron\nכתובת החברה\nפרטי התקשרות',
      color: '#FFFFFF',
      fontSize: 14,
      padding: 30,
      textDirection: 'rtl',
      textAlign: 'center'
    }
  ]
};

const WORKSPACE_STORAGE_KEY = 'newsletter-workspace-v2';
const PROJECTS_STORAGE_KEY = 'newsletter-projects-v1';

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [showProjectsDashboard, setShowProjectsDashboard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedHTML, setExportedHTML] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedDesign, setCopiedDesign] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentDbNewsletterId, setCurrentDbNewsletterId] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

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

  // Load saved projects on mount
  useEffect(() => {
    try {
      const projects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (projects) {
        const parsed = JSON.parse(projects);
        setSavedProjects(parsed);
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  }, []);

  // Load saved workspace on mount (for backward compatibility)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.newsletters && parsed.newsletters.length > 0) {
          workspace.loadState(parsed);
          // Don't auto-open, let user choose from landing
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

  // Prevent accidental navigation (trackpad swipe, back button, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if user has newsletters in the workspace
      if (workspace.newsletters.length > 0 && !showLanding) {
        e.preventDefault();
        // Most browsers require returnValue to be set
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [workspace.newsletters.length, showLanding]);

  const handleStart = useCallback(() => {
    setCurrentProjectId(null); // Reset project ID for new project
    workspace.addNewsletter(blankTemplate);
    setShowLanding(false);
    setShowProjectsDashboard(false);
  }, [workspace]);

  const handleStartCompanyTemplate = useCallback(() => {
    setCurrentProjectId(null);
    workspace.addNewsletter(electroNewsTemplate);
    setShowLanding(false);
    setShowProjectsDashboard(false);
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

  // Save current workspace as a project
  const saveCurrentAsProject = useCallback(() => {
    if (!workspace.activeNewsletter) return;
    
    const now = new Date().toISOString();
    const projectData = {
      id: currentProjectId || `project-${Date.now()}`,
      name: workspace.activeNewsletter.name || 'Untitled Newsletter',
      sections: workspace.activeNewsletter.sections || [],
      createdAt: currentProjectId ? savedProjects.find(p => p.id === currentProjectId)?.createdAt : now,
      updatedAt: now
    };
    
    setSavedProjects(prev => {
      const existing = prev.findIndex(p => p.id === projectData.id);
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = projectData;
      } else {
        updated = [projectData, ...prev];
      }
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    if (!currentProjectId) {
      setCurrentProjectId(projectData.id);
    }
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [workspace.activeNewsletter, currentProjectId, savedProjects]);

  // Export current project as JSON file
  const exportToJSON = useCallback(() => {
    if (!workspace.activeNewsletter) return;
    
    const exportData = {
      name: workspace.activeNewsletter.name || 'Untitled Newsletter',
      sections: workspace.activeNewsletter.sections || [],
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [workspace.activeNewsletter]);

  // Import project from JSON file
  const importFromJSON = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.sections || !Array.isArray(importedData.sections)) {
          throw new Error('Invalid file format: missing sections array');
        }
        
        const newsletterData = {
          id: `newsletter-${Date.now()}`,
          name: importedData.name || 'Imported Newsletter',
          sections: importedData.sections,
          position: { x: 100, y: 100 }
        };
        
        workspace.loadState({
          newsletters: [newsletterData],
          activeNewsletterId: newsletterData.id,
          zoom: 1
        });
        
        setCurrentProjectId(null);
        setShowProjectsDashboard(false);
        setShowLanding(false);
        
        alert('Newsletter imported successfully!');
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import file: ' + err.message);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, [workspace]);

  // File input ref for import
  const fileInputRef = React.useRef(null);

  // Load a project into the workspace
  const loadProject = useCallback((project) => {
    const newsletterData = {
      id: `newsletter-${Date.now()}`,
      name: project.name,
      sections: project.sections || [],
      position: { x: 100, y: 100 }
    };
    
    workspace.loadState({
      newsletters: [newsletterData],
      activeNewsletterId: newsletterData.id,
      zoom: 1
    });
    
    setCurrentProjectId(project.id);
    setShowProjectsDashboard(false);
    setShowLanding(false);
  }, [workspace]);

  // Delete a project
  const deleteProject = useCallback((projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setSavedProjects(prev => {
        const updated = prev.filter(p => p.id !== projectId);
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
      }
    }
  }, [currentProjectId]);

  // Duplicate a project
  const duplicateProject = useCallback((projectId) => {
    const project = savedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const now = new Date().toISOString();
    const newProject = {
      ...project,
      id: `project-${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: now,
      updatedAt: now
    };
    
    setSavedProjects(prev => {
      const updated = [newProject, ...prev];
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [savedProjects]);

  // Rename a project
  const renameProject = useCallback((projectId, newName) => {
    setSavedProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId 
          ? { ...p, name: newName, updatedAt: new Date().toISOString() }
          : p
      );
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // Also update workspace if this is the current project
    if (currentProjectId === projectId && workspace.activeNewsletterId) {
      workspace.renameNewsletter(workspace.activeNewsletterId, newName);
    }
  }, [currentProjectId, workspace]);

  const handleBackToLanding = useCallback(() => {
    // Auto-save current project before going back
    if (workspace.activeNewsletter && currentProjectId) {
      saveCurrentAsProject();
    }
    setShowLanding(true);
    setShowProjectsDashboard(false);
  }, [workspace.activeNewsletter, currentProjectId, saveCurrentAsProject]);

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

  // Show projects dashboard
  if (showProjectsDashboard) {
    return (
      <ProjectsDashboard
        projects={savedProjects}
        onSelectProject={loadProject}
        onCreateNew={() => {
          setCurrentProjectId(null);
          handleStart();
          setShowProjectsDashboard(false);
        }}
        onDeleteProject={deleteProject}
        onDuplicateProject={duplicateProject}
        onRenameProject={renameProject}
        onBack={() => {
          setShowProjectsDashboard(false);
          setShowLanding(true);
        }}
      />
    );
  }

  if (showLanding) {
    return (
      <TemplateSelector 
        onSelectTemplate={handleStart}
        onSelectCompanyTemplate={handleStartCompanyTemplate}
        hasSavedNewsletter={workspace.newsletters.length > 0}
        onContinueEditing={handleContinueEditing}
        onShowAuth={() => setShowAuth(true)}
        isAuthenticated={isAuthenticated}
        user={user}
        savedProjects={savedProjects}
        onViewAllProjects={() => setShowProjectsDashboard(true)}
        onSelectProject={loadProject}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Top Bar 1: File & Project Management */}
      <header className="h-11 bg-zinc-900 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToLanding}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-7"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-xs">Home</span>
          </Button>
          
          <div className="h-4 w-px bg-zinc-700" />
          
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-300">
              {workspace.activeNewsletterName || 'Workspace'}
            </span>
          </div>
        </div>

        {/* Center: File Operations */}
        <div className="flex items-center gap-1">
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Open project from file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="text-xs">Open</span>
          </Button>
          <Button 
            onClick={exportToJSON} 
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Save project as JSON file"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="text-xs">Save As</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importFromJSON}
            className="hidden"
          />
          
          <div className="h-4 w-px bg-zinc-700 mx-1" />
          
          <Button 
            onClick={saveCurrentAsProject} 
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 px-2.5",
              saveSuccess 
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="text-xs">Save</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => {
              saveCurrentAsProject();
              setShowProjectsDashboard(true);
              setShowLanding(false);
            }} 
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="text-xs">Projects</span>
          </Button>
          
          {isAuthenticated && (
            <Button 
              onClick={handleSaveToCloud} 
              size="sm"
              variant="ghost"
              disabled={isSaving}
              className="h-7 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {isSaving ? (
                <>
                  <Save className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-xs">Syncing...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="text-xs">Cloud</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right: Auth */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <UserMenu />
          ) : supabaseConfigured ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAuth(true)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-7"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="text-xs">Sign in</span>
            </Button>
          ) : null}
        </div>
      </header>

      {/* Top Bar 2: Tools & Export */}
      <header className="h-11 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sticky top-11 z-40">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => workspace.addNewsletter(blankTemplate)}
            className="text-zinc-600 hover:text-zinc-900 h-7"
            title="New newsletter (⌘N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs">New</span>
          </Button>
          
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.undo}
            disabled={!workspace.canUndo}
            className={cn("text-zinc-600 h-7 w-7 p-0", !workspace.canUndo && "opacity-40 cursor-not-allowed")}
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.redo}
            disabled={!workspace.canRedo}
            className={cn("text-zinc-600 h-7 w-7 p-0", !workspace.canRedo && "opacity-40 cursor-not-allowed")}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.zoomOut}
            className="text-zinc-600 h-7 w-7 p-0"
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] font-mono text-zinc-500 w-9 text-center">
            {Math.round(workspace.zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={workspace.zoomIn}
            className="text-zinc-600 h-7 w-7 p-0"
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Center: Newsletter count */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
            {workspace.newsletters.length} {workspace.newsletters.length === 1 ? 'newsletter' : 'newsletters'}
          </span>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Save className="w-2.5 h-2.5" />
            Auto-saved
          </span>
        </div>

        {/* Right: Share & Export */}
        <div className="flex items-center gap-1.5">
          {workspace.activeNewsletter && (
            <>
              
              <Button 
                onClick={handleExport} 
                size="sm"
                variant="outline"
                className="h-7"
                title="Download as HTML file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs">Download HTML</span>
              </Button>
              <Button 
                onClick={handleCopyDesign} 
                size="sm"
                className={cn(
                  "h-7",
                  copiedDesign 
                    ? "bg-emerald-600 hover:bg-emerald-600" 
                    : "bg-zinc-900 hover:bg-zinc-800"
                )}
                title="Copy HTML for Gmail"
              >
                {copiedDesign ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="text-xs">Copy for Gmail</span>
                  </>
                )}
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
      tag: 'מילות פתיחה',
      tagBg: '#04D1FC',
      tagColor: '#FFFFFF',
      tagPosition: 'sidebar-right',
      content: 'החודש ציינו את יום הטבעונות הבינלאומי עם ארוחת חומוס טעימה במיוחד, הזדמנות נהדרת להתכנס יחד, לטעום, ליהנות ולחוות את האוכל טבעוני.\n\nכמובן שגם חגגנו ימי הולדת לילידי נובמבר, הייתה אווירה חמימה ומשמחת. כמו תמיד היה כיף לראות את כולם מתאחדים כדי לחגוג יחד.',
      accentColor: '#04D1FC',
      showAccentBar: false,
      accentPosition: 'right',
      accentWidth: 4,
      backgroundColor: '#FFFFFF',
      textColor: '#1D1D1F',
      fontFamily: 'Noto Sans Hebrew',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.7,
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
          iconType: 'box',
          iconBg: '#E8E0FF',
          iconColor: '#5856D6',
          title: 'מוצרים בהזמנה אישית',
          description: 'לקוחות יכולים ליצור קולקציה שלמה של מוצרים בהתאמה למותג שלהם ללא צורך בעיצוב ידני.',
          linkText: 'למידע נוסף',
          linkUrl: '#'
        },
        {
          iconType: 'credit-card',
          iconBg: '#E0E8FF',
          iconColor: '#5856D6',
          title: 'קישורי תשלום אוטומטיים',
          description: 'אפשרו קישורי תשלום אוטומטיים כדי שמבקרים יוכלו לשלם ישירות מהודעות אישור.',
          linkText: 'למידע נוסף',
          linkUrl: '#'
        },
        {
          iconType: 'play',
          iconBg: '#FFE8E0',
          iconColor: '#FF6B6B',
          title: 'השקת מוצרים ביוטיוב',
          description: 'מוכרים יכולים כעת לקבוע תאריך פרסום למוצרים ביוטיוב וליצור באזז לפני ההשקה.',
          linkText: 'למידע נוסף',
          linkUrl: '#'
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
          iconType: 'cart',
          iconBg: '#E8FFE8',
          iconColor: '#22C55E',
          name: 'הזמנות חכמות',
          underlineColor: '#FF6B6B',
          description: 'לקוחות יכולים להגדיר כללי כמות למוצרים או קולקציות שלמות כדי למנוע בעיות מלאי.',
          linkText: 'לבדיקה',
          linkUrl: '#'
        },
        {
          iconType: 'image',
          iconBg: '#E0E8FF',
          iconColor: '#5856D6',
          name: 'תמונות מוצר AI',
          underlineColor: '#5856D6',
          description: 'השתמשו ב-AI כדי למקם מוצרים על כל רקע וליצור תמונות מקצועיות בשניות.',
          linkText: 'לבדיקה',
          linkUrl: '#'
        },
        {
          iconType: 'return',
          iconBg: '#FFE8F0',
          iconColor: '#EC4899',
          name: 'ניהול החזרות',
          underlineColor: '#7B5CF0',
          description: 'הפכו את תהליך ההחזרות לקל ללקוחות עם מדיניות מותאמת אישית.',
          linkText: 'לבדיקה',
          linkUrl: '#'
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
