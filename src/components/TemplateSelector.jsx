import React from 'react';
import { Sparkles, FileText, Building2, ArrowRight, Zap, Clock, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const templates = [
  {
    id: 'electrn',
    name: 'Electreon Pro',
    description: 'Professional newsletter with Hebrew support and brand colors',
    icon: Zap,
    gradient: 'from-[#04D1FC] to-[#17A298]',
    sections: [
      { id: 'header-1', type: 'header', backgroundColor: '#04D1FC', gradientEnd: '#17A298', logo: null, title: 'ElectroNews', subtitle: 'מבזקי חדשות מעולם אלקטרון' },
      { id: 'text-1', type: 'text', content: 'שלום לכולם! ברוכים הבאים לגיליון החדש של הניוזלטר שלנו.', textAlign: 'center', direction: 'rtl', fontFamily: 'Noto Sans Hebrew', fontSize: 16, color: '#120F0F', backgroundColor: '#FFFFFF', padding: 40 },
      { id: 'section-header-1', type: 'sectionHeader', text: 'HAPPY BIRTHDAY', backgroundColor: '#04D1FC', color: '#FFFFFF' },
      { id: 'collage-1', type: 'imageCollage', layout: 'featured-left', images: [], gap: 8, imageHeight: 200, backgroundColor: '#FFFFFF' },
      { id: 'footer-1', type: 'footer', backgroundColor: '#120F0F', gradientEnd: '#5E5E5E', text: 'electreon\nPowering the future of transportation', color: '#FFFFFF', fontSize: 14, padding: 30 }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    icon: FileText,
    gradient: 'from-zinc-600 to-zinc-900',
    sections: [
      { id: 'header-1', type: 'header', backgroundColor: '#18181B', gradientEnd: '#27272A', logo: null, title: 'Newsletter', subtitle: 'Monthly Update' },
      { id: 'text-1', type: 'text', content: 'Welcome to our newsletter!', textAlign: 'left', direction: 'ltr', fontFamily: 'Inter', fontSize: 16, color: '#18181B', backgroundColor: '#FFFFFF', padding: 40 },
      { id: 'footer-1', type: 'footer', backgroundColor: '#18181B', gradientEnd: '#27272A', text: 'Company Name', color: '#FFFFFF', fontSize: 14, padding: 30 }
    ]
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business style',
    icon: Building2,
    gradient: 'from-blue-500 to-blue-700',
    sections: [
      { id: 'header-1', type: 'header', backgroundColor: '#0066CC', gradientEnd: '#004499', logo: null, title: 'Company Newsletter', subtitle: 'Business Update' },
      { id: 'section-header-1', type: 'sectionHeader', text: 'HIGHLIGHTS', backgroundColor: '#0088CC', color: '#FFFFFF' },
      { id: 'text-1', type: 'text', content: 'Lorem ipsum dolor sit amet.', textAlign: 'left', direction: 'ltr', fontFamily: 'Inter', fontSize: 16, color: '#18181B', backgroundColor: '#FFFFFF', padding: 40 },
      { id: 'footer-1', type: 'footer', backgroundColor: '#0066CC', gradientEnd: '#004499', text: 'Your Company', color: '#FFFFFF', fontSize: 14, padding: 30 }
    ]
  }
];

function TemplateSelector({ onSelectTemplate, hasSavedNewsletter, onContinueEditing, lastSaveTime }) {
  const formatLastSaved = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#04D1FC] to-[#17A298] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Newsletter Builder</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">
            Create beautiful newsletters
          </h1>
          <p className="text-lg text-zinc-500">
            Choose a template to get started
          </p>
        </div>
      </div>

      {/* Continue Editing Card */}
      {hasSavedNewsletter && (
        <div className="max-w-4xl mx-auto px-6 pb-6">
          <div className="bg-gradient-to-r from-[#04D1FC]/10 to-[#17A298]/10 rounded-2xl border border-[#04D1FC]/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#04D1FC] to-[#17A298] flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">Continue where you left off</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last saved {formatLastSaved(lastSaveTime)}</span>
                  </div>
                </div>
              </div>
              <Button onClick={onContinueEditing} size="lg">
                Continue Editing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        {hasSavedNewsletter && (
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-400 uppercase tracking-wider">Or start fresh</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
        )}
        
        <div className="grid gap-4">
          {templates.map((template, index) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  "group relative w-full text-left bg-white rounded-2xl border border-zinc-200 p-6 transition-all duration-300",
                  "hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50",
                  "active:scale-[0.99]"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                    template.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {template.name}
                      </h3>
                      {template.id === 'electrn' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#04D1FC]/10 text-[#04D1FC] rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">
                      {template.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Preview dots */}
                <div className="mt-5 pt-5 border-t border-zinc-100 flex items-center gap-3">
                  <span className="text-xs text-zinc-400">{template.sections.length} sections</span>
                  <div className="flex gap-1">
                    {template.sections.slice(0, 5).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector;
