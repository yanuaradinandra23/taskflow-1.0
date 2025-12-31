
import React, { useState, useMemo } from 'react';
import { Todo, TaskStatus, PriorityLevel } from '../types';
import { 
  List, Kanban, Grid2X2, Search, Filter, SlidersHorizontal, 
  CheckCircle2, Clock, AlertCircle, Plus 
} from 'lucide-react';
import TodoItem from './TodoItem';
import BoardView from './BoardView';
import MatrixView from './MatrixView';
import AddTodo from './AddTodo';

interface TasksViewProps {
  todos: Todo[];
  onAdd: (text: string, priority: PriorityLevel, dueDate: string | undefined, tags: string[], description: string, startDate?: string) => Promise<void>;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAiBreakdown: (todo: Todo) => void;
  breakingDownId: string | null;
  onUpdateStatus: (todo: Todo, newStatus: TaskStatus) => void;
}

type InternalViewMode = 'list' | 'board' | 'matrix';
type FilterStatus = 'all' | 'active' | 'completed';

const TasksView: React.FC<TasksViewProps> = ({
  todos,
  onAdd,
  onToggle,
  onDelete,
  onAiBreakdown,
  breakingDownId,
  onUpdateStatus
}) => {
  const [viewMode, setViewMode] = useState<InternalViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isAddExpanded, setIsAddExpanded] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.status === 'done').length;
    const active = total - completed;
    const highPriority = todos.filter(t => t.priority === 'high' && t.status !== 'done').length;
    return { total, completed, active, highPriority };
  }, [todos]);

  // Filtering Logic
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // 1. Search
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            todo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 2. Status Filter
      let matchesStatus = true;
      if (filterStatus === 'active') matchesStatus = todo.status !== 'done';
      if (filterStatus === 'completed') matchesStatus = todo.status === 'done';

      // 3. Priority Filter
      let matchesPriority = true;
      if (filterPriority !== 'all') matchesPriority = todo.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => {
        // Sort active first, then by date
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return b.createdAt - a.createdAt;
    });
  }, [todos, searchQuery, filterStatus, filterPriority]);

  return (
    <div className="animate-fade-in flex flex-col h-full space-y-6">
      
      {/* 1. Top Bar: Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Tasks</h1>
          <p className="text-sm text-slate-500">Manage, organize, and track your work efficiently.</p>
        </div>
        
        {/* Quick Stats Pills */}
        <div className="flex gap-3 text-xs font-medium">
            <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {stats.active} Active
            </div>
            <div className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> {stats.highPriority} High Priority
            </div>
            <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> {stats.completed} Done
            </div>
        </div>
      </div>

      {/* 2. Controls Bar: Add, Filter, View Switcher */}
      <div className="bg-white dark:bg-[#202020] p-3 rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm flex flex-col md:flex-row gap-3 items-center sticky top-0 z-20">
         
         {/* Search */}
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#2a2a2a] border border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] focus:border-indigo-500 rounded-lg text-sm transition-all outline-none"
            />
         </div>

         <div className="h-6 w-px bg-slate-200 dark:bg-[#333] hidden md:block"></div>

         {/* Filters */}
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
             <select 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
               className="bg-slate-50 dark:bg-[#2a2a2a] border border-transparent px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:bg-slate-100"
             >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed</option>
             </select>

             <select 
               value={filterPriority} 
               onChange={(e) => setFilterPriority(e.target.value)}
               className="bg-slate-50 dark:bg-[#2a2a2a] border border-transparent px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:bg-slate-100"
             >
                <option value="all">Any Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
             </select>
         </div>

         <div className="h-6 w-px bg-slate-200 dark:bg-[#333] hidden md:block"></div>

         {/* View Switcher Tabs */}
         <div className="flex bg-slate-100 dark:bg-[#2a2a2a] p-1 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'list' ? 'bg-white dark:bg-[#202020] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" /> <span className="hidden lg:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'board' ? 'bg-white dark:bg-[#202020] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <Kanban className="w-4 h-4" /> <span className="hidden lg:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'matrix' ? 'bg-white dark:bg-[#202020] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <Grid2X2 className="w-4 h-4" /> <span className="hidden lg:inline">Matrix</span>
            </button>
         </div>
      </div>

      {/* 3. Add Todo Area */}
      <AddTodo onAdd={onAdd} />

      {/* 4. Content Area */}
      <div className="flex-1 min-h-[400px]">
        {viewMode === 'list' && (
           <div className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden">
              {/* List Header */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 bg-slate-50 dark:bg-[#252525] border-b border-slate-200 dark:border-[#2f2f2f] text-xs font-bold text-slate-400 uppercase tracking-wider">
                 <div className="w-8"></div>
                 <div>Task Name & Metadata</div>
                 <div>Actions</div>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-[#2f2f2f]">
                 {filteredTodos.length > 0 ? (
                    filteredTodos.map(todo => (
                       <div key={todo.id} className="hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors">
                          <TodoItem 
                            todo={todo}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onAiBreakdown={onAiBreakdown}
                            isBreakingDown={breakingDownId === todo.id}
                            viewMode="list"
                          />
                       </div>
                    ))
                 ) : (
                    <div className="p-8 text-center text-slate-400">
                       No tasks found matching your filters.
                    </div>
                 )}
              </div>
              <div className="p-2 bg-slate-50 dark:bg-[#252525] text-center text-xs text-slate-400 border-t border-slate-200 dark:border-[#2f2f2f]">
                 Showing {filteredTodos.length} tasks
              </div>
           </div>
        )}

        {viewMode === 'board' && (
           <BoardView 
             todos={filteredTodos}
             onToggle={onToggle}
             onDelete={onDelete}
             onAiBreakdown={onAiBreakdown}
             breakingDownId={breakingDownId}
             onUpdateStatus={onUpdateStatus}
           />
        )}

        {viewMode === 'matrix' && (
           <MatrixView 
             todos={filteredTodos}
             onToggle={onToggle}
             onDelete={onDelete}
             onAiBreakdown={onAiBreakdown}
             breakingDownId={breakingDownId}
           />
        )}
      </div>
    </div>
  );
};

export default TasksView;
