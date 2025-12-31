import React, { useState } from 'react';
import { Todo, TaskStatus } from '../types';
import { Trash2, Sparkles, Check, Calendar, AlertCircle, AlignLeft, MoreHorizontal, ArrowRight } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAiBreakdown: (todo: Todo) => void;
  isBreakingDown: boolean;
  viewMode?: 'list' | 'board';
  onStatusChange?: (status: TaskStatus) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onAiBreakdown,
  isBreakingDown,
  viewMode = 'list',
  onStatusChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priorityStyles = {
    low: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30',
    medium: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/30',
    high: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30',
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date(new Date().setHours(0,0,0,0)) && todo.status !== 'done';
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Simplified Status Cycle for Board View click
  const cycleStatus = () => {
    if (!onStatusChange) return;
    if (todo.status === 'todo') onStatusChange('in-progress');
    else if (todo.status === 'in-progress') onStatusChange('done');
    else onStatusChange('todo');
  }

  return (
    <div 
      className={`
        group relative flex flex-col gap-2 p-3
        bg-white dark:bg-dark-card border rounded-lg transition-all duration-200 ease-out
        ${todo.status === 'done'
          ? 'opacity-60 bg-slate-50/50 dark:bg-dark-card/50 border-transparent shadow-none' 
          : 'shadow-sm border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
        }
        ${viewMode === 'list' ? 'mb-2' : 'mb-0'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox / Status Indicator */}
        {viewMode === 'list' ? (
          <button 
            onClick={() => onToggle(todo)}
            className={`
              flex-shrink-0 mt-0.5 w-5 h-5 rounded-[4px] flex items-center justify-center 
              transition-all duration-200 border
              ${todo.status === 'done' 
                ? 'bg-primary-500 border-primary-500' 
                : 'bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
          >
            {todo.status === 'done' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </button>
        ) : (
          // Board View: Simple Priority Color Dot
          <div className={`mt-1.5 w-2 h-2 rounded-full ${todo.status === 'done' ? 'bg-green-400' : 'bg-slate-300'}`} />
        )}

        <div className="flex-1 min-w-0">
          <p className={`
            text-[14px] leading-snug font-medium break-words transition-all duration-200
            ${todo.status === 'done' ? 'text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600' : 'text-slate-700 dark:text-slate-200'}
          `}>
            {todo.text}
          </p>
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority */}
            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${priorityStyles[todo.priority]}`}>
              {todo.priority}
            </span>

            {/* Date */}
            {todo.dueDate && (
              <span className={`
                flex items-center text-[10px] px-1.5 py-0.5 rounded border
                ${isOverdue 
                  ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400' 
                  : 'text-slate-500 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                }
              `}>
                <Calendar className="w-2.5 h-2.5 mr-1" />
                {formatDate(todo.dueDate)}
              </span>
            )}

            {/* Description Icon */}
            {todo.description && (
              <span className="text-slate-400 dark:text-slate-500" title="Has description">
                <AlignLeft className="w-3 h-3" />
              </span>
            )}

            {/* Tags */}
            {todo.tags && todo.tags.length > 0 && (
              <div className="flex gap-1">
                {todo.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hover Actions (Desktop) */}
        <div className={`
          flex items-center gap-1 transition-opacity duration-200
          ${(isHovered || isBreakingDown || showMenu) ? 'opacity-100' : 'opacity-0'}
        `}>
          {viewMode === 'board' && onStatusChange && (
             <button 
               onClick={cycleStatus}
               className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               title="Move to next status"
             >
               <ArrowRight className="w-3.5 h-3.5" />
             </button>
          )}

          {todo.status !== 'done' && (
            <button
              onClick={() => onAiBreakdown(todo)}
              disabled={isBreakingDown}
              className={`p-1 rounded text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 ${isBreakingDown ? 'animate-spin' : ''}`}
              title="AI Subtasks"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;