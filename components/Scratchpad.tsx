import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('taskflow_scratchpad');
    if (saved) setNote(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('taskflow_scratchpad', note);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-24 right-6 z-40 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl shadow-xl w-72 animate-slide-up backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider">Scratchpad</span>
        <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-500 dark:hover:text-yellow-300">
          <X className="w-4 h-4" />
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => { setNote(e.target.value); handleSave(); }}
        className="w-full h-48 bg-transparent text-sm text-slate-700 dark:text-slate-200 resize-none focus:outline-none font-mono leading-relaxed"
        placeholder="Type quick thoughts here..."
      />
      <div className="mt-2 text-[10px] text-yellow-600/60 dark:text-yellow-500/50 text-right">
        Auto-saving...
      </div>
    </div>
  );
};

export default Scratchpad;