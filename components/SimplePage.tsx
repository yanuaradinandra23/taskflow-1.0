
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import * as dataService from '../services/dataService';

interface SimplePageProps {
  pageId: string;
  title: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

const SimplePage: React.FC<SimplePageProps> = ({ pageId, title, icon, placeholder }) => {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    try {
      const data = await dataService.getPageContent(pageId);
      setContent(data.content || '');
    } catch (e) { 
      // Handle 404 implies new page
      setContent('');
    }
  };

  const handleSave = async () => {
    try {
      await dataService.savePageContent(pageId, content);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(time);
    } catch (e) { console.error(e); }
  };

  // Auto-save on delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, pageId]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto min-h-[70vh] flex flex-col">
      {/* Cover Image Placeholder - Notion Style */}
      <div className="h-32 w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-[#252525] dark:to-[#333] rounded-t-xl mb-8 opacity-50 hover:opacity-100 transition-opacity relative group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs text-slate-500 font-medium">
             Change Cover
          </div>
      </div>

      <div className="px-4 md:px-12 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">{icon}</div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
        </div>

        {/* Meta / Save Status */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 border-b border-slate-100 dark:border-[#2f2f2f] pb-2">
            <span>Last edited {lastSaved ? `at ${lastSaved}` : 'just now'}</span>
            <button onClick={handleSave} className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                <Save className="w-3 h-3" /> Save manually
            </button>
        </div>

        {/* Content Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || "Type '/' for commands..."}
          className="flex-1 w-full bg-transparent text-slate-700 dark:text-slate-200 text-lg leading-relaxed focus:outline-none resize-none font-serif placeholder:text-slate-300 dark:placeholder:text-slate-600"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default SimplePage;
