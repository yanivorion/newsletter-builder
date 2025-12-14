import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Trash2, 
  Copy, 
  MoveUp, 
  MoveDown,
  Type,
  Palette,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignCenterVertical,
  Bold,
  Italic,
  Minus,
  Plus,
  Upload,
  Layers,
  Grid3X3,
  LetterText,
  AlignVerticalSpaceAround,
  GripHorizontal,
  ImageIcon,
  Waves,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  Sparkles,
  X,
  User
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import CollagePresetPicker from './CollagePresetPicker';
import ShapeDividerPicker from './ShapeDividerPicker';
import { mediaKit, getLogosByCategory } from '../lib/mediaKit';

// Theme colors for dividers
const DIVIDER_THEME_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Electric Blue', value: '#04D1FC' },
  { name: 'Persian Green', value: '#17A298' },
  { name: 'Black', value: '#120F0F' },
  { name: 'Horizon', value: '#F2D64C' },
  { name: 'Settle Ember', value: '#FF7B3E' },
  { name: 'Deep Purple', value: '#5B2C6F' },
  { name: 'Grey', value: '#E1E1E1' },
];

// Quick colors
const QUICK_COLORS = [
  '#04D1FC', '#17A298', '#120F0F', '#FFFFFF',
  '#FF6B6B', '#FFD93D', '#6C5CE7', '#00B894',
];

const REMOVE_BG_API_KEY = 'rDrPT41QWFrheRJc4MARam3m';

// Theme gradients
const THEME_GRADIENTS = [
  { name: 'Electric Blue', start: '#04D1FC', end: '#17A298' },
  { name: 'Sunset', start: '#FF7B3E', end: '#F2D64C' },
  { name: 'Deep Purple', start: '#5B2C6F', end: '#04D1FC' },
  { name: 'Dark', start: '#120F0F', end: '#5E5E5E' },
  { name: 'Ocean', start: '#667eea', end: '#764ba2' },
  { name: 'Emerald', start: '#11998e', end: '#38ef7d' },
];

