import React, { useState, useRef, useCallback } from 'react';
import { 
  Plus, 
  Type, 
  Image, 
  Users, 
  ChefHat, 
  LayoutTemplate,
  Heading,
  PanelBottom,
  GripVertical,
  GripHorizontal,
  MoveHorizontal,
  Film,
  Hash,
  Grid3X3,
  Table,
  MapPin,
  ListOrdered,
  AlignRight,
  LayoutGrid,
  List,
  AppWindow,
  PanelsTopLeft,
  Megaphone,
  PartyPopper,
  Columns,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import HeaderSection from './sections/HeaderSection';
import TextSection from './sections/TextSection';
import SectionHeaderSection from './sections/SectionHeaderSection';
import ImageCollageSection from './sections/ImageCollageSection';
import ProfileCardsSection from './sections/ProfileCardsSection';
import RecipeSection from './sections/RecipeSection';
import FooterSection from './sections/FooterSection';
import MarqueeSection from './sections/MarqueeSection';
import ImageSequenceSection from './sections/ImageSequenceSection';
import StatsSection from './sections/StatsSection';
import FeatureGridSection from './sections/FeatureGridSection';
import SpecsTableSection from './sections/SpecsTableSection';
import ContactCardsSection from './sections/ContactCardsSection';
import StepsSection from './sections/StepsSection';
import AccentTextSection from './sections/AccentTextSection';
import FeatureCardsSection from './sections/FeatureCardsSection';
import UpdatesListSection from './sections/UpdatesListSection';
import AppCardsSection from './sections/AppCardsSection';
import FeatureHighlightSection from './sections/FeatureHighlightSection';
import HeroBannerSection from './sections/HeroBannerSection';
import CelebrationSection from './sections/CelebrationSection';
import HeroSplitSection from './sections/HeroSplitSection';
import AlternatingSection from './sections/AlternatingSection';
import ShapeDivider from './ShapeDivider';

// Resize Handle Wrapper - only shows when hovering near bottom of section
function ResizeHandleWrapper({ section, onSectionUpdate }) {
  const [showHandle, setShowHandle] = useState(false);
  const isHoveredRef = useRef(false);
  const hideTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowHandle(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    // Delay hiding to allow moving between zones
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setShowHandle(false);
      }
    }, 150);
  }, []);

  return (
    <>
      {/* Invisible hover detection zone at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-10 z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {/* Resize handle - centered on bottom edge, overlapping the selection ring */}
      {showHandle && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]"
          style={{ bottom: '0px' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <SectionResizeHandle
              currentValue={
                section.type === 'imageCollage' || section.type === 'imageSequence'
                  ? (section.imageHeight || 200)
                  : (section.minHeight || 150)
              }
              label={
                section.type === 'imageCollage' || section.type === 'imageSequence'
                  ? "Image Height"
                  : "Section Height"
              }
              onResize={(newValue) => {
                if (section.type === 'imageCollage' || section.type === 'imageSequence') {
                  onSectionUpdate?.(section.id, { imageHeight: newValue });
                } else {
                  onSectionUpdate?.(section.id, { minHeight: newValue });
                }
              }}
            />
        </div>
      )}
    </>
  );
}

// Section Resize Handle Component - for resizing image height in collage sections
function SectionResizeHandle({ currentValue, onResize, sectionRef, label = 'Height' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(currentValue || 200);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startYRef.current = e.clientY;
    
    // Use current value as starting point
    startHeightRef.current = currentValue || 200;
    setDisplayValue(startHeightRef.current);

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startYRef.current;
      const newHeight = Math.max(50, startHeightRef.current + deltaY);
      setDisplayValue(Math.round(newHeight));
      onResize(Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentValue, onResize]);

  return (
    <div 
      className="cursor-ns-resize z-40 transition-all duration-150"
      onMouseDown={handleMouseDown}
    >
      <div className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium",
        "bg-zinc-800/90 text-white/90 shadow-lg backdrop-blur-sm",
        "transition-all duration-150",
        isDragging ? "scale-105 bg-[#04D1FC] text-white" : "hover:bg-zinc-700"
      )}>
        <GripHorizontal className="w-3 h-3 opacity-60" />
        <span>{displayValue}px</span>
      </div>
    </div>
  );
}

