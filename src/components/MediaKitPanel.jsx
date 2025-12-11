import React, { useState } from 'react';
import { Image, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { mediaKit, getLogosByCategory } from '../lib/mediaKit';
import { cn } from '../lib/utils';

function MediaKitPanel({ onSelectLogo }) {
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleCopy = async (logo) => {
    await navigator.clipboard.writeText(logo.url);
    setCopiedId(logo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelect = (logo) => {
    // Use URL directly - no CORS issues
    onSelectLogo?.(logo.url);
  };

  const filteredLogos = getLogosByCategory(activeCategory);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-zinc-500" />
        <Label className="text-xs uppercase tracking-wide text-zinc-500">Media Kit</Label>
      </div>

      <p className="text-xs text-zinc-400">
        Click to use in newsletter header.
      </p>

      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        {mediaKit.categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors",
              activeCategory === cat.id 
                ? "bg-zinc-900 text-white" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Logos Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredLogos.map((logo) => (
          <div 
            key={logo.id}
            className="group relative rounded-xl border border-zinc-200 p-2 hover:border-[#04D1FC] hover:ring-2 hover:ring-[#04D1FC]/20 transition-all cursor-pointer bg-white overflow-hidden"
            onClick={() => handleSelect(logo)}
          >
            {/* Logo Preview */}
            <div className="h-14 flex items-center justify-center bg-zinc-50 rounded-lg overflow-hidden">
              <img 
                src={logo.url} 
                alt={logo.name}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
                crossOrigin="anonymous"
              />
            </div>
            
            {/* Logo Name */}
            <p className="text-[9px] text-center mt-1.5 truncate text-zinc-500">
              {logo.name}
            </p>

            {/* Category Badge */}
            <div className="absolute top-1 right-1">
              <span className={cn(
                "px-1 py-0.5 text-[7px] font-medium rounded",
                logo.category === 'primary' ? "bg-blue-100 text-blue-600" :
                "bg-purple-100 text-purple-600"
              )}>
                {logo.category}
              </span>
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-0 rounded-xl border-2 border-[#04D1FC] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="pt-3 border-t border-zinc-100 space-y-2">
        <p className="text-[10px] text-zinc-400 text-center">
          {filteredLogos.length} logo{filteredLogos.length !== 1 ? 's' : ''} • Click to use
        </p>
      </div>
    </div>
  );
}

export default MediaKitPanel;
