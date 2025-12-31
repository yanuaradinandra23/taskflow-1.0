
import React, { useState, useEffect } from 'react';
import { Globe, Plus, File, Search, ChevronRight, Hash } from 'lucide-react';
import { WikiDoc } from '../types';
import * as dataService from '../services/dataService';

const TeamWikiView: React.FC = () => {
  const [docs, setDocs] = useState<WikiDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await dataService.getWikiDocs();
      setDocs(data);
      if (data.length > 0 && !activeDocId) setActiveDocId(data[0].id);
    } catch (e) { console.error(e); }
  };

  const addDoc = async () => {
    const newDoc: WikiDoc = {
      id: crypto.randomUUID(), title: 'Untitled Page', content: '',
      lastUpdated: new Date().toISOString(), author: 'Me', category: 'General'
    };
    const saved = await dataService.addWikiDoc(newDoc);
    setDocs([...docs, saved]);
    setActiveDocId(saved.id);
  };

  const updateDoc = async (updates: Partial<WikiDoc>) => {
    if (!activeDocId) return;
    const updated = docs.map(d => d.id === activeDocId ? { ...d, ...updates, lastUpdated: new Date().toISOString() } : d);
    setDocs(updated);
    const doc = updated.find(d => d.id === activeDocId);
    if(doc) await dataService.updateWikiDoc(doc);
  };

  const activeDoc = docs.find(d => d.id === activeDocId);
  
  // Group by category
  const categories = Array.from(new Set(docs.map(d => d.category)));

  return (
    <div className="flex h-[calc(100vh-100px)] animate-fade-in bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-[#2f2f2f] bg-slate-50 dark:bg-[#1a1a1a] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-[#2f2f2f]">
               <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-pink-500" /> Team Wiki
               </h2>
               <button onClick={addDoc} className="w-full py-1.5 bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> New Page
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
               {categories.map(cat => (
                  <div key={cat} className="mb-4">
                     <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> {cat}
                     </p>
                     <div className="space-y-0.5">
                        {docs.filter(d => d.category === cat).map(doc => (
                           <button 
                             key={doc.id}
                             onClick={() => setActiveDocId(doc.id)}
                             className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 ${activeDocId === doc.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252525]'}`}
                           >
                              <File className="w-3.5 h-3.5 opacity-70" />
                              <span className="truncate">{doc.title}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
               {docs.length === 0 && <div className="p-4 text-center text-xs text-slate-400">Wiki is empty.</div>}
            </div>
        </div>

        {/* Content */}
        {activeDoc ? (
            <div className="flex-1 flex flex-col bg-white dark:bg-[#202020]">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-pink-50 to-indigo-50 dark:from-[#2a1a2a] dark:to-[#1a1a2a] w-full"></div>
                
                <div className="px-12 -mt-8 mb-6">
                   <div className="text-4xl mb-4">📑</div>
                   <input 
                     value={activeDoc.title}
                     onChange={(e) => updateDoc({ title: e.target.value })}
                     className="text-4xl font-bold bg-transparent border-none focus:outline-none w-full text-slate-800 dark:text-white placeholder-slate-300"
                     placeholder="Page Title"
                   />
                   <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                         <span className="font-medium">Category:</span>
                         <input 
                           value={activeDoc.category} 
                           onChange={(e) => updateDoc({category: e.target.value})}
                           className="bg-transparent border-b border-dashed border-slate-300 focus:outline-none hover:border-slate-500 w-24"
                         />
                      </div>
                      <span>Last updated {new Date(activeDoc.lastUpdated).toLocaleDateString()} by {activeDoc.author}</span>
                   </div>
                </div>

                <div className="px-12 flex-1 pb-12">
                   <textarea 
                     value={activeDoc.content}
                     onChange={(e) => updateDoc({ content: e.target.value })}
                     className="w-full h-full resize-none focus:outline-none text-lg text-slate-700 dark:text-slate-200 bg-transparent leading-relaxed"
                     placeholder="Write documentation, policies, or guides here..."
                   />
                </div>
            </div>
        ) : (
            <div className="flex-1"></div>
        )}
    </div>
  );
};

export default TeamWikiView;