const sectionTypes = [
  { type: 'header', label: 'Header', icon: LayoutTemplate },
  { type: 'heroBanner', label: 'Hero', icon: Megaphone },
  { type: 'marquee', label: 'Marquee', icon: MoveHorizontal },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'accentText', label: 'Accent Text', icon: AlignRight },
  { type: 'sectionHeader', label: 'Title', icon: Heading },
  { type: 'imageCollage', label: 'Images', icon: Image },
  { type: 'imageSequence', label: 'Sequence', icon: Film },
  { type: 'profileCards', label: 'Profiles', icon: Users },
  { type: 'featureCards', label: 'Feature Cards', icon: LayoutGrid },
  { type: 'appCards', label: 'App Cards', icon: AppWindow },
  { type: 'updatesList', label: 'Updates List', icon: List },
  { type: 'featureHighlight', label: 'Highlights', icon: PanelsTopLeft },
  { type: 'stats', label: 'Stats', icon: Hash },
  { type: 'featureGrid', label: 'Features', icon: Grid3X3 },
  { type: 'specsTable', label: 'Specs', icon: Table },
  { type: 'contactCards', label: 'Contact', icon: MapPin },
  { type: 'steps', label: 'Steps', icon: ListOrdered },
  { type: 'celebration', label: 'Celebration', icon: PartyPopper },
  { type: 'heroSplit', label: 'Hero Split', icon: Columns },
  { type: 'alternating', label: 'Alternating', icon: ArrowLeftRight },
  { type: 'recipe', label: 'Recipe', icon: ChefHat },
  { type: 'footer', label: 'Footer', icon: PanelBottom },
];

