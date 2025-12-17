import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Plus, 
  Type, 
  Image, 
  Users, 
  ChefHat, 
  LayoutTemplate,
  Heading,
  PanelBottom,
  MoveHorizontal,
  Film,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Hash,
  Grid3X3,
  Table,
  MapPin,
  ListOrdered,
  Layers,
  PartyPopper,
  Columns,
  ArrowLeftRight,
  LayoutGrid,
  List,
  AppWindow,
  PanelsTopLeft,
  Megaphone,
  AlignRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

// Basic section types (always visible)
const basicSectionTypes = [
  { type: 'header', label: 'Header', icon: LayoutTemplate },
  { type: 'marquee', label: 'Marquee', icon: MoveHorizontal },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'sectionHeader', label: 'Title', icon: Heading },
  { type: 'imageCollage', label: 'Images', icon: Image },
  { type: 'imageSequence', label: 'Sequence', icon: Film },
  { type: 'profileCards', label: 'Profiles', icon: Users },
  { type: 'recipe', label: 'Recipe', icon: ChefHat },
  { type: 'footer', label: 'Footer', icon: PanelBottom },
];

// Layout section types (in submenu)
const layoutSectionTypes = [
  { type: 'stats', label: 'Stats', icon: Hash, description: 'Numbers grid with labels' },
  { type: 'featureGrid', label: 'Features', icon: Grid3X3, description: 'Image with feature bullets' },
  { type: 'specsTable', label: 'Specs Table', icon: Table, description: 'Key-value pairs table' },
  { type: 'contactCards', label: 'Contact', icon: MapPin, description: 'Location contact cards' },
  { type: 'steps', label: 'Steps', icon: ListOrdered, description: 'Numbered process steps' },
  { type: 'celebration', label: 'Celebration', icon: PartyPopper, description: 'Birthday/celebration badge' },
  { type: 'heroSplit', label: 'Hero Split', icon: Columns, description: 'Headline + text two columns' },
  { type: 'alternating', label: 'Alternating', icon: ArrowLeftRight, description: 'Image/text alternating rows' },
  { type: 'heroBanner', label: 'Hero Banner', icon: Megaphone, description: 'Large title with image' },
  { type: 'accentText', label: 'Accent Text', icon: AlignRight, description: 'Text with accent border' },
  { type: 'featureCards', label: 'Feature Cards', icon: LayoutGrid, description: 'Cards with image and text' },
  { type: 'updatesList', label: 'Updates List', icon: List, description: 'List with icons and links' },
  { type: 'appCards', label: 'App Cards', icon: AppWindow, description: 'App icons with descriptions' },
  { type: 'featureHighlight', label: 'Highlights', icon: PanelsTopLeft, description: 'Feature highlight cards' },
];

