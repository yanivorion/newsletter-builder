import React, { useRef } from 'react';
import { Upload, RefreshCw, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

function ImageUploader({ currentImage, onImageUpload, onRemoveBackground, isProcessing, compact = false }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageUpload(null);
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentImage ? (
        <div className="space-y-2">
          <div className={cn(
            "relative rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200",
            compact ? "h-20" : "h-28"
          )}>
            <img 
              src={currentImage} 
              alt="Preview" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isProcessing}
              className="flex-1 h-7 text-[10px]"
            >
              <RefreshCw className="w-3 h-3" />
              Change
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveBackground}
              disabled={isProcessing}
              className="flex-1 h-7 text-[10px]"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              BG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isProcessing}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#04D1FC] bg-zinc-50 hover:bg-[#04D1FC]/5",
            "transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-[#04D1FC]",
            compact ? "h-20" : "h-28"
          )}
        >
          <Upload className="w-5 h-5" />
          <span className="text-[10px] font-medium">Upload</span>
        </button>
      )}
    </div>
  );
}

export default ImageUploader;
