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
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

const sectionTypes = [
  { type: 'header', label: 'Header', icon: LayoutTemplate, color: '#6366F1' },
  { type: 'marquee', label: 'Marquee', icon: MoveHorizontal, color: '#EC4899' },
  { type: 'text', label: 'Text', icon: Type, color: '#10B981' },
  { type: 'sectionHeader', label: 'Title', icon: Heading, color: '#F59E0B' },
  { type: 'imageCollage', label: 'Images', icon: Image, color: '#04D1FC' },
  { type: 'imageSequence', label: 'Sequence', icon: Film, color: '#8B5CF6' },
  { type: 'profileCards', label: 'Profiles', icon: Users, color: '#EF4444' },
  { type: 'recipe', label: 'Recipe', icon: ChefHat, color: '#F97316' },
  { type: 'footer', label: 'Footer', icon: PanelBottom, color: '#64748B' },
];

function FloatingToolbar({ 
  onAddSection, 
  hasActiveNewsletter,
  isUnlocked,
  onToggleUnlock
}) {
  const [showDock, setShowDock] = useState(false);
  const [mouseX, setMouseX] = useState(null);
  const dockRef = useRef(null);
  const itemRefs = useRef([]);

  const handleSelect = useCallback((type) => {
    onAddSection(type);
    setShowDock(false);
  }, [onAddSection]);

  // Handle mouse move for magnification effect
  const handleMouseMove = useCallback((e) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMouseX(e.clientX - rect.left);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!showDock) return;
    
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setShowDock(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDock(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDock]);

  // Calculate scale based on distance from mouse
  const getScale = (index) => {
    if (mouseX === null) return 1;
    
    const itemRef = itemRefs.current[index];
    if (!itemRef) return 1;
    
    const itemRect = itemRef.getBoundingClientRect();
    const dockRect = dockRef.current?.getBoundingClientRect();
    if (!dockRect) return 1;
    
    const itemCenterX = itemRect.left - dockRect.left + itemRect.width / 2;
    const distance = Math.abs(mouseX - itemCenterX);
    
    // Magnification parameters
    const maxScale = 1.15;
    const effectRadius = 60; // pixels
    
    if (distance > effectRadius) return 1;
    
    // Smooth falloff using cosine
    const scale = 1 + (maxScale - 1) * Math.cos((distance / effectRadius) * (Math.PI / 2));
    return scale;
  };

  if (!hasActiveNewsletter) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex flex-col items-center">
        {/* Main Toolbar */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-zinc-200/80 px-1 py-1">
          {/* Add Section Button */}
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

          {/* Reorder Toggle */}
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
            {/* Dock Container */}
            <div 
              className="flex items-end gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.5)'
              }}
            >
              {sectionTypes.map((item, index) => {
                const Icon = item.icon;
                const scale = getScale(index);
                const isHovered = scale > 1.1;
                
                return (
                  <button
                    key={item.type}
                    ref={el => itemRefs.current[index] = el}
                    onClick={() => handleSelect(item.type)}
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
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
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
                    </div>
                    
                    {/* Dot indicator on hover */}
                    <div 
                      className="w-1 h-1 rounded-full bg-zinc-400 mt-1"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.15s ease-out'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingToolbar;
