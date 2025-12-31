
import React from 'react';
import { CalendarDays, Moon, Sun, Search, List, Kanban, Grid2X2, Timer, Zap, Volume2, PenTool, LayoutTemplate } from 'lucide-react';
import { Stats, ViewMode, SortOption } from '../types';

interface HeaderProps {
  stats: Stats;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  // New props
  toggleTimer: () => void;
  toggleZenMode: () => void;
  toggleScratchpad: () => void;
  toggleSounds: () => void;
  isZenMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  stats, 
  viewMode, 
  setViewMode, 
  isDarkMode, 
  toggleDarkMode,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  toggleTimer,
  toggleZenMode,
  toggleScratchpad,
  toggleSounds,
  isZenMode
}) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });

  if (isZenMode) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleZenMode}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-slate-500 hover:text-slate-800 p-2 rounded-full shadow-lg"
          title="Exit Zen Mode"
        >
          <Zap className="w-5 h-5 fill-current" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-8 animate-fade-in">
      {/* Top Row: Title & Global Actions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
            <CalendarDays className="w-3 h-3" />
            <span>{today}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            TaskFlow <span className="text-primary-500 text-sm bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md">Pro</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Productivity Tools - Responsive: Scrollable on mobile */}
          <div className="flex items-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-full p-1 shadow-sm mr-2 overflow-x-auto max-w-[120px] md:max-w-none no-scrollbar">
             <button onClick={toggleTimer} className="p-2 text-slate-500 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0" title="Pomodoro Timer">
               <Timer className="w-4 h-4" />
             </button>
             <button onClick={toggleSounds} className="p-2 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0" title="Focus Sounds">
               <Volume2 className="w-4 h-4" />
             </button>
             <button onClick={toggleScratchpad} className="p-2 text-slate-500 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0" title="Scratchpad">
               <PenTool className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0"></div>
             <button onClick={toggleZenMode} className="p-2 text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0" title="Zen Mode">
               <Zap className="w-4 h-4" />
             </button>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 flex-shrink-0"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Control Bar: Search, View, Sort */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tasks, tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* View Switcher */}
          <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-dark-card shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-dark-card shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'matrix' ? 'bg-white dark:bg-dark-card shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              title="Eisenhower Matrix"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none hover:border-slate-300 cursor-pointer w-full md:w-auto"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-700" 
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{Math.round(stats.percent)}%</span>
      </div>
    </div>
  );
};

export default Header;
    