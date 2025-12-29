import React, { useState, useRef } from 'react';
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
  MoveHorizontal,
  Film
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import SectionWrapper from './SectionWrapper';
import HeaderSection from './sections/HeaderSection';
import TextSection from './sections/TextSection';
import SectionHeaderSection from './sections/SectionHeaderSection';
import ImageCollageSection from './sections/ImageCollageSection';
import ProfileCardsSection from './sections/ProfileCardsSection';
import RecipeSection from './sections/RecipeSection';
import FooterSection from './sections/FooterSection';
import MarqueeSection from './sections/MarqueeSection';
import ImageSequenceSection from './sections/ImageSequenceSection';
import AccentTextSection from './sections/AccentTextSection';
import PromoCardSection from './sections/PromoCardSection';

const sectionTypes = [
  { type: 'header', label: 'Header', icon: LayoutTemplate },
  { type: 'marquee', label: 'Marquee', icon: MoveHorizontal },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'sectionHeader', label: 'Title', icon: Heading },
  { type: 'accentText', label: 'Accent', icon: Type },
  { type: 'promoCard', label: 'Promo', icon: LayoutTemplate },
  { type: 'imageCollage', label: 'Images', icon: Image },
  { type: 'imageSequence', label: 'Sequence', icon: Film },
  { type: 'profileCards', label: 'Profiles', icon: Users },
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
  isUnlocked 
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

  const renderSection = (section, index) => {
    const isSelected = selectedSection === section.id;
    const isDragged = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    const sectionComponents = {
      header: HeaderSection,
      marquee: MarqueeSection,
      text: TextSection,
      sectionHeader: SectionHeaderSection,
      accentText: AccentTextSection,
      promoCard: PromoCardSection,
      imageCollage: ImageCollageSection,
      imageSequence: ImageSequenceSection,
      profileCards: ProfileCardsSection,
      recipe: RecipeSection,
      footer: FooterSection
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
        onClick={() => !isUnlocked && onSectionClick(section.id)}
      >
        {/* Drag Handle - visible when unlocked */}
        {isUnlocked && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-100/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <GripVertical className="w-4 h-4 text-zinc-400" />
          </div>
        )}

        <SectionWrapper
          outerPadding={section.container?.outerPadding || 0}
          outerPaddingTop={section.container?.outerPaddingTop}
          outerPaddingBottom={section.container?.outerPaddingBottom}
          outerPaddingLeft={section.container?.outerPaddingLeft}
          outerPaddingRight={section.container?.outerPaddingRight}
          outerBackgroundColor={section.container?.outerBackgroundColor || 'transparent'}
          innerBorderWidth={section.container?.innerBorderWidth || 0}
          innerBorderColor={section.container?.innerBorderColor || '#E5E5E5'}
          innerBorderRadius={section.container?.innerBorderRadius || 0}
          innerBackgroundColor={section.container?.innerBackgroundColor || 'transparent'}
          backgroundImage={section.container?.backgroundImage || null}
          backgroundPosition={section.container?.backgroundPosition || 'center'}
          backgroundRepeat={section.container?.backgroundRepeat || 'no-repeat'}
        >
          <SectionComponent 
            {...section} 
            isEditing={isSelected && section.type === 'header'}
            onSpacingChange={section.type === 'header' ? (field, value) => {
              onSectionUpdate?.(section.id, { [field]: value });
            } : undefined}
          />
        </SectionWrapper>
        
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
    <div className="flex flex-col gap-6 relative">
      {/* Floating Add Section Bar */}
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

      {/* Unlock Indicator */}
      {isUnlocked && (
        <div className="mx-auto -mt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#04D1FC]/10 border border-[#04D1FC]/20 rounded-full text-xs font-medium text-[#04D1FC]">
            <GripVertical className="w-3.5 h-3.5" />
            Drag sections to reorder
          </div>
        </div>
      )}

      {/* Newsletter Preview */}
      <div className="mx-auto w-full max-w-[600px]">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          {newsletter.sections.map((section, index) => renderSection(section, index))}
        </div>
      </div>
    </div>
  );
}

export default NewsletterEditor;
