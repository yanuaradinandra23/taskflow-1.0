
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, Calendar, Flag, Tag, AlignLeft, ArrowRight } from 'lucide-react';
import { PriorityLevel } from '../types';

interface AddTodoProps {
  onAdd: (text: string, priority: PriorityLevel, dueDate: string | undefined, tags: string[], description: string, startDate?: string) => Promise<void>;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && !text.trim()) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    await onAdd(text, priority, dueDate || undefined, tags, description, startDate || undefined);
    
    setText('');
    setDescription('');
    setPriority('medium');
    setStartDate('');
    setDueDate('');
    setTags([]);
    setTagInput('');
    setIsExpanded(false);
    setIsSubmitting(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div ref={containerRef} className="mb-8 relative z-20">
      <form 
        onSubmit={handleSubmit} 
        className={`
          relative bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-sm transition-all duration-200
          ${isExpanded ? 'shadow-lg ring-1 ring-primary-500/20 border-primary-500/50' : 'hover:border-primary-400/50'}
        `}
      >
        <div className="flex items-center px-4 py-3">
          <div className="mr-3 text-slate-400">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base font-medium"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        {/* Expandable Controls Area */}
        <div className={`
            px-4 pb-3 flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}>
          
          {/* Description Input */}
          <div className="flex items-start gap-2 text-slate-400">
            <AlignLeft className="w-4 h-4 mt-1" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or context..."
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none resize-none h-16"
            />
          </div>

          <div className="h-px bg-slate-100 dark:bg-dark-border w-full" />

          <div className="flex flex-wrap items-center gap-2">
             {/* Priority */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-dark-border rounded-md">
              {(['low', 'medium', 'high'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`
                    px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors
                    ${priority === p ? priorityColors[p] : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}
                  `}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-md px-2 py-1">
               <div className="relative group">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                  <span className={`text-xs ${startDate ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'}`}>
                    {startDate ? new Date(startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'Start'}
                  </span>
               </div>
               <ArrowRight className="w-3 h-3 text-slate-400" />
               <div className="relative group">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                  <span className={`text-xs ${dueDate ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'}`}>
                    {dueDate ? new Date(dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'Due'}
                  </span>
               </div>
            </div>

            {/* Tags Input */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-md px-2 py-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex gap-1">
                 {tags.map(t => (
                   <span key={t} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1 rounded">{t}</span>
                 ))}
              </div>
              <input 
                 type="text"
                 value={tagInput}
                 onChange={(e) => setTagInput(e.target.value)}
                 onKeyDown={handleAddTag}
                 placeholder={tags.length > 0 ? "" : "Add tag..."}
                 className="w-20 text-xs bg-transparent focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400"
              />
            </div>

            <div className="flex-1"></div>

            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTodo;