function SectionActionBar({ 
  section, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onMoveUp,
  onMoveDown,
  position = { top: 0, right: -320 }
}) {
  const [expanded, setExpanded] = useState({});
  const [mediaCategory, setMediaCategory] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prevSectionId, setPrevSectionId] = useState(null);
  const fileInputRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const barRef = useRef(null);
  
  // Draggable state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [barPosition, setBarPosition] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  // Reset position AND close all tabs when section changes
  useEffect(() => {
    if (section?.id !== prevSectionId) {
      setBarPosition({ x: 0, y: 0 });
      setHasBeenDragged(false); // Reset drag state so it goes back to default position
      setExpanded({}); // Close all tabs
      setPrevSectionId(section?.id);
    }
  }, [section?.id, prevSectionId]);

  const handleDragStart = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const rect = barRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      // Store initial position on first drag
      if (!hasBeenDragged) {
        setBarPosition({
          x: rect.left,
          y: rect.top
        });
        setHasBeenDragged(true);
      }
    }
  }, [hasBeenDragged]);

  const handleDrag = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // Calculate new position directly from mouse position minus offset
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Clamp to viewport bounds
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 100;
    
    setBarPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  // Accordion behavior - close others when opening one
  const toggleExpand = (key) => {
    setExpanded(prev => {
      const isCurrentlyOpen = prev[key];
      // Close all tabs, then open this one if it was closed
      return isCurrentlyOpen ? {} : { [key]: true };
    });
  };

  const handleColorChange = useCallback((field, color) => {
    onUpdate({ [field]: color });
  }, [onUpdate]);

  // Remove background from image
  const handleRemoveBackground = useCallback(async (imageField) => {
    const imageData = section?.[imageField];
    if (!imageData) {
      alert('No image to process');
      return;
    }

    setIsProcessing(true);
    try {
      const base64Data = imageData.split(',')[1];
      if (!base64Data) throw new Error('Invalid image data');
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('image_file', blob, 'image.png');
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove.bg API error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const resultBlob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => onUpdate({ [imageField]: e.target.result });
      reader.readAsDataURL(resultBlob);
    } catch (error) {
      console.error('Remove background error:', error);
      alert(`Failed to remove background: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [section, onUpdate]);

  const handleFileUpload = useCallback((e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onUpdate({ [field]: ev.target.result });
      reader.readAsDataURL(file);
    }
  }, [onUpdate]);

  // Reusable divider controls
  const renderDividerControls = () => (
    <ActionGroup label="Divider" icon={Waves} expanded={expanded.divider} onToggle={() => toggleExpand('divider')}>
      <div className="space-y-3">
        {/* Top Divider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-medium">Top Divider</span>
            <div className="flex gap-0.5">
              <Button
                variant={section.topDividerFlip ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onUpdate({ topDividerFlip: !section.topDividerFlip })}
                className="h-5 w-5 p-0"
                title="Flip horizontal"
              >
                <FlipHorizontal className="w-3 h-3" />
              </Button>
              <Button
                variant={section.topDividerFlipV ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onUpdate({ topDividerFlipV: !section.topDividerFlipV })}
                className="h-5 w-5 p-0"
                title="Flip vertical"
              >
                <FlipVertical className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {/* Theme Colors for Top Divider */}
          <div className="flex items-center gap-1 flex-wrap">
            {DIVIDER_THEME_COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => onUpdate({ topDividerColor: color.value })}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-transform hover:scale-110",
                  section.topDividerColor === color.value ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={section.topDividerColor || '#FFFFFF'}
              onChange={(e) => onUpdate({ topDividerColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border border-zinc-200"
              title="Custom color"
            />
          </div>
          <ShapeDividerPicker
            currentDivider={section.topDivider || 'none'}
            onSelectDivider={(id) => onUpdate({ topDivider: id })}
            position="top"
            flip={section.topDividerFlip}
          />
          {section.topDivider && section.topDivider !== 'none' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 w-10">Height</span>
              <NumberStepper
                value={section.topDividerHeight || 40}
                onChange={(v) => onUpdate({ topDividerHeight: v })}
                min={20}
                max={150}
                step={10}
                suffix="px"
              />
            </div>
          )}
        </div>
        
        {/* Bottom Divider */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-medium">Bottom Divider</span>
            <div className="flex gap-0.5">
              <Button
                variant={section.bottomDividerFlip ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onUpdate({ bottomDividerFlip: !section.bottomDividerFlip })}
                className="h-5 w-5 p-0"
                title="Flip horizontal"
              >
                <FlipHorizontal className="w-3 h-3" />
              </Button>
              <Button
                variant={section.bottomDividerFlipV ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onUpdate({ bottomDividerFlipV: !section.bottomDividerFlipV })}
                className="h-5 w-5 p-0"
                title="Flip vertical"
              >
                <FlipVertical className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {/* Theme Colors for Bottom Divider */}
          <div className="flex items-center gap-1 flex-wrap">
            {DIVIDER_THEME_COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => onUpdate({ bottomDividerColor: color.value })}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-transform hover:scale-110",
                  section.bottomDividerColor === color.value ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={section.bottomDividerColor || '#FFFFFF'}
              onChange={(e) => onUpdate({ bottomDividerColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border border-zinc-200"
              title="Custom color"
            />
          </div>
          <ShapeDividerPicker
            currentDivider={section.bottomDivider || 'none'}
            onSelectDivider={(id) => onUpdate({ bottomDivider: id })}
            position="bottom"
            flip={section.bottomDividerFlip}
          />
          {section.bottomDivider && section.bottomDivider !== 'none' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 w-10">Height</span>
              <NumberStepper
                value={section.bottomDividerHeight || 40}
                onChange={(v) => onUpdate({ bottomDividerHeight: v })}
                min={20}
                max={150}
                step={10}
                suffix="px"
              />
            </div>
          )}
        </div>
      </div>
    </ActionGroup>
  );

  // Reusable background controls for all sections
  const renderBackgroundControls = () => (
    <ActionGroup label="Background" icon={Palette} expanded={expanded.background} onToggle={() => toggleExpand('background')}>
      <div className="space-y-3">
        {/* Background Type Selector */}
        <div className="flex gap-1">
          {['solid', 'gradient', 'image'].map(type => (
            <button
              key={type}
              onClick={() => onUpdate({ backgroundType: type })}
              className={cn(
                "flex-1 px-2 py-1 rounded text-[9px] font-medium transition-colors capitalize",
                (section.backgroundType || 'solid') === type 
                  ? "bg-zinc-900 text-white" 
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Solid Color Options */}
        {(!section.backgroundType || section.backgroundType === 'solid') && (
          <div className="space-y-2">
            <p className="text-[9px] text-zinc-400 font-medium">Theme Colors</p>
            <div className="flex flex-wrap gap-1">
              {DIVIDER_THEME_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => onUpdate({ backgroundColor: color.value })}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                    section.backgroundColor === color.value ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <input
                type="color"
                value={section.backgroundColor || '#FFFFFF'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-zinc-200"
                title="Custom color"
              />
            </div>
          </div>
        )}

        {/* Gradient Options */}
        {section.backgroundType === 'gradient' && (
          <div className="space-y-2">
            <p className="text-[9px] text-zinc-400 font-medium">Theme Gradients</p>
            <div className="grid grid-cols-3 gap-1.5">
              {THEME_GRADIENTS.map((gradient) => (
                <button
                  key={gradient.name}
                  onClick={() => onUpdate({ 
                    backgroundColor: gradient.start, 
                    gradientEnd: gradient.end 
                  })}
                  className={cn(
                    "h-8 rounded-lg border-2 transition-all",
                    section.backgroundColor === gradient.start && section.gradientEnd === gradient.end 
                      ? "border-zinc-900 ring-1 ring-zinc-900" 
                      : "border-zinc-200"
                  )}
                  style={{ 
                    background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)` 
                  }}
                  title={gradient.name}
                />
              ))}
            </div>
            <div className="h-px bg-zinc-100 my-2" />
            <p className="text-[9px] text-zinc-400 font-medium">Custom Gradient</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-zinc-400">Start</span>
                <input
                  type="color"
                  value={section.backgroundColor || '#04D1FC'}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-zinc-200"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-zinc-400">End</span>
                <input
                  type="color"
                  value={section.gradientEnd || '#17A298'}
                  onChange={(e) => onUpdate({ gradientEnd: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-zinc-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Background Options */}
        {section.backgroundType === 'image' && (
          <div className="space-y-2">
            {section.backgroundImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={section.backgroundImage} 
                  alt="Background" 
                  className="w-full h-20 object-cover"
                />
                <div className="absolute top-1 right-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBackground('backgroundImage')}
                    disabled={isProcessing}
                    className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                    title="Remove background"
                  >
                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate({ backgroundImage: null })}
                    className="h-6 w-6 p-0 bg-white/80 hover:bg-red-50 text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  ref={bgImageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bgImageInputRef.current?.click()}
                  className="h-8 text-xs w-full"
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Upload Background Image
                </Button>
              </>
            )}

            {/* Overlay Controls - only show when image is set */}
            {section.backgroundImage && (
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-400 font-medium">Overlay</span>
                  <input
                    type="color"
                    value={section.overlayColor || '#000000'}
                    onChange={(e) => onUpdate({ overlayColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border border-zinc-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-400 w-12">Opacity</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={section.overlayOpacity || 0}
                    onChange={(e) => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
                    className="flex-1 h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-600 w-8">{section.overlayOpacity || 0}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ActionGroup>
  );

  // Render section-specific controls
  const renderControls = () => {
    switch (section.type) {
      case 'header':
        return renderHeaderControls();
      case 'text':
        return renderTextControls();
      case 'sectionHeader':
        return renderSectionHeaderControls();
      case 'imageCollage':
        return renderImageCollageControls();
      case 'marquee':
        return renderMarqueeControls();
      case 'footer':
        return renderFooterControls();
      case 'profileCards':
        return renderProfileCardsControls();
      case 'recipe':
        return renderRecipeControls();
      default:
        return renderDefaultControls();
    }
  };

  const renderHeaderControls = () => (
    <>
      {/* Logo / Media */}
      <ActionGroup label="Logo / Media" icon={Image} expanded={expanded.logo} onToggle={() => toggleExpand('logo')}>
        <div className="space-y-3">
          {/* Preview */}
          {section.logo && (
            <div className="relative w-full h-16 bg-zinc-100 rounded-lg overflow-hidden">
              <img 
                src={section.logo} 
                alt="Logo preview" 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBackground('logo')}
                  disabled={isProcessing}
                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                  title="Remove background"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdate({ logo: null })}
                  className="h-6 w-6 p-0 bg-white/80 hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Media Kit Library */}
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-400 font-medium">Media Library</p>
            
            {/* Category Filter */}
            <div className="flex gap-1">
              {mediaKit.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setMediaCategory(cat.id)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-medium transition-colors",
                    mediaCategory === cat.id 
                      ? "bg-zinc-900 text-white" 
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            
            {/* Logos Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto">
              {getLogosByCategory(mediaCategory).map((logo) => (
                <button
                  key={logo.id}
                  onClick={() => onUpdate({ logo: logo.url })}
                  className={cn(
                    "relative rounded-lg border p-1.5 hover:border-[#04D1FC] hover:ring-1 hover:ring-[#04D1FC]/20 transition-all bg-white overflow-hidden",
                    section.logo === logo.url ? "border-[#04D1FC] ring-1 ring-[#04D1FC]/20" : "border-zinc-200"
                  )}
                >
                  <div className="h-10 flex items-center justify-center bg-zinc-50 rounded overflow-hidden">
                    <img 
                      src={logo.url} 
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[8px] text-center mt-1 truncate text-zinc-500">
                    {logo.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-zinc-100 pt-2">
            <p className="text-[10px] text-zinc-400 font-medium mb-2">Or upload custom</p>
            
            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'logo')}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 text-xs w-full"
            >
              <Upload className="w-3 h-3 mr-1.5" />
              Upload Image
            </Button>
            
            {/* URL Input */}
            <input
              type="text"
              placeholder="Or paste image URL..."
              className="w-full h-7 px-2 text-xs rounded border border-zinc-200 focus:outline-none focus:border-[#04D1FC] mt-1.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  onUpdate({ logo: e.target.value });
                  e.target.value = '';
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  onUpdate({ logo: e.target.value });
                  e.target.value = '';
                }
              }}
            />
          </div>
          
          {/* Logo Size */}
          {section.logo && (
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
              <span className="text-[10px] text-zinc-400 w-8">Size</span>
              <NumberStepper
                value={section.logoSize || 40}
                onChange={(v) => onUpdate({ logoSize: v })}
                min={20}
                max={120}
                step={5}
                suffix="px"
              />
            </div>
          )}
        </div>
      </ActionGroup>

      {/* Colors */}
      <ActionGroup label="Colors" icon={Palette} expanded={expanded.colors} onToggle={() => toggleExpand('colors')}>
        <div className="flex gap-1 flex-wrap">
          {QUICK_COLORS.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange('backgroundColor', color)}
              className={cn(
                "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                section.backgroundColor === color ? "border-zinc-900" : "border-zinc-200"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-zinc-400">Text</span>
          <input
            type="color"
            value={section.textColor || '#FFFFFF'}
            onChange={(e) => handleColorChange('textColor', e.target.value)}
            className="w-6 h-6 rounded cursor-pointer"
          />
        </div>
      </ActionGroup>

      {/* Title Typography */}
      <ActionGroup label="Title" icon={Type} expanded={expanded.title} onToggle={() => toggleExpand('title')}>
        <div className="space-y-2">
          {/* Title Text Input */}
          <input
            type="text"
            value={section.title || 'Newsletter'}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter title..."
            className="w-full h-8 px-2 text-sm font-medium rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#04D1FC] focus:border-transparent"
          />
          <div className="flex items-center gap-1">
            <NumberStepper
              value={section.titleFontSize || 28}
              onChange={(v) => onUpdate({ titleFontSize: v })}
              min={12}
              max={72}
              suffix="px"
            />
            <Button
              variant={section.titleFontWeight === '700' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ titleFontWeight: section.titleFontWeight === '700' ? '400' : '700' })}
              className="h-7 w-7 p-0"
            >
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              variant={section.titleFontStyle === 'italic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ titleFontStyle: section.titleFontStyle === 'italic' ? 'normal' : 'italic' })}
              className="h-7 w-7 p-0"
            >
              <Italic className="w-3 h-3" />
            </Button>
          </div>
          {/* Kerning */}
          <div className="flex items-center gap-2">
            <LetterText className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-400 w-12">Kerning</span>
            <select
              value={section.titleLetterSpacing || '-0.02em'}
              onChange={(e) => onUpdate({ titleLetterSpacing: e.target.value })}
              className="flex-1 h-6 text-xs rounded border border-zinc-200 px-1"
            >
              <option value="-0.05em">Tight</option>
              <option value="-0.02em">Snug</option>
              <option value="0">Normal</option>
              <option value="0.02em">Wide</option>
              <option value="0.05em">Wider</option>
            </select>
          </div>
          {/* Leading */}
          <div className="flex items-center gap-2">
            <AlignVerticalSpaceAround className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-400 w-12">Leading</span>
            <select
              value={section.titleLineHeight || '1.2'}
              onChange={(e) => onUpdate({ titleLineHeight: parseFloat(e.target.value) })}
              className="flex-1 h-6 text-xs rounded border border-zinc-200 px-1"
            >
              <option value="1">Tight (1.0)</option>
              <option value="1.1">Snug (1.1)</option>
              <option value="1.2">Normal (1.2)</option>
              <option value="1.4">Relaxed (1.4)</option>
              <option value="1.6">Loose (1.6)</option>
            </select>
          </div>
        </div>
      </ActionGroup>

      {/* Vertical Alignment */}
      <ActionGroup label="Vertical Align" icon={AlignCenterVertical} expanded={expanded.verticalAlign} onToggle={() => toggleExpand('verticalAlign')}>
        <VerticalAlignControl 
          value={section.verticalAlign || 'center'} 
          onChange={(v) => onUpdate({ verticalAlign: v })} 
        />
      </ActionGroup>

      {/* Background */}
      {renderBackgroundControls()}

      {/* Divider */}
      {renderDividerControls()}
    </>
  );

  const renderTextControls = () => (
    <>
      {/* Text Content Editor */}
      <ActionGroup label="Content" icon={Type} expanded={expanded.content} onToggle={() => toggleExpand('content')}>
        <textarea
          value={section.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter your text here..."
          className="w-full h-24 p-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent resize-none"
        />
      </ActionGroup>

      {/* Alignment */}
      <ActionGroup label="Align" icon={AlignCenter} expanded={expanded.align} onToggle={() => toggleExpand('align')}>
        <div className="space-y-2">
          {/* Horizontal */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-10">H</span>
            <div className="flex gap-0.5">
              {[
                { align: 'left', Icon: AlignLeft },
                { align: 'center', Icon: AlignCenter },
                { align: 'right', Icon: AlignRight },
              ].map(({ align, Icon }) => (
                <Button
                  key={align}
                  variant={section.textAlign === align ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onUpdate({ textAlign: align })}
                  className="h-7 w-7 p-0"
                >
                  <Icon className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
          {/* Vertical */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-10">V</span>
            <VerticalAlignControl 
              value={section.verticalAlign || 'center'} 
              onChange={(v) => onUpdate({ verticalAlign: v })} 
            />
          </div>
        </div>
      </ActionGroup>

      {/* Font Size */}
      <ActionGroup label="Size" icon={Type} expanded={expanded.size} onToggle={() => toggleExpand('size')}>
        <NumberStepper
          value={section.fontSize || 16}
          onChange={(v) => onUpdate({ fontSize: v })}
          min={10}
          max={48}
          suffix="px"
        />
      </ActionGroup>

      {/* Kerning & Leading */}
      <ActionGroup label="Typography" icon={LetterText} expanded={expanded.typography} onToggle={() => toggleExpand('typography')}>
        <div className="space-y-2">
          {/* Kerning */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-14">Kerning</span>
            <select
              value={section.letterSpacing || '0'}
              onChange={(e) => onUpdate({ letterSpacing: e.target.value })}
              className="flex-1 h-6 text-xs rounded border border-zinc-200 px-1"
            >
              <option value="-0.05em">Tight</option>
              <option value="-0.02em">Snug</option>
              <option value="0">Normal</option>
              <option value="0.02em">Wide</option>
              <option value="0.05em">Wider</option>
              <option value="0.1em">Widest</option>
            </select>
          </div>
          {/* Leading */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-14">Leading</span>
            <select
              value={section.lineHeight || '1.5'}
              onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
              className="flex-1 h-6 text-xs rounded border border-zinc-200 px-1"
            >
              <option value="1">Tight (1.0)</option>
              <option value="1.25">Snug (1.25)</option>
              <option value="1.5">Normal (1.5)</option>
              <option value="1.75">Relaxed (1.75)</option>
              <option value="2">Loose (2.0)</option>
            </select>
          </div>
        </div>
      </ActionGroup>

      {/* Background */}
      {renderBackgroundControls()}

      {/* Divider */}
      {renderDividerControls()}
    </>
  );

  const renderSectionHeaderControls = () => (
    <>
      {/* Title Text Editor */}
      <ActionGroup label="Title Text" icon={Type} expanded={expanded.titleText} onToggle={() => toggleExpand('titleText')}>
        <input
          type="text"
          value={section.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter section title..."
          className="w-full h-8 px-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent"
        />
      </ActionGroup>

      {/* Background */}
      {renderBackgroundControls()}

      <ActionGroup label="Size" icon={Type} expanded={expanded.size} onToggle={() => toggleExpand('size')}>
        <NumberStepper
          value={section.fontSize || 18}
          onChange={(v) => onUpdate({ fontSize: v })}
          min={12}
          max={36}
          suffix="px"
        />
      </ActionGroup>

      {/* Kerning */}
      <ActionGroup label="Kerning" icon={LetterText} expanded={expanded.kerning} onToggle={() => toggleExpand('kerning')}>
        <select
          value={section.letterSpacing || '0.1em'}
          onChange={(e) => onUpdate({ letterSpacing: e.target.value })}
          className="w-full h-7 text-xs rounded border border-zinc-200 px-2"
        >
          <option value="0">Normal</option>
          <option value="0.05em">Wide</option>
          <option value="0.1em">Wider</option>
          <option value="0.15em">Widest</option>
          <option value="0.2em">Ultra Wide</option>
        </select>
      </ActionGroup>

      {/* Vertical Alignment */}
      <ActionGroup label="Vertical Align" icon={AlignCenterVertical} expanded={expanded.verticalAlign} onToggle={() => toggleExpand('verticalAlign')}>
        <VerticalAlignControl 
          value={section.verticalAlign || 'center'} 
          onChange={(v) => onUpdate({ verticalAlign: v })} 
        />
      </ActionGroup>

      {/* Divider */}
      {renderDividerControls()}
    </>
  );

  const renderImageCollageControls = () => (
    <>
      {/* Layout Presets - Using original CollagePresetPicker */}
      <ActionGroup label="Layout" icon={Grid3X3} expanded={expanded.layout} onToggle={() => toggleExpand('layout')}>
        <CollagePresetPicker
          currentPreset={section.layout || 'single'}
          onSelectPreset={(presetId) => onUpdate({ layout: presetId })}
        />
      </ActionGroup>

      {/* Image Upload */}
      <ActionGroup label="Images" icon={Image} expanded={expanded.images} onToggle={() => toggleExpand('images')}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const promises = files.map(file => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.readAsDataURL(file);
              });
            });
            Promise.all(promises).then(images => {
              onUpdate({ images: [...(section.images || []), ...images] });
            });
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-7 text-xs w-full"
        >
          <Upload className="w-3 h-3" />
          Add Images ({section.images?.length || 0})
        </Button>
      </ActionGroup>

      {/* Gap & Height */}
      <ActionGroup label="Spacing" icon={Layers} expanded={expanded.spacing} onToggle={() => toggleExpand('spacing')}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-10">Gap</span>
            <NumberStepper
              value={section.gap || 8}
              onChange={(v) => onUpdate({ gap: v })}
              min={0}
              max={32}
              suffix="px"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-10">Height</span>
            <NumberStepper
              value={section.imageHeight || 200}
              onChange={(v) => onUpdate({ imageHeight: v })}
              min={100}
              max={600}
              step={25}
              suffix="px"
            />
          </div>
        </div>
      </ActionGroup>
    </>
  );

  const renderMarqueeControls = () => (
    <>
      <ActionGroup label="Colors" icon={Palette} expanded={expanded.colors} onToggle={() => toggleExpand('colors')}>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-400">Bg</span>
            <input
              type="color"
              value={section.backgroundColor || '#04D1FC'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-400">Text</span>
            <input
              type="color"
              value={section.textColor || '#FFFFFF'}
              onChange={(e) => handleColorChange('textColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer"
            />
          </div>
        </div>
      </ActionGroup>
      <ActionGroup label="Speed" icon={Type} expanded={expanded.speed} onToggle={() => toggleExpand('speed')}>
        <select
          value={section.speed || 30}
          onChange={(e) => onUpdate({ speed: parseInt(e.target.value) })}
          className="h-7 text-xs rounded border border-zinc-200 px-2 w-full"
        >
          <option value={15}>Fast</option>
          <option value={30}>Medium</option>
          <option value={60}>Slow</option>
        </select>
      </ActionGroup>
    </>
  );

  const renderFooterControls = () => (
    <>
      <ActionGroup label="Colors" icon={Palette} expanded={expanded.colors} onToggle={() => toggleExpand('colors')}>
        <div className="flex gap-1 flex-wrap">
          {QUICK_COLORS.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange('backgroundColor', color)}
              className={cn(
                "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                section.backgroundColor === color ? "border-zinc-900" : "border-zinc-200"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </ActionGroup>
      <ActionGroup label="Size" icon={Type} expanded={expanded.size} onToggle={() => toggleExpand('size')}>
        <NumberStepper
          value={section.fontSize || 14}
          onChange={(v) => onUpdate({ fontSize: v })}
          min={10}
          max={24}
          suffix="px"
        />
      </ActionGroup>
    </>
  );

  const renderProfileCardsControls = () => {
    // Get current profiles or create default ones
    const numColumns = section.columns || 4;
    const profiles = (section.profiles && section.profiles.length > 0) 
      ? section.profiles 
      : Array(numColumns).fill(null).map((_, i) => ({
          name: `Name ${i + 1}`,
          title: 'Position',
          image: null
        }));

    const updateProfile = (index, field, value) => {
      const newProfiles = [...profiles];
      if (!newProfiles[index]) {
        newProfiles[index] = { name: '', title: '', image: null };
      }
      newProfiles[index] = { ...newProfiles[index], [field]: value };
      onUpdate({ profiles: newProfiles });
    };

    return (
      <>
        <ActionGroup label="Columns" icon={Grid3X3} expanded={expanded.columns} onToggle={() => toggleExpand('columns')}>
          <div className="flex gap-1">
            {[2, 3, 4].map(cols => (
              <Button
                key={cols}
                variant={section.columns === cols ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onUpdate({ columns: cols })}
                className="h-7 w-7 p-0"
              >
                {cols}
              </Button>
            ))}
          </div>
        </ActionGroup>

        <ActionGroup label="Shape" icon={Image} expanded={expanded.shape} onToggle={() => toggleExpand('shape')}>
          <div className="flex gap-1">
            <Button
              variant={section.imageShape === 'circular' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ imageShape: 'circular' })}
              className="h-7 text-xs flex-1"
            >
              Circle
            </Button>
            <Button
              variant={section.imageShape === 'square' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ imageShape: 'square' })}
              className="h-7 text-xs flex-1"
            >
              Square
            </Button>
          </div>
        </ActionGroup>

        {/* Profile Editing */}
        <ActionGroup label="Profiles" icon={Type} expanded={expanded.profiles} onToggle={() => toggleExpand('profiles')}>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {profiles.slice(0, numColumns).map((profile, index) => (
              <div key={index} className="space-y-2 p-2 bg-zinc-50 rounded-lg">
                <p className="text-[9px] text-zinc-400 font-medium">Profile {index + 1}</p>
                
                {/* Profile Image */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-12 h-12 bg-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative",
                    section.imageShape === 'circular' ? "rounded-full" : "rounded-lg"
                  )}>
                    {profile?.image ? (
                      <img src={profile.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="block">
                      <span className="sr-only">Upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              updateProfile(index, 'image', ev.target?.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                      />
                    </label>
                    {profile?.image && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (!profile.image) return;
                            setIsProcessing(true);
                            try {
                              const base64Data = profile.image.split(',')[1];
                              if (!base64Data) throw new Error('Invalid image');
                              const byteCharacters = atob(base64Data);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], { type: 'image/png' });
                              const formData = new FormData();
                              formData.append('image_file', blob, 'image.png');
                              formData.append('size', 'auto');
                              const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                                method: 'POST',
                                headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
                                body: formData
                              });
                              if (!response.ok) throw new Error('API error');
                              const resultBlob = await response.blob();
                              const reader = new FileReader();
                              reader.onload = () => updateProfile(index, 'image', reader.result);
                              reader.readAsDataURL(resultBlob);
                            } catch (err) {
                              alert('Failed to remove background');
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          className="h-5 px-2 text-[10px] text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100"
                          title="Remove background"
                        >
                          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateProfile(index, 'image', null)}
                          className="h-5 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Name Input */}
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) => updateProfile(index, 'name', e.target.value)}
                  placeholder="Name..."
                  className="w-full h-7 px-2 text-xs rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#04D1FC] focus:border-transparent"
                />
                
                {/* Title Input */}
                <input
                  type="text"
                  value={profile?.title || ''}
                  onChange={(e) => updateProfile(index, 'title', e.target.value)}
                  placeholder="Title/Position..."
                  className="w-full h-7 px-2 text-xs rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#04D1FC] focus:border-transparent"
                />
                
                {/* Image Background Layer */}
                {profile?.image && (
                  <div className="pt-2 border-t border-zinc-200 mt-2">
                    <p className="text-[9px] text-zinc-400 font-medium mb-1">Image Background</p>
                    <div className="flex gap-1 mb-1">
                      <button
                        onClick={() => updateProfile(index, 'bgType', 'none')}
                        className={cn(
                          "flex-1 h-6 text-[9px] rounded border",
                          (!profile.bgType || profile.bgType === 'none') ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200"
                        )}
                      >
                        None
                      </button>
                      <button
                        onClick={() => updateProfile(index, 'bgType', 'solid')}
                        className={cn(
                          "flex-1 h-6 text-[9px] rounded border",
                          profile.bgType === 'solid' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200"
                        )}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => updateProfile(index, 'bgType', 'gradient')}
                        className={cn(
                          "flex-1 h-6 text-[9px] rounded border",
                          profile.bgType === 'gradient' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200"
                        )}
                      >
                        Gradient
                      </button>
                    </div>
                    {profile.bgType === 'solid' && (
                      <div className="flex gap-1 flex-wrap">
                        {QUICK_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => updateProfile(index, 'bgColor', color)}
                            className={cn(
                              "w-5 h-5 rounded border transition-transform hover:scale-110",
                              profile.bgColor === color ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={profile.bgColor || '#ffffff'}
                          onChange={(e) => updateProfile(index, 'bgColor', e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                      </div>
                    )}
                    {profile.bgType === 'gradient' && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={profile.bgGradientStart || '#04D1FC'}
                            onChange={(e) => updateProfile(index, 'bgGradientStart', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer"
                          />
                          <span className="text-[9px] text-zinc-400">→</span>
                          <input
                            type="color"
                            value={profile.bgGradientEnd || '#7C3AED'}
                            onChange={(e) => updateProfile(index, 'bgGradientEnd', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer"
                          />
                        </div>
                        <select
                          value={profile.bgGradientDirection || 'to bottom'}
                          onChange={(e) => updateProfile(index, 'bgGradientDirection', e.target.value)}
                          className="w-full h-6 text-[9px] rounded border border-zinc-200 px-1"
                        >
                          <option value="to bottom">↓ Top to Bottom</option>
                          <option value="to top">↑ Bottom to Top</option>
                          <option value="to right">→ Left to Right</option>
                          <option value="to left">← Right to Left</option>
                          <option value="to bottom right">↘ Diagonal</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ActionGroup>

        {/* Vertical Alignment */}
        <ActionGroup label="Vertical Align" icon={AlignCenterVertical} expanded={expanded.verticalAlign} onToggle={() => toggleExpand('verticalAlign')}>
          <VerticalAlignControl 
            value={section.verticalAlign || 'center'} 
            onChange={(v) => onUpdate({ verticalAlign: v })} 
          />
        </ActionGroup>

        {/* Background */}
        {renderBackgroundControls()}

        {/* Divider */}
        {renderDividerControls()}
      </>
    );
  };

  const renderRecipeControls = () => (
    <>
      {/* Recipe Image */}
      <ActionGroup label="Recipe Image" icon={Image} expanded={expanded.recipeImage} onToggle={() => toggleExpand('recipeImage')}>
        <div className="space-y-3">
          {section.image ? (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={section.image} 
                alt="Recipe" 
                className="w-full h-24 object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBackground('image')}
                  disabled={isProcessing}
                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                  title="Remove background"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdate({ image: null })}
                  className="h-6 w-6 p-0 bg-white/80 hover:bg-red-50 text-red-500"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs w-full"
              >
                <Upload className="w-3 h-3 mr-1.5" />
                Upload Recipe Image
              </Button>
            </>
          )}
          
          {/* Image Fill Mode */}
          {section.image && (
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <p className="text-[10px] text-zinc-400 font-medium">Fill Mode</p>
              <div className="flex gap-1">
                {[
                  { value: 'cover', label: 'Cover' },
                  { value: 'contain', label: 'Contain' },
                  { value: 'fill', label: 'Fill' }
                ].map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => onUpdate({ imageFit: mode.value })}
                    className={cn(
                      "flex-1 h-6 text-[9px] rounded border transition-colors",
                      section.imageFit === mode.value || (!section.imageFit && mode.value === 'cover')
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              
              {/* Image Height */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 w-12">Height</span>
                <NumberStepper
                  value={section.imageHeight || 200}
                  onChange={(v) => onUpdate({ imageHeight: v })}
                  min={100}
                  max={1000}
                  step={20}
                  suffix="px"
                />
              </div>
            </div>
          )}
        </div>
      </ActionGroup>

      {/* Recipe Title */}
      <ActionGroup label="Title" icon={Type} expanded={expanded.recipeTitle} onToggle={() => toggleExpand('recipeTitle')}>
        <input
          type="text"
          value={section.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Recipe Title..."
          className="w-full h-8 px-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent"
        />
      </ActionGroup>

      {/* Ingredients */}
      <ActionGroup label="Ingredients" icon={Type} expanded={expanded.ingredients} onToggle={() => toggleExpand('ingredients')}>
        <textarea
          value={section.ingredients || ''}
          onChange={(e) => onUpdate({ ingredients: e.target.value })}
          placeholder="Enter ingredients..."
          className="w-full h-24 p-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent resize-none"
        />
      </ActionGroup>

      {/* Instructions */}
      <ActionGroup label="Instructions" icon={Type} expanded={expanded.instructions} onToggle={() => toggleExpand('instructions')}>
        <textarea
          value={section.instructions || ''}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
          placeholder="Enter instructions..."
          className="w-full h-24 p-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent resize-none"
        />
      </ActionGroup>
      
      {/* Background */}
      {renderBackgroundControls()}

      {/* Divider */}
      {renderDividerControls()}
    </>
  );

  const renderDefaultControls = () => (
    <>
      {/* Background - available for all sections */}
      {renderBackgroundControls()}
    </>
  );

  if (!section) return null;

  return (
    <div 
      ref={barRef}
      className={cn(
        "fixed z-50 bg-white rounded-xl shadow-xl border border-zinc-200 w-[300px] flex flex-col",
        isDragging && "shadow-2xl ring-2 ring-[#04D1FC]/30 pointer-events-none"
      )}
      style={{ 
        ...(hasBeenDragged ? {
          left: barPosition.x,
          top: barPosition.y,
        } : {
          top: position.top,
          right: position.right,
        }),
        maxHeight: '700px',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Header - Draggable */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-zinc-50 border-b border-zinc-100 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-zinc-300" />
          <span className="text-xs font-medium text-zinc-700 capitalize">{section.type}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-600"
            title="Move up"
          >
            <MoveUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-600"
            title="Move down"
          >
            <MoveDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-600"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-2 space-y-1 flex-1 overflow-y-auto">
        {renderControls()}
      </div>
    </div>
  );
}

// Reusable Action Group Component
function ActionGroup({ label, icon: Icon, children, expanded = false, onToggle }) {
  const handleToggle = () => {
    onToggle?.();
  };

  return (
    <div className="rounded-lg border border-zinc-100 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3 text-zinc-400" />}
          {label}
        </div>
        <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="px-2 pb-2 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

// Vertical Alignment Control Component
function VerticalAlignControl({ value, onChange }) {
  const alignOptions = [
    { value: 'top', icon: AlignVerticalJustifyStart, label: 'Top' },
    { value: 'center', icon: AlignVerticalJustifyCenter, label: 'Center' },
    { value: 'bottom', icon: AlignVerticalJustifyEnd, label: 'Bottom' }
  ];

  return (
    <div className="flex gap-0.5">
      {alignOptions.map(({ value: alignValue, icon: Icon, label }) => (
        <Button
          key={alignValue}
          variant={value === alignValue ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(alignValue)}
          className="h-7 w-7 p-0"
          title={label}
        >
          <Icon className="w-3.5 h-3.5" />
        </Button>
      ))}
    </div>
  );
}

// Number Stepper Component
function NumberStepper({ value, onChange, min = 0, max = 100, step = 1, suffix = '' }) {
  return (
    <div className="flex items-center gap-1 bg-zinc-50 rounded-lg p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(Math.max(min, value - step))}
        className="h-6 w-6 p-0"
      >
        <Minus className="w-3 h-3" />
      </Button>
      <span className="text-xs font-mono w-12 text-center">
        {value}{suffix}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(Math.min(max, value + step))}
        className="h-6 w-6 p-0"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}

export default SectionActionBar;
