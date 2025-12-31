import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Smile, Frown, Meh, CloudRain, Sun, Calendar, Clock, LayoutTemplate } from 'lucide-react';
import * as dataService from '../services/dataService';

const JournalView: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);

  useEffect(() => { loadJournal(); }, []);

  const loadJournal = async () => {
    const data = await dataService.getJournalEntry();
    if (data) {
      setEntry(data.content || '');
      setMood(data.mood || null);
    }
  };

  const handleSave = async () => {
    await dataService.saveJournalEntry(entry, mood);
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const insertTemplate = (template: string) => {
    const prompts = {
      morning: "☀️ Morning Intention\n- Today I want to focus on: \n- I am grateful for: \n- One thing I will do for myself: \n",
      evening: "🌙 Evening Reflection\n- Wins of the day: \n- What I learned: \n- How I can improve tomorrow: \n",
      clarity: "💡 Clarity Session\n- Current challenge: \n- Possible solutions: \n- First step: \n"
    };
    setEntry(entry + (entry ? "\n\n" : "") + (prompts as any)[template]);
    setShowPrompts(false);
  };

  const moods = [
    { id: 'great', icon: <Sun className="w-5 h-5" />, label: 'Great', color: 'text-yellow-500 bg-yellow-50 border-yellow-200' },
    { id: 'good', icon: <Smile className="w-5 h-5" />, label: 'Good', color: 'text-green-500 bg-green-50 border-green-200' },
    { id: 'neutral', icon: <Meh className="w-5 h-5" />, label: 'Okay', color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { id: 'bad', icon: <Frown className="w-5 h-5" />, label: 'Bad', color: 'text-orange-500 bg-orange-50 border-orange-200' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-[calc(100vh-100px)] animate-fade-in gap-6">
      
      {/* Sidebar History (Visual Only for now) */}
      <div className="hidden lg:block w-64 flex-shrink-0">
         <div className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] h-full p-4 flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Past Entries
            </h3>
            <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
               {[0,1,2,3].map(i => {
                 const d = new Date(); d.setDate(d.getDate() - i);
                 return (
                   <div key={i} className={`p-3 rounded-lg cursor-pointer border ${i===0 ? 'bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#252525]'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                        {i % 2 === 0 && <Smile className="w-3 h-3 text-green-500" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {i===0 ? "Today's thoughts..." : "Reflecting on the progress made during the project..."}
                      </p>
                   </div>
                 )
               })}
            </div>
         </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
         <div className="flex items-center justify-between mb-4">
           <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Daily Journal</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" /> {today}
              </p>
           </div>
           
           <div className="relative">
              <button 
                onClick={() => setShowPrompts(!showPrompts)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                <LayoutTemplate className="w-4 h-4 text-purple-500" /> Templates
              </button>
              {showPrompts && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#202020] rounded-xl shadow-xl border border-slate-200 dark:border-[#333] z-20 overflow-hidden animate-slide-up">
                   <button onClick={() => insertTemplate('morning')} className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-200">☀️ Morning Intention</button>
                   <button onClick={() => insertTemplate('evening')} className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-200">🌙 Evening Reflection</button>
                   <button onClick={() => insertTemplate('clarity')} className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-200">💡 Clarity Session</button>
                </div>
              )}
           </div>
         </div>

         <div className="flex gap-2 mb-4">
            {moods.map(m => (
              <button 
                key={m.id} 
                onClick={() => { setMood(m.id); handleSave(); }}
                className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${mood === m.id ? `${m.color} ring-2 ring-offset-1 ring-current` : 'bg-white dark:bg-[#202020] border-slate-200 dark:border-[#333] opacity-60 hover:opacity-100'}`}
              >
                {m.icon}
                <span className="text-[10px] font-bold uppercase">{m.label}</span>
              </button>
            ))}
         </div>

         <div className="flex-1 bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm flex flex-col relative overflow-hidden">
            <textarea 
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Start writing..."
              className="flex-1 w-full p-8 bg-transparent border-none resize-none focus:outline-none text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-serif"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
               {lastSaved && <span className="text-xs text-slate-400">Saved {lastSaved}</span>}
               <button onClick={handleSave} className="p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors">
                 <Save className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default JournalView;