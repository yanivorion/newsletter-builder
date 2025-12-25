import React, { useState } from 'react';
import { collagePresets, presetCategories, getImageCountForPreset } from '../lib/collagePresets';
import { cn } from '../lib/utils';

// Basic layouts shown in the main tab (matching the user's preferred layouts)
const BASIC_LAYOUT_IDS = [
  'single',
  '2-horizontal',
  '2-left-large',
  '3-vertical',
  '3-horizontal',
  '3-left-featured',
  '3-right-featured',
  '3-bottom-featured',
  '6-grid',
  '5-featured-left',
  '4-top-featured',
  '4-grid',
  '4-mosaic-1',
  '4-corners',
  '9-grid',
  '6-mosaic',
];

function CollagePresetPicker({ currentPreset, onSelectPreset }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Get presets based on active tab
  const basicPresets = collagePresets.filter(p => BASIC_LAYOUT_IDS.includes(p.id));
  const morePresets = collagePresets.filter(p => !BASIC_LAYOUT_IDS.includes(p.id));
  
  // Filter by category when in "more" tab
  const filteredMorePresets = activeCategory === 'all' 
    ? morePresets 
    : morePresets.filter(p => p.category === activeCategory);
  
  const displayPresets = activeTab === 'basic' ? basicPresets : filteredMorePresets;

  return (
    <div className="space-y-3">
      {/* Main Tabs: Basic / More Layouts */}
      <div className="flex gap-1 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('basic')}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
            activeTab === 'basic' 
              ? "bg-zinc-900 text-white" 
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          )}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveTab('more')}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
            activeTab === 'more' 
              ? "bg-zinc-900 text-white" 
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          )}
        >
          More Layouts
        </button>
      </div>
      
      {/* Category Filter (only show in More Layouts tab) */}
      {activeTab === 'more' && (
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors",
              activeCategory === 'all' 
                ? "bg-[#04D1FC] text-white" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            All
          </button>
          {presetCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors",
                activeCategory === cat.id 
                  ? "bg-[#04D1FC] text-white" 
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Preset Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {displayPresets.map((preset) => {
          const isSelected = currentPreset === preset.id;
          const imageCount = getImageCountForPreset(preset);
          
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={cn(
                "relative aspect-square rounded-lg border-2 p-1.5 transition-all duration-150",
                "hover:border-zinc-300 hover:bg-zinc-50 group",
                isSelected 
                  ? "border-[#04D1FC] bg-[#04D1FC]/5 ring-1 ring-[#04D1FC]/20" 
                  : "border-zinc-200 bg-white"
              )}
              title={`${preset.name} (${imageCount} images)`}
            >
              <PresetPreview preview={preset.preview} isSelected={isSelected} />
              
              {/* Image count badge */}
              <span className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center",
                isSelected 
                  ? "bg-[#04D1FC] text-white" 
                  : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300"
              )}>
                {imageCount}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Selected preset info */}
      {currentPreset && (
        <div className="text-[10px] text-zinc-400 text-center">
          {collagePresets.find(p => p.id === currentPreset)?.name || 'Custom'}
        </div>
      )}
    </div>
  );
}

function PresetPreview({ preview, isSelected }) {
  if (!preview || !preview.length) return null;
  
  const rows = preview.length;
  const cols = preview[0].length;
  
  // Track which cells are already rendered (for spanning)
  const rendered = new Set();
  const cells = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = preview[r][c];
      
      if (rendered.has(cellId)) continue;
      
      // Calculate span
      let colSpan = 1;
      let rowSpan = 1;
      
      // Count horizontal span
      while (c + colSpan < cols && preview[r][c + colSpan] === cellId) {
        colSpan++;
      }
      
      // Count vertical span
      while (r + rowSpan < rows && preview[r + rowSpan]?.[c] === cellId) {
        rowSpan++;
      }
      
      rendered.add(cellId);
      
      cells.push({
        id: cellId,
        col: c + 1,
        row: r + 1,
        colSpan,
        rowSpan
      });
    }
  }
  
  return (
    <div 
      className="w-full h-full grid gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={cn(
            "rounded-[2px] transition-colors",
            isSelected ? "bg-[#04D1FC]" : "bg-zinc-300 group-hover:bg-zinc-400"
          )}
          style={{
            gridColumn: `${cell.col} / span ${cell.colSpan}`,
            gridRow: `${cell.row} / span ${cell.rowSpan}`
          }}
        />
      ))}
    </div>
  );
}

export default CollagePresetPicker;