function NewsletterEditor({ 
  newsletter, 
  selectedSection, 
  onSectionClick, 
  onAddSection,
  onReorderSections,
  onSectionUpdate,
  isUnlocked,
  compact = false
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragCounter = useRef(0);

  if (!newsletter) return null;

  const handleDragStart = (e, index) => {
    if (!isUnlocked) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a slight delay to show the drag effect
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e, index) => {
    if (!isUnlocked || draggedIndex === null) return;
    e.preventDefault();
    dragCounter.current++;
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e) => {
    if (!isUnlocked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    if (!isUnlocked || draggedIndex === null) return;
    
    if (draggedIndex !== toIndex) {
      onReorderSections(draggedIndex, toIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  // Store refs for each section
  const sectionRefs = useRef({});

  const renderSection = (section, index) => {
    const isSelected = selectedSection === section.id;
    const isDragged = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    // Create ref for this section if not exists
    if (!sectionRefs.current[section.id]) {
      sectionRefs.current[section.id] = React.createRef();
    }
    const sectionRef = sectionRefs.current[section.id];

    const sectionComponents = {
      header: HeaderSection,
      marquee: MarqueeSection,
      text: TextSection,
      sectionHeader: SectionHeaderSection,
      imageCollage: ImageCollageSection,
      imageSequence: ImageSequenceSection,
      profileCards: ProfileCardsSection,
      recipe: RecipeSection,
      footer: FooterSection,
      stats: StatsSection,
      featureGrid: FeatureGridSection,
      specsTable: SpecsTableSection,
      contactCards: ContactCardsSection,
      steps: StepsSection,
      accentText: AccentTextSection,
      featureCards: FeatureCardsSection,
      updatesList: UpdatesListSection,
      appCards: AppCardsSection,
      featureHighlight: FeatureHighlightSection,
      heroBanner: HeroBannerSection,
      celebration: CelebrationSection,
      heroSplit: HeroSplitSection,
      alternating: AlternatingSection
    };

    const SectionComponent = sectionComponents[section.type];

    if (!SectionComponent) {
      return (
        <div 
          key={section.id} 
          className={cn(
            "relative cursor-pointer transition-all duration-200",
            isSelected && "ring-2 ring-zinc-900 ring-offset-2"
          )}
          onClick={() => onSectionClick(section.id)}
        >
          <div className="p-5 bg-red-50 text-red-600 text-sm">
            Unknown section type: {section.type}
          </div>
        </div>
      );
    }

    return (
      <div 
        key={section.id} 
        ref={sectionRef}
        data-section-id={section.id}
        draggable={isUnlocked}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragLeave={(e) => handleDragLeave(e, index)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        className={cn(
          "relative cursor-pointer transition-all duration-200 group",
          isSelected ? "ring-2 ring-zinc-900 ring-offset-2 rounded-sm" : "hover:ring-2 hover:ring-zinc-300 hover:ring-offset-2 rounded-sm",
          isDragged && "opacity-50",
          isDragOver && "ring-2 ring-[#04D1FC] ring-offset-2 rounded-sm",
          isUnlocked && "cursor-grab active:cursor-grabbing"
        )}
        style={{ 
          // For image sections: height auto, resize controls imageHeight
          // For other sections: minHeight for vertical alignment
          ...(section.type !== 'imageCollage' && section.type !== 'imageSequence' && section.minHeight ? {
            minHeight: `${section.minHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: section.verticalAlign === 'top' ? 'flex-start' : 
                           section.verticalAlign === 'bottom' ? 'flex-end' : 'center'
          } : {})
        }}
        onClick={() => !isUnlocked && onSectionClick(section.id)}
      >
        {/* Top Shape Divider */}
        {section.topDivider && section.topDivider !== 'none' && (
          <ShapeDivider
            dividerId={section.topDivider}
            position="top"
            flip={section.topDividerFlip}
            flipV={section.topDividerFlipV}
            color={section.topDividerColor || '#FFFFFF'}
            height={section.topDividerHeight || 40}
          />
        )}

        {/* Drag Handle - visible when unlocked */}
        {isUnlocked && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-100/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <GripVertical className="w-4 h-4 text-zinc-400" />
          </div>
        )}

        <SectionComponent 
          {...section} 
          isEditing={isSelected && section.type === 'header'}
          isSelected={isSelected}
          onSpacingChange={section.type === 'header' ? (field, value) => {
            onSectionUpdate?.(section.id, { [field]: value });
          } : undefined}
          onContentChange={
            section.type === 'text' ? (newContent) => {
              onSectionUpdate?.(section.id, { content: newContent });
            } : section.type === 'sectionHeader' ? (newContent) => {
              onSectionUpdate?.(section.id, { text: newContent });
            } : undefined
          }
          onTextChange={
            ['stats', 'featureGrid', 'specsTable', 'contactCards', 'steps', 'profileCards', 'accentText', 'featureCards', 'updatesList', 'appCards', 'featureHighlight', 'heroBanner', 'celebration', 'heroSplit', 'alternating'].includes(section.type)
              ? (field, value) => {
                  // Parse field to determine what to update
                  // Format: "title", "subtitle", "stat-0-value", "stat-0-label", etc.
                  if (field === 'title' || field === 'subtitle' || field === 'sectionLabel' || field === 'tag' || field === 'content' || field === 'headerCta' || field === 'badgeText' || field === 'names' || field === 'message' || field === 'headline' || field === 'description' || field === 'linkText' || field === 'headerLinkText') {
                    onSectionUpdate?.(section.id, { [field]: value });
                  } else if (field.startsWith('stat-')) {
                    // stat-0-value, stat-0-label
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2]; // 'value' or 'label'
                    const stats = [...(section.stats || [])];
                    if (stats[index]) {
                      stats[index] = { ...stats[index], [prop]: value };
                      onSectionUpdate?.(section.id, { stats });
                    }
                  } else if (field.startsWith('feature-')) {
                    // feature-0-title, feature-0-description, feature-0-number
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const features = [...(section.features || [])];
                    if (features[index]) {
                      features[index] = { ...features[index], [prop]: value };
                      onSectionUpdate?.(section.id, { features });
                    }
                  } else if (field.startsWith('spec-')) {
                    // spec-0-label, spec-0-value
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const specs = [...(section.specs || [])];
                    if (specs[index]) {
                      specs[index] = { ...specs[index], [prop]: value };
                      onSectionUpdate?.(section.id, { specs });
                    }
                  } else if (field.startsWith('contact-')) {
                    // contact-0-city, contact-0-phone, etc.
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const contacts = [...(section.contacts || [])];
                    if (contacts[index]) {
                      contacts[index] = { ...contacts[index], [prop]: value };
                      onSectionUpdate?.(section.id, { contacts });
                    }
                  } else if (field.startsWith('step-')) {
                    // step-0-number, step-0-title, step-0-note
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const steps = [...(section.steps || [])];
                    if (steps[index]) {
                      steps[index] = { ...steps[index], [prop]: value };
                      onSectionUpdate?.(section.id, { steps });
                    }
                  } else if (field.startsWith('profile-')) {
                    // profile-0-name, profile-0-title
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2]; // 'name' or 'title'
                    const profiles = [...(section.profiles || [])];
                    // Ensure the profile exists at this index
                    while (profiles.length <= index) {
                      profiles.push({ name: '', title: '' });
                    }
                    profiles[index] = { ...profiles[index], [prop]: value };
                    onSectionUpdate?.(section.id, { profiles });
                  } else if (field.startsWith('card-')) {
                    // card-0-title, card-0-description, card-0-label, card-0-cta, card-0-name
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const cards = [...(section.cards || [])];
                    if (cards[index]) {
                      cards[index] = { ...cards[index], [prop]: value };
                      onSectionUpdate?.(section.id, { cards });
                    }
                  } else if (field.startsWith('item-')) {
                    // item-0-title, item-0-description, item-0-cta
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const items = [...(section.items || [])];
                    if (items[index]) {
                      items[index] = { ...items[index], [prop]: value };
                      onSectionUpdate?.(section.id, { items });
                    }
                  } else if (field.startsWith('highlight-')) {
                    // highlight-0-title, highlight-0-description, highlight-0-cta
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const highlights = [...(section.highlights || [])];
                    if (highlights[index]) {
                      highlights[index] = { ...highlights[index], [prop]: value };
                      onSectionUpdate?.(section.id, { highlights });
                    }
                  } else if (field.startsWith('row-')) {
                    // row-0-title, row-0-description, row-0-linkText
                    const parts = field.split('-');
                    const index = parseInt(parts[1]);
                    const prop = parts[2];
                    const rows = [...(section.rows || [])];
                    if (rows[index]) {
                      rows[index] = { ...rows[index], [prop]: value };
                      onSectionUpdate?.(section.id, { rows });
                    }
                  }
                }
              : undefined
          }
        />

        {/* Bottom Shape Divider */}
        {section.bottomDivider && section.bottomDivider !== 'none' && (
          <ShapeDivider
            dividerId={section.bottomDivider}
            position="bottom"
            flip={section.bottomDividerFlip}
            flipV={section.bottomDividerFlipV}
            color={section.bottomDividerColor || '#FFFFFF'}
            height={section.bottomDividerHeight || 40}
          />
        )}

        {/* Resize Handle - appears only when hovering near bottom edge */}
        {!isUnlocked && <ResizeHandleWrapper section={section} onSectionUpdate={onSectionUpdate} />}
        
        {/* Selection indicator */}
        {isSelected && !isUnlocked && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-900 text-white text-xs font-medium">
              {section.type}
            </span>
          </div>
        )}

        {/* Drop indicator */}
        {isDragOver && draggedIndex !== null && draggedIndex !== index && (
          <div className={cn(
            "absolute left-0 right-0 h-1 bg-[#04D1FC] rounded-full z-30",
            draggedIndex < index ? "bottom-0 translate-y-1/2" : "top-0 -translate-y-1/2"
          )} />
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col relative", compact ? "gap-0" : "gap-6")}>
      {/* Floating Add Section Bar - hidden in compact mode */}
      {!compact && (
        <div className="sticky top-0 z-40 mx-auto">
          <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-zinc-200/80">
            <span className="text-[10px] text-zinc-400 px-2 font-medium uppercase tracking-wide">Add</span>
            <div className="h-4 w-px bg-zinc-200" />
            {sectionTypes.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => onAddSection(type)}
                className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 px-2 h-8"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px]">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Unlock Indicator - hidden in compact mode */}
      {!compact && isUnlocked && (
        <div className="mx-auto -mt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#04D1FC]/10 border border-[#04D1FC]/20 rounded-full text-xs font-medium text-[#04D1FC]">
            <GripVertical className="w-3.5 h-3.5" />
            Drag sections to reorder
          </div>
        </div>
      )}

      {/* Newsletter Preview */}
      <div className={cn("w-full", !compact && "mx-auto max-w-[600px]")}>
        <div className={cn(
          "bg-white overflow-hidden",
          !compact && "rounded-xl shadow-sm border border-zinc-200"
        )}>
          {newsletter.sections.map((section, index) => renderSection(section, index))}
        </div>
      </div>
    </div>
  );
}

export default NewsletterEditor;
