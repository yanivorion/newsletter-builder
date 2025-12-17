import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

function ResizableSection({ 
  children, 
  height, 
  onHeightChange, 
  minHeight = 100, 
  maxHeight = 600,
  isSelected,
  isUnlocked 
}) {
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringBottom, setIsHoveringBottom] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(height);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartY(e.clientY);
    setStartHeight(height);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
      onHeightChange(Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startY, startHeight, minHeight, maxHeight, onHeightChange]);

  // Show handle on hover or when resizing
  const showHandle = isHoveringBottom || isResizing;

  return (
    <div 
      ref={containerRef} 
      className="relative"
    >
      {children}
      
      {/* Invisible hover zone at bottom - always present */}
      <div 
        className="absolute left-0 right-0 bottom-0 h-6 z-10"
        onMouseEnter={() => setIsHoveringBottom(true)}
        onMouseLeave={() => !isResizing && setIsHoveringBottom(false)}
      />
      
      {/* Resize handle - only show on hover at bottom or when resizing */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20",
          "flex items-center justify-center",
          "transition-all duration-150",
          showHandle ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
        onMouseEnter={() => setIsHoveringBottom(true)}
        onMouseLeave={() => !isResizing && setIsHoveringBottom(false)}
      >
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full cursor-ns-resize",
            "bg-white border border-zinc-200 shadow-md",
            "hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-lg",
            "transition-all duration-150",
            isResizing && "bg-[#04D1FC] border-[#04D1FC] text-white shadow-lg"
          )}
        >
          <GripHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-medium whitespace-nowrap">
            {isResizing ? `${height}px` : 'Drag to resize'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResizableSection;

