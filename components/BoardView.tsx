
import React from 'react';
import { Todo, TaskStatus } from '../types';
import TodoItem from './TodoItem';

interface BoardViewProps {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAiBreakdown: (todo: Todo) => void;
  breakingDownId: string | null;
  onUpdateStatus: (todo: Todo, newStatus: TaskStatus) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ 
  todos, 
  onToggle, 
  onDelete, 
  onAiBreakdown, 
  breakingDownId,
  onUpdateStatus 
}) => {
  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-200' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-200' },
    { id: 'done', label: 'Completed', color: 'bg-green-200' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full pb-4">
      {columns.map(col => {
        const colTodos = todos.filter(t => t.status === col.id);
        
        return (
          <div key={col.id} className="flex flex-col min-w-0">
             {/* Column Header */}
             <div className="flex items-center justify-between mb-3 px-1">
               <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                 <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{col.label}</h3>
                 <span className="text-xs text-slate-400 font-medium">{colTodos.length}</span>
               </div>
             </div>

             {/* Drop Zone / List */}
             <div className="bg-slate-50/50 dark:bg-dark-card/50 rounded-xl p-2 min-h-[150px] border border-slate-100 dark:border-dark-border flex-1">
               {colTodos.length > 0 ? (
                 <div className="flex flex-col gap-2">
                   {colTodos.map(todo => (
                     <div key={todo.id} className="relative group">
                       <TodoItem 
                          todo={todo}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          onAiBreakdown={onAiBreakdown}
                          isBreakingDown={breakingDownId === todo.id}
                          viewMode="board"
                          onStatusChange={(status) => onUpdateStatus(todo, status)}
                       />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs italic py-10">
                   Empty
                 </div>
               )}
             </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoardView;
    