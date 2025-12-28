import React, { useState, useCallback, useRef } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  MousePointerClick,
  Loader2,
  Palette,
  Image,
  Settings,
  Lock,
  Unlock,
  Layers,
  FileImage
} from 'lucide-react';
import { Button } from './ui/Button';
import { Select } from './ui/Input';
import { EditableInput, EditableTextarea, EditableColorInput } from './ui/EditableField';
import { NumberInput } from './ui/NumberInput';
import { Label } from './ui/Label';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import GradientPicker from './GradientPicker';
import ImageUploader from './ImageUploader';
import ThemePanel from './ThemePanel';
import MediaKitPanel from './MediaKitPanel';
import CollagePresetPicker from './CollagePresetPicker';
import FocalPointPicker from './FocalPointPicker';
import BulkImageUploader from './BulkImageUploader';
import { getPresetById, getImageCountForPreset } from '../lib/collagePresets';
import { exportToGif, downloadDataUrl } from '../utils/gifExport';
import { exportSequenceAsGif, downloadBlob } from '../utils/sequenceGifExport';
import { IconPickerButton } from './IconPicker';

const REMOVE_BG_API_KEY = 'rDrPT41QWFrheRJc4MARam3m';

// Uncontrolled color picker component - uses refs to avoid focus issues
function ImageColorPicker({ value, onChange, placeholder = 'Enter color', allowClear = false }) {
  const textRef = useRef(null);
  const lastValueRef = useRef(value);

  // Initialize and sync only when value changes from parent (not during typing)
  React.useEffect(() => {
    if (textRef.current && document.activeElement !== textRef.current) {
      textRef.current.value = value || '';
      lastValueRef.current = value;
    }
  }, [value]);

  const handleColorChange = (e) => {
    const newValue = e.target.value;
    if (textRef.current) {
      textRef.current.value = newValue;
    }
    lastValueRef.current = newValue;
    onChange?.(newValue);
  };

  const handleTextBlur = () => {
    if (textRef.current) {
      lastValueRef.current = textRef.current.value;
      onChange?.(textRef.current.value);
    }
  };

  const handleClear = () => {
    if (textRef.current) {
      textRef.current.value = '';
    }
    lastValueRef.current = '';
    onChange?.('');
  };

  const safeColorValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#04D1FC';

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={safeColorValue}
        onChange={handleColorChange}
        className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
      />
      <input
        ref={textRef}
        type="text"
        defaultValue={value || ''}
        onBlur={handleTextBlur}
        placeholder={placeholder}
        className="flex-1 h-8 px-2 text-xs rounded border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC]"
      />
      {allowClear && (
        <button
          onClick={handleClear}
          type="button"
          className="h-8 px-2 text-[10px] text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function SidebarEditor({ 
  newsletter, 
  selectedSection, 
  onSectionUpdate, 
  onDeleteSection, 
  onMoveSection,
  isUnlocked,
  onToggleUnlock,
  marqueeRef 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [gifProgress, setGifProgress] = useState(0);
  
  const section = selectedSection 
    ? newsletter?.sections.find(s => s.id === selectedSection)
    : null;

  const handleExportMarqueeGif = useCallback(async () => {
    // Find the marquee element in the DOM
    const marqueeElement = document.querySelector('.marquee-section');
    if (!marqueeElement) {
      alert('Marquee section not found. Make sure it\'s visible in the preview.');
      return;
    }

    setIsExportingGif(true);
    setGifProgress(0);

    try {
      const gifDataUrl = await exportToGif(marqueeElement, {
        duration: (section?.speed || 30) * 1000, // Use the marquee speed
        frameRate: 10,
        quality: 0.9,
        onProgress: (progress) => setGifProgress(progress)
      });

      downloadDataUrl(gifDataUrl, `marquee-${Date.now()}.gif`);
    } catch (error) {
      console.error('GIF export failed:', error);
      alert('Failed to export GIF. Please try again.');
    } finally {
      setIsExportingGif(false);
      setGifProgress(0);
    }
  }, [section?.speed]);

  const handleFieldChange = useCallback((field, value) => {
    onSectionUpdate(selectedSection, { [field]: value });
  }, [selectedSection, onSectionUpdate]);

  const handleColorSelect = useCallback((color) => {
    if (section) {
      if (section.type === 'header' || section.type === 'footer' || section.type === 'sectionHeader') {
        handleFieldChange('backgroundColor', color);
      } else if (section.type === 'text') {
        handleFieldChange('color', color);
      }
    }
  }, [section, handleFieldChange]);

  const handleGradientSelect = useCallback((start, end) => {
    if (section && (section.type === 'header' || section.type === 'footer')) {
      handleFieldChange('backgroundColor', start);
      handleFieldChange('gradientEnd', end);
    }
  }, [section, handleFieldChange]);

  const handleLogoSelect = useCallback((logoDataUri) => {
    if (section && section.type === 'header') {
      handleFieldChange('logo', logoDataUri);
    }
  }, [section, handleFieldChange]);

  const handleImageUpload = useCallback(async (file, field) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      handleFieldChange(field, e.target.result);
    };
    reader.readAsDataURL(file);
  }, [handleFieldChange]);

  const handleRemoveBackground = useCallback(async (imageField) => {
    const imageData = section?.[imageField];
    if (!imageData) {
      alert('No image to process');
      return;
    }

    setIsProcessing(true);
    try {
      // Extract base64 data
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data');
      }
      
      // Convert base64 to blob
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
      reader.onload = (e) => handleFieldChange(imageField, e.target.result);
      reader.readAsDataURL(resultBlob);
    } catch (error) {
      console.error('Remove background error:', error);
      alert(`Failed to remove background: ${error.message}\n\nTip: You can use remove.bg website directly and upload the result.`);
    } finally {
      setIsProcessing(false);
    }
  }, [section, handleFieldChange]);

  const handleArrayImageUpload = useCallback(async (file, arrayField, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const currentArray = section?.[arrayField] || [];
      const newArray = [...currentArray];
      newArray[index] = e.target.result;
      handleFieldChange(arrayField, newArray);
    };
    reader.readAsDataURL(file);
  }, [section, handleFieldChange]);

  const handleFocalPointChange = useCallback((index, focalPoint) => {
    const currentFocalPoints = section?.focalPoints || [];
    const newFocalPoints = [...currentFocalPoints];
    newFocalPoints[index] = focalPoint;
    handleFieldChange('focalPoints', newFocalPoints);
  }, [section, handleFieldChange]);

  const handleImageBackgroundChange = useCallback((index, color) => {
    const currentBackgrounds = section?.imageBackgrounds || [];
    const newBackgrounds = [...currentBackgrounds];
    newBackgrounds[index] = color;
    handleFieldChange('imageBackgrounds', newBackgrounds);
  }, [section, handleFieldChange]);

  const handleImageOverlayChange = useCallback((index, overlay) => {
    const currentOverlays = section?.imageOverlays || [];
    const newOverlays = [...currentOverlays];
    newOverlays[index] = overlay;
    handleFieldChange('imageOverlays', newOverlays);
  }, [section, handleFieldChange]);

  const handleBulkProfileImages = useCallback((images) => {
    const profiles = section?.profiles || [];
    const newProfiles = images.map((image, index) => ({
      ...profiles[index],
      image,
      name: profiles[index]?.name || '',
      title: profiles[index]?.title || ''
    }));
    handleFieldChange('profiles', newProfiles);
  }, [section, handleFieldChange]);

  const handleProfileFieldChange = useCallback((index, field, value) => {
    const profiles = section?.profiles || [];
    const newProfiles = [...profiles];
    newProfiles[index] = { ...newProfiles[index], [field]: value };
    handleFieldChange('profiles', newProfiles);
  }, [section, handleFieldChange]);

  const FieldGroup = ({ label, children, className }) => (
    <div className={cn("space-y-2", className)}>
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</Label>
      {children}
    </div>
  );

  // Container settings handler
  const handleContainerChange = useCallback((field, value) => {
    const currentContainer = section?.container || {};
    onSectionUpdate(selectedSection, { 
      container: { ...currentContainer, [field]: value } 
    });
  }, [selectedSection, onSectionUpdate, section?.container]);

  // Container Settings Component
  const renderContainerSettings = () => {
    const container = section?.container || {};
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    return (
      <div className="mb-6 p-3 bg-gradient-to-br from-zinc-50 to-zinc-100/50 rounded-xl border border-zinc-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-zinc-600 hover:text-zinc-900"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Container Frame</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
        </button>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Outer Container (Padding/Margin) */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-zinc-400"></span>
                Outer Frame (Padding)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400">Top</span>
                  <NumberInput
                    value={container.outerPaddingTop ?? container.outerPadding ?? 0}
                    onChange={(val) => handleContainerChange('outerPaddingTop', val)}
                    step={4}
                    suffix=""
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400">Bottom</span>
                  <NumberInput
                    value={container.outerPaddingBottom ?? container.outerPadding ?? 0}
                    onChange={(val) => handleContainerChange('outerPaddingBottom', val)}
                    step={4}
                    suffix=""
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400">Left</span>
                  <NumberInput
                    value={container.outerPaddingLeft ?? container.outerPadding ?? 0}
                    onChange={(val) => handleContainerChange('outerPaddingLeft', val)}
                    step={4}
                    suffix=""
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400">Right</span>
                  <NumberInput
                    value={container.outerPaddingRight ?? container.outerPadding ?? 0}
                    onChange={(val) => handleContainerChange('outerPaddingRight', val)}
                    step={4}
                    suffix=""
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-400">Outer Background</span>
                <ImageColorPicker
                  value={container.outerBackgroundColor || ''}
                  onChange={(val) => handleContainerChange('outerBackgroundColor', val)}
                  placeholder="#FDFBF8"
                  allowClear
                />
              </div>
            </div>
            
            {/* Inner Container (Border/Radius/Background) */}
            <div className="space-y-2 pt-3 border-t border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm border-2 border-zinc-400"></span>
                Inner Frame (Stroke & Radius)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400">Border Width</span>
                  <NumberInput
                    value={container.innerBorderWidth ?? 0}
                    onChange={(val) => handleContainerChange('innerBorderWidth', val)}
                    step={1}
                    suffix="px"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400">Border Radius</span>
                  <NumberInput
                    value={container.innerBorderRadius ?? 0}
                    onChange={(val) => handleContainerChange('innerBorderRadius', val)}
                    step={4}
                    suffix="px"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-400">Border Color</span>
                <ImageColorPicker
                  value={container.innerBorderColor || '#E5E5E5'}
                  onChange={(val) => handleContainerChange('innerBorderColor', val)}
                  placeholder="#E5E5E5"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-400">Inner Background</span>
                <ImageColorPicker
                  value={container.innerBackgroundColor || ''}
                  onChange={(val) => handleContainerChange('innerBackgroundColor', val)}
                  placeholder="transparent"
                  allowClear
                />
              </div>
            </div>
            
            {/* Background Image */}
            <div className="space-y-2 pt-3 border-t border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <Image className="w-3 h-3" />
                Background Image
              </span>
              <ImageUploader
                currentImage={container.backgroundImage}
                onImageUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => handleContainerChange('backgroundImage', e.target.result);
                  reader.readAsDataURL(file);
                }}
                onRemoveBackground={() => {}}
                isProcessing={false}
                compact
              />
              {container.backgroundImage && (
                <>
                  <button
                    onClick={() => handleContainerChange('backgroundImage', null)}
                    className="w-full h-7 text-[10px] text-zinc-500 hover:text-red-500 border border-zinc-200 rounded transition-colors"
                  >
                    Remove Background Image
                  </button>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400">Position</span>
                    <Select
                      value={container.backgroundPosition || 'center'}
                      onChange={(e) => handleContainerChange('backgroundPosition', e.target.value)}
                      className="h-8 text-xs"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400">Repeat</span>
                    <Select
                      value={container.backgroundRepeat || 'no-repeat'}
                      onChange={(e) => handleContainerChange('backgroundRepeat', e.target.value)}
                      className="h-8 text-xs"
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat X</option>
                      <option value="repeat-y">Repeat Y</option>
                    </Select>
                  </div>
                </>
              )}
              <p className="text-[9px] text-zinc-400">
                Background fills 100% width, auto height
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHeaderEditor = () => (
    <div className="space-y-6">
      {renderContainerSettings()}
      
      {/* Logo Section */}
      <FieldGroup label="Logo">
        <ImageUploader
          currentImage={section.logo}
          onImageUpload={(file) => handleImageUpload(file, 'logo')}
          onRemoveBackground={() => handleRemoveBackground('logo')}
          isProcessing={isProcessing}
        />
        {section.logo && (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Width</span>
                <NumberInput
                  value={section.logoWidth || 120}
                  onChange={(val) => handleFieldChange('logoWidth', val)}
                  
                  
                  step={10}
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Height</span>
                <Select
                  value={section.logoHeight || 'auto'}
                  onChange={(e) => handleFieldChange('logoHeight', e.target.value)}
                  className="h-10"
                >
                  <option value="auto">Auto</option>
                  <option value="40">40px</option>
                  <option value="60">60px</option>
                  <option value="80">80px</option>
                  <option value="100">100px</option>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Align</span>
                <Select
                  value={section.logoAlignment || 'center'}
                  onChange={(e) => handleFieldChange('logoAlignment', e.target.value)}
                  className="h-10"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </Select>
              </div>
            </div>
          </div>
        )}
      </FieldGroup>

      {/* Hero Image Section */}
      <FieldGroup label="Hero Image">
        <ImageUploader
          currentImage={section.heroImage}
          onImageUpload={(file) => handleImageUpload(file, 'heroImage')}
          onRemoveBackground={() => handleRemoveBackground('heroImage')}
          isProcessing={isProcessing}
        />
        {section.heroImage && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400">Height</span>
              <NumberInput
                value={section.heroImageHeight || 200}
                onChange={(val) => handleFieldChange('heroImageHeight', val)}
                
                
                step={10}
                suffix="px"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400">Fit</span>
              <Select
                value={section.heroImageFit || 'cover'}
                onChange={(e) => handleFieldChange('heroImageFit', e.target.value)}
                className="h-10"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </Select>
            </div>
          </div>
        )}
      </FieldGroup>

      {/* Title Section */}
      <FieldGroup label="Title">
        <input
          type="text"
          key={`title-${selectedSection}`}
          defaultValue={section.title || ''}
          onBlur={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Newsletter title"
          className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent"
        />

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Size</span>
            <NumberInput
              value={section.titleFontSize || 28}
              onChange={(val) => handleFieldChange('titleFontSize', val)}
              
              
              step={2}
              suffix="px"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Weight</span>
            <Select
              value={section.titleFontWeight || '700'}
              onChange={(e) => handleFieldChange('titleFontWeight', e.target.value)}
              className="h-10"
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Style</span>
            <Select
              value={section.titleFontStyle || 'normal'}
              onChange={(e) => handleFieldChange('titleFontStyle', e.target.value)}
              className="h-10"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Kerning</span>
            <Select
              value={section.titleLetterSpacing || '-0.02em'}
              onChange={(e) => handleFieldChange('titleLetterSpacing', e.target.value)}
              className="h-10"
            >
              <option value="-0.05em">Tight (-0.05)</option>
              <option value="-0.02em">Snug (-0.02)</option>
              <option value="0">Normal (0)</option>
              <option value="0.02em">Wide (0.02)</option>
              <option value="0.05em">Wider (0.05)</option>
              <option value="0.1em">Widest (0.1)</option>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Leading</span>
            <Select
              value={section.titleLineHeight || '1.2'}
              onChange={(e) => handleFieldChange('titleLineHeight', parseFloat(e.target.value))}
              className="h-10"
            >
              <option value="1">Tight (1.0)</option>
              <option value="1.1">Snug (1.1)</option>
              <option value="1.2">Normal (1.2)</option>
              <option value="1.4">Relaxed (1.4)</option>
              <option value="1.6">Loose (1.6)</option>
            </Select>
          </div>
        </div>
      </FieldGroup>

      {/* Subtitle Section */}
      <FieldGroup label="Subtitle">
        <EditableInput
          value={section.subtitle || ''}
          onChange={(val) => handleFieldChange('subtitle', val)}
          sectionKey={selectedSection}
          placeholder="Newsletter subtitle"
        />
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Size</span>
            <NumberInput
              value={section.subtitleFontSize || 16}
              onChange={(val) => handleFieldChange('subtitleFontSize', val)}
              
              
              suffix="px"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Weight</span>
            <Select
              value={section.subtitleFontWeight || '400'}
              onChange={(e) => handleFieldChange('subtitleFontWeight', e.target.value)}
              className="h-10"
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semi</option>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Kerning</span>
            <Select
              value={section.subtitleLetterSpacing || '0'}
              onChange={(e) => handleFieldChange('subtitleLetterSpacing', e.target.value)}
              className="h-10"
            >
              <option value="-0.02em">Tight</option>
              <option value="0">Normal</option>
              <option value="0.05em">Wide</option>
            </Select>
          </div>
        </div>
      </FieldGroup>

      {/* Date Badge */}
      <FieldGroup label="Date Badge">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={section.showDateBadge || false}
              onChange={(e) => handleFieldChange('showDateBadge', e.target.checked)}
              className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
            />
            Show date badge
          </label>
        </div>
        {section.showDateBadge && (
          <div className="space-y-3 p-3 bg-zinc-50 rounded-xl">
            <EditableInput
              value={section.dateBadgeText || 'JULY 2025'}
              onChange={(val) => handleFieldChange('dateBadgeText', val)}
              sectionKey={selectedSection}
              placeholder="MONTH YEAR"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Background</span>
                <input
                  type="color"
                  value={section.dateBadgeBg || '#04D1FC'}
                  onChange={(e) => handleFieldChange('dateBadgeBg', e.target.value)}
                  className="w-full h-8 rounded border border-zinc-200 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Text</span>
                <input
                  type="color"
                  value={section.dateBadgeColor || '#FFFFFF'}
                  onChange={(e) => handleFieldChange('dateBadgeColor', e.target.value)}
                  className="w-full h-8 rounded border border-zinc-200 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </FieldGroup>

      {/* Colors */}
      <FieldGroup label="Colors">
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Text Color</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={section.textColor || '#FFFFFF'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="w-10 h-10 rounded border border-zinc-200 cursor-pointer"
              />
              <EditableInput
                value={section.textColor || '#FFFFFF'}
                onChange={(val) => handleFieldChange('textColor', val)}
                sectionKey={selectedSection}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
          <GradientPicker
            startColor={section.backgroundColor}
            endColor={section.gradientEnd}
            onStartColorChange={(color) => handleFieldChange('backgroundColor', color)}
            onEndColorChange={(color) => handleFieldChange('gradientEnd', color)}
            sectionKey={selectedSection}
          />
        </div>
      </FieldGroup>

      {/* Spacing & Padding */}
      <FieldGroup label="Spacing & Padding">
        <div className="space-y-4">
          {/* Container Padding */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 font-medium">Container Padding</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Top</span>
                <NumberInput
                  value={section.paddingTop ?? 48}
                  onChange={(val) => handleFieldChange('paddingTop', val)}
                  
                  
                  step={4}
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Bottom</span>
                <NumberInput
                  value={section.paddingBottom ?? 48}
                  onChange={(val) => handleFieldChange('paddingBottom', val)}
                  
                  
                  step={4}
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Sides</span>
                <NumberInput
                  value={section.paddingHorizontal ?? 24}
                  onChange={(val) => handleFieldChange('paddingHorizontal', val)}
                  
                  
                  step={4}
                  suffix="px"
                />
              </div>
            </div>
          </div>

          {/* Element Spacing */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 font-medium">Element Spacing</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Logo→Hero</span>
                <NumberInput
                  value={section.spacingLogoToHero ?? 20}
                  onChange={(val) => handleFieldChange('spacingLogoToHero', val)}
                  
                  
                  step={4}
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Hero→Title</span>
                <NumberInput
                  value={section.spacingHeroToTitle ?? 24}
                  onChange={(val) => handleFieldChange('spacingHeroToTitle', val)}
                  
                  
                  step={4}
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Title→Sub</span>
                <NumberInput
                  value={section.spacingTitleToSubtitle ?? 8}
                  onChange={(val) => handleFieldChange('spacingTitleToSubtitle', val)}
                  
                  
                  step={2}
                  suffix="px"
                />
              </div>
            </div>
          </div>

          {/* Hero placeholder toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer pt-2 border-t border-zinc-100">
            <input
              type="checkbox"
              checked={section.showHeroPlaceholder !== false}
              onChange={(e) => handleFieldChange('showHeroPlaceholder', e.target.checked)}
              className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
            />
            Show hero placeholder when empty
          </label>
        </div>
      </FieldGroup>
    </div>
  );

  const renderTextEditor = () => (
    <div className="space-y-6">
      {renderContainerSettings()}
      
      <FieldGroup label="Content">
        <EditableTextarea
          value={section.content || ''}
          onChange={(val) => handleFieldChange('content', val)}
          sectionKey={selectedSection}
          rows={6}
          placeholder="Enter your text..."
          className="resize-none"
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Font">
          <Select
            value={section.fontFamily || 'Poppins'}
            onChange={(e) => handleFieldChange('fontFamily', e.target.value)}
          >
            <option value="Poppins">Poppins</option>
            <option value="Noto Sans Hebrew">Noto Sans Hebrew</option>
            <option value="Inter">Inter</option>
          </Select>
        </FieldGroup>

        <FieldGroup label="Size">
          <NumberInput
            value={section.fontSize || 16}
            onChange={(val) => handleFieldChange('fontSize', val)}
            
            
            suffix="px"
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Text Color">
          <EditableColorInput
            value={section.color || '#120F0F'}
            onChange={(val) => handleFieldChange('color', val)}
            sectionKey={selectedSection}
          />
        </FieldGroup>

        <FieldGroup label="Background">
          <EditableColorInput
            value={section.backgroundColor || '#FFFFFF'}
            onChange={(val) => handleFieldChange('backgroundColor', val)}
            sectionKey={selectedSection}
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Direction">
          <Select
            value={section.direction || 'ltr'}
            onChange={(e) => handleFieldChange('direction', e.target.value)}
          >
            <option value="ltr">LTR</option>
            <option value="rtl">RTL</option>
          </Select>
        </FieldGroup>

        <FieldGroup label="Align">
          <Select
            value={section.textAlign || 'center'}
            onChange={(e) => handleFieldChange('textAlign', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
        </FieldGroup>
      </div>
    </div>
  );

  const renderSectionHeaderEditor = () => (
    <div className="space-y-6">
      {renderContainerSettings()}
      
      <FieldGroup label="Text">
        <EditableInput
          value={section.text || ''}
          onChange={(val) => handleFieldChange('text', val)}
          sectionKey={selectedSection}
          placeholder="Section title"
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Background">
          <input
            type="color"
            value={section.backgroundColor || '#04D1FC'}
            onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
          />
        </FieldGroup>

        <FieldGroup label="Text Color">
          <input
            type="color"
            value={section.color || '#FFFFFF'}
            onChange={(e) => handleFieldChange('color', e.target.value)}
            className="w-full h-10 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Font Size">
        <NumberInput
          value={section.fontSize || 18}
          onChange={(val) => handleFieldChange('fontSize', val)}
          
          
          suffix="px"
        />
      </FieldGroup>
    </div>
  );

  const renderImageCollageEditor = () => {
    const currentPreset = section.layout || 'featured-left';
    const preset = getPresetById(currentPreset);
    const imageCount = preset ? getImageCountForPreset(preset) : 4;
    const selectedImage = selectedImageIndex !== null ? section.images?.[selectedImageIndex] : null;
    const selectedFocalPoint = selectedImageIndex !== null 
      ? section.focalPoints?.[selectedImageIndex] || { x: 50, y: 50 }
      : null;
    const selectedBackground = selectedImageIndex !== null 
      ? section.imageBackgrounds?.[selectedImageIndex] || ''
      : '';
    const selectedOverlay = selectedImageIndex !== null 
      ? section.imageOverlays?.[selectedImageIndex] || { color: '', opacity: 0 }
      : { color: '', opacity: 0 };
    
    return (
      <div className="space-y-6">
        {renderContainerSettings()}
        
        <FieldGroup label="Layout Preset">
          <CollagePresetPicker
            currentPreset={currentPreset}
            onSelectPreset={(presetId) => handleFieldChange('layout', presetId)}
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Gap">
            <NumberInput
              value={section.gap || 8}
              onChange={(val) => handleFieldChange('gap', val)}
              
              
              suffix="px"
            />
          </FieldGroup>

          <FieldGroup label="Height">
            <NumberInput
              value={section.imageHeight || 200}
              onChange={(val) => handleFieldChange('imageHeight', val)}
              
              
              step={10}
              suffix="px"
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Bulk Import">
          <BulkImageUploader
            maxImages={imageCount}
            currentImages={section.images || []}
            onImagesChange={(images) => handleFieldChange('images', images)}
          />
        </FieldGroup>

        <FieldGroup label={`Individual Images (${imageCount})`}>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: imageCount }).map((_, index) => {
              const hasBackground = section.imageBackgrounds?.[index];
              const hasOverlay = section.imageOverlays?.[index]?.opacity > 0;
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                    selectedImageIndex === index 
                      ? "border-[#04D1FC] ring-2 ring-[#04D1FC]/20" 
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                  onClick={() => setSelectedImageIndex(selectedImageIndex === index ? null : index)}
                >
                  <ImageUploader
                    currentImage={section.images?.[index]}
                    onImageUpload={(file) => {
                      handleArrayImageUpload(file, 'images', index);
                      setSelectedImageIndex(index);
                    }}
                    onRemoveBackground={() => {}}
                    isProcessing={isProcessing}
                    compact={true}
                  />
                  <span className="absolute top-1 left-1 w-5 h-5 rounded bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  {/* Indicators for background/overlay */}
                  <div className="absolute bottom-1 right-1 flex gap-0.5">
                    {hasBackground && (
                      <span 
                        className="w-3 h-3 rounded-full border border-white shadow"
                        style={{ backgroundColor: section.imageBackgrounds[index] }}
                        title="Has background"
                      />
                    )}
                    {hasOverlay && (
                      <span 
                        className="w-3 h-3 rounded-full border border-white shadow opacity-70"
                        style={{ backgroundColor: section.imageOverlays[index]?.color }}
                        title="Has overlay"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </FieldGroup>

        {/* Selected Image Settings */}
        {selectedImageIndex !== null && selectedImage && (
          <>
            <FieldGroup label={`Image ${selectedImageIndex + 1} Settings`}>
              <div className="space-y-4 p-3 bg-zinc-50 rounded-xl">
                {/* Focal Point */}
                <div>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block mb-2">Focal Point</span>
                  <FocalPointPicker
                    image={selectedImage}
                    focalPoint={selectedFocalPoint}
                    onChange={(fp) => handleFocalPointChange(selectedImageIndex, fp)}
                  />
                </div>

                {/* Background Color (for cutouts) */}
                <div>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block mb-2">
                    Background (for cutouts)
                  </span>
                  <ImageColorPicker
                    value={selectedBackground}
                    onChange={(color) => handleImageBackgroundChange(selectedImageIndex, color)}
                    placeholder="No background"
                    allowClear
                  />
                  <p className="text-[9px] text-zinc-400 mt-1">
                    Set a solid color behind transparent images
                  </p>
                </div>

                {/* Overlay Color */}
                <div>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block mb-2">
                    Color Overlay
                  </span>
                  <ImageColorPicker
                    value={selectedOverlay.color}
                    onChange={(color) => handleImageOverlayChange(selectedImageIndex, { 
                      ...selectedOverlay, 
                      color: color,
                      opacity: selectedOverlay.opacity || 30
                    })}
                    placeholder="No overlay"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-12">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedOverlay.opacity || 0}
                      onChange={(e) => handleImageOverlayChange(selectedImageIndex, { 
                        ...selectedOverlay, 
                        opacity: parseInt(e.target.value) 
                      })}
                      className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-zinc-600 w-8">{selectedOverlay.opacity || 0}%</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1">
                    Add a color tint for text readability
                  </p>
                  {selectedOverlay.color && selectedOverlay.opacity > 0 && (
                    <button
                      onClick={() => handleImageOverlayChange(selectedImageIndex, { color: '', opacity: 0 })}
                      className="mt-2 h-7 px-2 text-[10px] text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded w-full"
                    >
                      Remove Overlay
                    </button>
                  )}
                </div>
              </div>
            </FieldGroup>
          </>
        )}
      </div>
    );
  };

  const renderImageSequenceEditor = () => {
    const sequenceImages = section.images || [];

    const handleSequenceImageUpload = async (files) => {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      const newImages = await Promise.all(
        imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        })
      );

      handleFieldChange('images', [...sequenceImages, ...newImages]);
    };

    const removeSequenceImage = (index) => {
      const newImages = sequenceImages.filter((_, i) => i !== index);
      handleFieldChange('images', newImages);
    };

    const clearAllImages = () => {
      handleFieldChange('images', []);
    };

    return (
      <div className="space-y-6">
        {renderContainerSettings()}
        
        <FieldGroup label="Upload Images">
          <div 
            className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-[#04D1FC] transition-colors cursor-pointer"
            onClick={() => document.getElementById('sequence-upload')?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleSequenceImageUpload(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="text-3xl mb-2 opacity-30">📁</div>
            <p className="text-sm text-zinc-600 mb-1">Drop images or click to upload</p>
            <p className="text-xs text-zinc-400">{sequenceImages.length} images added</p>
            <input
              id="sequence-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSequenceImageUpload(e.target.files)}
            />
          </div>
        </FieldGroup>

        {sequenceImages.length > 0 && (
          <>
            <FieldGroup label={`Frames (${sequenceImages.length})`}>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {sequenceImages.map((img, index) => (
                  <div key={index} className="relative group aspect-square rounded overflow-hidden border border-zinc-200">
                    <img src={img} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeSequenceImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllImages}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    if (sequenceImages.length < 2) {
                      alert('Add at least 2 images to create a GIF');
                      return;
                    }
                    
                    setIsExportingGif(true);
                    setGifProgress(0);
                    
                    try {
                      const blob = await exportSequenceAsGif(sequenceImages, {
                        width: 600,
                        height: section.previewHeight || 300,
                        delay: section.frameDuration || 500,
                        backgroundColor: section.backgroundColor || '#FFFFFF',
                        onProgress: setGifProgress
                      });
                      
                      downloadBlob(blob, `sequence-${Date.now()}.gif`);
                    } catch (error) {
                      console.error('GIF export failed:', error);
                      alert('GIF export failed: ' + error.message);
                    } finally {
                      setIsExportingGif(false);
                      setGifProgress(0);
                    }
                  }}
                  disabled={isExportingGif || sequenceImages.length < 2}
                  className="flex-1 bg-[#04D1FC] hover:bg-[#04D1FC]/90"
                >
                  {isExportingGif ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {gifProgress}%
                    </>
                  ) : (
                    <>
                      <FileImage className="w-3.5 h-3.5" />
                      Export GIF
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Frame Duration">
                <Select
                  value={section.frameDuration || 500}
                  onChange={(e) => handleFieldChange('frameDuration', parseInt(e.target.value))}
                  className="h-10"
                >
                  <option value={200}>200ms (Fast)</option>
                  <option value={300}>300ms</option>
                  <option value={500}>500ms</option>
                  <option value={750}>750ms</option>
                  <option value={1000}>1s</option>
                  <option value={1500}>1.5s</option>
                  <option value={2000}>2s (Slow)</option>
                </Select>
              </FieldGroup>

              <FieldGroup label="Preview Height">
                <NumberInput
                  value={section.previewHeight || 300}
                  onChange={(val) => handleFieldChange('previewHeight', val)}
                  
                  
                  step={25}
                  suffix="px"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Display Options">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.autoPlay !== false}
                    onChange={(e) => handleFieldChange('autoPlay', e.target.checked)}
                    className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
                  />
                  Auto-play animation
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.showControls || false}
                    onChange={(e) => handleFieldChange('showControls', e.target.checked)}
                    className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
                  />
                  Show play/pause controls
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.showThumbnails || false}
                    onChange={(e) => handleFieldChange('showThumbnails', e.target.checked)}
                    className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
                  />
                  Show thumbnails strip
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.showFrameCounter || false}
                    onChange={(e) => handleFieldChange('showFrameCounter', e.target.checked)}
                    className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
                  />
                  Show frame counter
                </label>
              </div>
            </FieldGroup>

            <FieldGroup label="Background Color">
              <input
                type="color"
                value={section.backgroundColor || '#FFFFFF'}
                onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 cursor-pointer"
              />
            </FieldGroup>

          </>
        )}

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-[10px] text-amber-700">
            <strong>📧 Email Note:</strong> Most email clients support GIFs. Export your sequence as a GIF for better compatibility.
          </p>
        </div>
      </div>
    );
  };

  const renderProfileCardsEditor = () => {
    const profileCount = section.columns || 4;
    const currentProfileImages = (section.profiles || []).map(p => p?.image).filter(Boolean);
    
    return (
      <div className="space-y-6">
        {renderContainerSettings()}
        
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Columns">
            <Select
              value={section.columns || 4}
              onChange={(e) => handleFieldChange('columns', parseInt(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </Select>
          </FieldGroup>

          <FieldGroup label="Shape">
            <Select
              value={section.imageShape || 'circular'}
              onChange={(e) => handleFieldChange('imageShape', e.target.value)}
            >
              <option value="circular">Circle</option>
              <option value="square">Square</option>
            </Select>
          </FieldGroup>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={section.showName !== false}
              onChange={(e) => handleFieldChange('showName', e.target.checked)}
              className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
            />
            Name
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={section.showTitle !== false}
              onChange={(e) => handleFieldChange('showTitle', e.target.checked)}
              className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
            />
            Title
          </label>
        </div>

        <FieldGroup label="Bulk Import Photos">
          <BulkImageUploader
            maxImages={profileCount}
            currentImages={currentProfileImages}
            onImagesChange={handleBulkProfileImages}
          />
        </FieldGroup>

        <FieldGroup label="Profiles">
          <div className="space-y-2">
            {Array.from({ length: profileCount }).map((_, index) => {
              const profile = section.profiles?.[index] || {};
              return (
                <div key={`${selectedSection}-profile-${index}`} className="p-3 bg-zinc-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-200 text-zinc-600 text-[10px] font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">Profile {index + 1}</span>
                  </div>
                  
                  <ImageUploader
                    currentImage={profile.image}
                    onImageUpload={(file) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleProfileFieldChange(index, 'image', e.target.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                    onRemoveBackground={() => {}}
                    isProcessing={isProcessing}
                    compact={true}
                  />

                  <EditableInput
                    placeholder="Name"
                    value={profile.name || ''}
                    onChange={(val) => handleProfileFieldChange(index, 'name', val)}
                    sectionKey={`${selectedSection}-${index}`}
                    className="text-sm"
                  />

                  <EditableInput
                    placeholder="Title"
                    value={profile.title || ''}
                    onChange={(val) => handleProfileFieldChange(index, 'title', val)}
                    sectionKey={`${selectedSection}-${index}`}
                    className="text-sm"
                  />
                </div>
              );
            })}
          </div>
        </FieldGroup>
      </div>
    );
  };

  const renderRecipeEditor = () => (
    <div className="space-y-6">
      {renderContainerSettings()}
      
      <FieldGroup label="Recipe Title">
        <EditableInput
          value={section.title || ''}
          onChange={(val) => handleFieldChange('title', val)}
          sectionKey={selectedSection}
          placeholder="Recipe name"
        />
      </FieldGroup>

      <FieldGroup label="Recipe Image">
        <ImageUploader
          currentImage={section.image}
          onImageUpload={(file) => handleImageUpload(file, 'image')}
          onRemoveBackground={() => handleRemoveBackground('image')}
          isProcessing={isProcessing}
        />
      </FieldGroup>

      <FieldGroup label="Ingredients">
        <EditableTextarea
          value={section.ingredients || ''}
          onChange={(val) => handleFieldChange('ingredients', val)}
          sectionKey={selectedSection}
          rows={4}
          placeholder="List ingredients..."
          className="resize-none"
        />
      </FieldGroup>

      <FieldGroup label="Instructions">
        <EditableTextarea
          value={section.instructions || ''}
          onChange={(val) => handleFieldChange('instructions', val)}
          sectionKey={selectedSection}
          rows={4}
          placeholder="Step by step..."
          className="resize-none"
        />
      </FieldGroup>
    </div>
  );

  const renderFooterEditor = () => (
    <div className="space-y-6">
      {renderContainerSettings()}
      
      <FieldGroup label="Text">
        <EditableTextarea
          value={section.text || ''}
          onChange={(val) => handleFieldChange('text', val)}
          sectionKey={selectedSection}
          rows={3}
          placeholder="Footer content..."
          className="resize-none"
        />
      </FieldGroup>

      <FieldGroup label="Background">
        <GradientPicker
          startColor={section.backgroundColor}
          endColor={section.gradientEnd}
          onStartColorChange={(color) => handleFieldChange('backgroundColor', color)}
          onEndColorChange={(color) => handleFieldChange('gradientEnd', color)}
          sectionKey={selectedSection}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Text Color">
          <input
            type="color"
            value={section.color || '#FFFFFF'}
            onChange={(e) => handleFieldChange('color', e.target.value)}
            className="w-full h-10 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
          />
        </FieldGroup>

        <FieldGroup label="Font Size">
          <NumberInput
            value={section.fontSize || 14}
            onChange={(val) => handleFieldChange('fontSize', val)}
            
            
            suffix="px"
          />
        </FieldGroup>
      </div>
    </div>
  );

  const renderMarqueeEditor = () => {
    const handleInsertIcon = (icon) => {
      const currentValue = section.items || '';
      const newValue = currentValue ? `${currentValue}, ${icon} ` : `${icon} `;
      handleFieldChange('items', newValue);
    };

    return (
    <div className="space-y-6">
      {renderContainerSettings()}
      
      <FieldGroup label="Content">
        <EditableTextarea
          value={section.items || ''}
          onChange={(val) => handleFieldChange('items', val)}
          sectionKey={selectedSection}
          rows={3}
          placeholder="Click 'Add Icon' to insert icons, then add text"
          className="resize-none text-sm"
        />
        <div className="mt-2 flex items-center gap-2">
          <IconPickerButton onSelectIcon={handleInsertIcon} />
          <span className="text-[10px] text-zinc-400">Separate items with commas</span>
        </div>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Speed">
          <Select
            value={section.speed || 30}
            onChange={(e) => handleFieldChange('speed', parseInt(e.target.value))}
          >
            <option value={15}>Fast (15s)</option>
            <option value={20}>Medium-Fast (20s)</option>
            <option value={30}>Medium (30s)</option>
            <option value={40}>Slow (40s)</option>
            <option value={60}>Very Slow (60s)</option>
          </Select>
        </FieldGroup>

        <FieldGroup label="Direction">
          <Select
            value={section.direction || 'left'}
            onChange={(e) => handleFieldChange('direction', e.target.value)}
          >
            <option value="left">← Left</option>
            <option value="right">→ Right</option>
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Background">
          <input
            type="color"
            value={section.backgroundColor || '#04D1FC'}
            onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-zinc-200 cursor-pointer"
          />
        </FieldGroup>

        <FieldGroup label="Text Color">
          <input
            type="color"
            value={section.textColor || '#FFFFFF'}
            onChange={(e) => handleFieldChange('textColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-zinc-200 cursor-pointer"
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Font Size">
          <NumberInput
            value={section.fontSize || 14}
            onChange={(val) => handleFieldChange('fontSize', val)}
            
            
            suffix="px"
          />
        </FieldGroup>

        <FieldGroup label="Padding">
          <NumberInput
            value={section.paddingVertical || 10}
            onChange={(val) => handleFieldChange('paddingVertical', val)}
            
            
            suffix="px"
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Separator">
          <Select
            value={section.separator || '•'}
            onChange={(e) => handleFieldChange('separator', e.target.value)}
          >
            <option value="•">• Bullet</option>
            <option value="|">| Pipe</option>
            <option value="·">· Dot</option>
            <option value="-">- Dash</option>
            <option value="★">★ Star</option>
            <option value="◆">◆ Diamond</option>
          </Select>
        </FieldGroup>

        <FieldGroup label="Font Weight">
          <Select
            value={section.fontWeight || '500'}
            onChange={(e) => handleFieldChange('fontWeight', e.target.value)}
          >
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
          </Select>
        </FieldGroup>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
          <input
            type="checkbox"
            checked={section.pauseOnHover !== false}
            onChange={(e) => handleFieldChange('pauseOnHover', e.target.checked)}
            className="rounded border-zinc-300 text-[#04D1FC] focus:ring-[#04D1FC]"
          />
          Pause on hover
        </label>
      </div>

      <FieldGroup label="GIF Export">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExportMarqueeGif()}
          disabled={isExportingGif}
          className="w-full"
        >
          {isExportingGif ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting... {gifProgress}%
            </>
          ) : (
            <>
              <FileImage className="w-4 h-4" />
              Export as GIF
            </>
          )}
        </Button>
        <p className="text-[9px] text-zinc-400 mt-1">
          For email clients without CSS animation support.
        </p>
      </FieldGroup>
    </div>
    );
  };

  const renderEditor = () => {
    if (!section) return null;
    
    switch (section.type) {
      case 'header': return renderHeaderEditor();
      case 'marquee': return renderMarqueeEditor();
      case 'text': return renderTextEditor();
      case 'sectionHeader': return renderSectionHeaderEditor();
      case 'imageCollage': return renderImageCollageEditor();
      case 'imageSequence': return renderImageSequenceEditor();
      case 'profileCards': return renderProfileCardsEditor();
      case 'recipe': return renderRecipeEditor();
      case 'footer': return renderFooterEditor();
      default: return <p className="text-sm text-zinc-500">Unknown section type</p>;
    }
  };

  const tabs = [
    { id: 'edit', label: 'Edit', icon: Settings },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'media', label: 'Media', icon: Image },
  ];

  return (
    <div className="w-80 bg-white border-l border-zinc-200 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 bg-zinc-50/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                "border-b-2 -mb-[2px]",
                activeTab === tab.id 
                  ? "text-zinc-900 border-zinc-900" 
                  : "text-zinc-400 border-transparent hover:text-zinc-600"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Lock Toggle */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-600">Reorder</span>
        </div>
        <button
          onClick={onToggleUnlock}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
            isUnlocked 
              ? "bg-[#04D1FC] text-white" 
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          )}
        >
          {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {isUnlocked ? 'Unlocked' : 'Locked'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'edit' && (
          <>
            {!selectedSection ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                    <MousePointerClick className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-600 mb-1">No section selected</p>
                  <p className="text-xs text-zinc-400">Click a section in the preview to edit</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900">Edit Section</h2>
                    <Badge className="text-[10px] capitalize bg-zinc-900 text-white">
                      {section?.type}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  {renderEditor()}
                </div>

                <div className="p-4 border-t border-zinc-100 space-y-2 bg-zinc-50/30">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onMoveSection(selectedSection, 'up')}
                      className="flex-1"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Up
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onMoveSection(selectedSection, 'down')}
                      className="flex-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Down
                    </Button>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Delete this section?')) {
                        onDeleteSection(selectedSection);
                      }
                    }}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'theme' && (
          <ThemePanel 
            onSelectColor={handleColorSelect}
            onSelectGradient={handleGradientSelect}
          />
        )}

        {activeTab === 'media' && (
          <MediaKitPanel onSelectLogo={handleLogoSelect} />
        )}
      </div>
    </div>
  );
}

export default SidebarEditor;