function FloatingToolbar({ 
  onAddSection, 
  hasActiveNewsletter,
  isUnlocked,
  onToggleUnlock
}) {
  const [showDock, setShowDock] = useState(false);
  const [showLayoutsSubmenu, setShowLayoutsSubmenu] = useState(false);
  const [mouseX, setMouseX] = useState(null);
  const dockRef = useRef(null);
  const itemRefs = useRef([]);

  const handleSelect = useCallback((type) => {
    onAddSection(type);
    setShowDock(false);
    setShowLayoutsSubmenu(false);
  }, [onAddSection]);

  const handleMouseMove = useCallback((e) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMouseX(e.clientX - rect.left);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  useEffect(() => {
    if (!showDock) {
      setShowLayoutsSubmenu(false);
      return;
    }
    
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setShowDock(false);
        setShowLayoutsSubmenu(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDock(false);
        setShowLayoutsSubmenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDock]);

  const getScale = (index) => {
    if (mouseX === null) return 1;
    
    const itemRef = itemRefs.current[index];
    if (!itemRef) return 1;
    
    const itemRect = itemRef.getBoundingClientRect();
    const dockRect = dockRef.current?.getBoundingClientRect();
    if (!dockRect) return 1;
    
    const itemCenterX = itemRect.left - dockRect.left + itemRect.width / 2;
    const distance = Math.abs(mouseX - itemCenterX);
    
    const maxScale = 1.15;
    const effectRadius = 60;
    
    if (distance > effectRadius) return 1;
    
    const scale = 1 + (maxScale - 1) * Math.cos((distance / effectRadius) * (Math.PI / 2));
    return scale;
  };

  if (!hasActiveNewsletter) return null;

  // Combine basic sections with a "Layouts" entry
  const allItems = [
    ...basicSectionTypes.slice(0, 7), // Before recipe
    { type: 'layouts', label: 'Layouts', icon: Layers, isSubmenu: true },
    ...basicSectionTypes.slice(7), // Recipe and footer
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex flex-col items-center">
        {/* Main Toolbar */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-zinc-200/80 px-1 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDock(!showDock)}
            className={cn(
              "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 px-3 h-8 gap-1.5 rounded-full",
              showDock && "bg-zinc-100 text-zinc-900"
            )}
          >
            <Plus className={cn("w-4 h-4 transition-transform duration-200", showDock && "rotate-45")} />
            <span className="text-xs font-medium">Add Section</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", showDock && "rotate-180")} />
          </Button>

          <div className="w-px h-5 bg-zinc-200" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleUnlock}
            className={cn(
              "h-8 px-3 gap-1.5 rounded-full",
              isUnlocked 
                ? "bg-[#04D1FC] text-white hover:bg-[#04D1FC]/90" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            )}
            title={isUnlocked ? "Lock sections" : "Unlock to reorder"}
          >
            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="text-xs font-medium">{isUnlocked ? 'Reordering' : 'Reorder'}</span>
          </Button>
        </div>

        {/* macOS-style Dock */}
        {showDock && (
          <div 
            ref={dockRef}
            className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Dock Container */}
            <div 
              className="flex items-end gap-3 px-4 py-3 rounded-2xl relative"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.5)'
              }}
            >
              {allItems.map((item, index) => {
                const Icon = item.icon;
                const scale = getScale(index);
                const isHovered = scale > 1.1;
                const isLayoutsButton = item.type === 'layouts';
                
                return (
                  <button
                    key={item.type}
                    ref={el => itemRefs.current[index] = el}
                    onClick={() => {
                      if (isLayoutsButton) {
                        setShowLayoutsSubmenu(!showLayoutsSubmenu);
                      } else {
                        handleSelect(item.type);
                      }
                    }}
                    className="flex flex-col items-center cursor-pointer relative group"
                    style={{
                      transform: `scale(${scale}) translateY(${(1 - scale) * 12}px)`,
                      transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      transformOrigin: 'bottom center',
                      zIndex: isHovered ? 10 : 1
                    }}
                  >
                    {/* Tooltip */}
                    <div 
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap pointer-events-none"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transform: `translateY(${isHovered ? 0 : 4}px)`,
                        transition: 'all 0.15s ease-out'
                      }}
                    >
                      {item.label}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                    </div>
                    
                    {/* Icon Container */}
                    <div 
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center relative",
                        isLayoutsButton && showLayoutsSubmenu && "ring-2 ring-[#04D1FC]"
                      )}
                      style={{ 
                        backgroundColor: isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                        boxShadow: isHovered 
                          ? '0 4px 12px rgba(0,0,0,0.15)' 
                          : '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.15s ease-out'
                      }}
                    >
                      <Icon 
                        className="w-5 h-5"
                        style={{ color: isHovered ? '#1f2937' : '#6b7280' }}
                      />
                      {isLayoutsButton && (
                        <ChevronRight className="w-3 h-3 absolute -right-0.5 -bottom-0.5 text-zinc-400" />
                      )}
                    </div>
                    
                    {/* Dot indicator */}
                    <div 
                      className="w-1 h-1 rounded-full bg-zinc-400 mt-1"
                      style={{
                        opacity: isHovered || (isLayoutsButton && showLayoutsSubmenu) ? 1 : 0,
                        transition: 'opacity 0.15s ease-out'
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Layouts Submenu */}
            {showLayoutsSubmenu && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 mt-2 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{ top: '100%' }}
              >
                <div 
                  className="p-2 rounded-xl min-w-[280px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.5)'
                  }}
                >
                  <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide px-2 py-1 mb-1">
                    Section Layouts
                  </div>
                  {layoutSectionTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleSelect(item.type)}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-100 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-800">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingToolbar;
