import React from 'react';
import { Todo, PriorityLevel } from '../types';
import TodoItem from './TodoItem';

interface MatrixViewProps {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAiBreakdown: (todo: Todo) => void;
  breakingDownId: string | null;
}

const MatrixView: React.FC<MatrixViewProps> = ({ 
  todos, 
  onToggle, 
  onDelete, 
  onAiBreakdown, 
  breakingDownId 
}) => {
  const activeTodos = todos.filter(t => t.status !== 'done');

  // Logic for quadrants
  // Q1: High Priority + Urgent (Due today or overdue)
  // Q2: High Priority + Not Urgent
  // Q3: Low/Med Priority + Urgent
  // Q4: Low/Med Priority + Not Urgent
  
  const isUrgent = (todo: Todo) => {
    if (!todo.dueDate) return false;
    const due = new Date(todo.dueDate).setHours(0,0,0,0);
    const today = new Date().setHours(0,0,0,0);
    return due <= today;
  };

  const quadrants = {
    do: activeTodos.filter(t => t.priority === 'high' && isUrgent(t)),
    decide: activeTodos.filter(t => t.priority === 'high' && !isUrgent(t)),
    delegate: activeTodos.filter(t => t.priority !== 'high' && isUrgent(t)),
    delete: activeTodos.filter(t => t.priority !== 'high' && !isUrgent(t)),
  };

  const renderQuadrant = (title: string, subtitle: string, items: Todo[], colorClass: string) => (
    <div className={`flex flex-col h-full rounded-xl border ${colorClass} bg-opacity-30 p-3 min-h-[250px]`}>
      <div className="mb-3">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {items.map(todo => (
           <TodoItem 
             key={todo.id} 
             todo={todo} 
             onToggle={onToggle}
             onDelete={onDelete}
             onAiBreakdown={onAiBreakdown}
             isBreakingDown={breakingDownId === todo.id}
             viewMode="list" // Re-use list style but compact
           />
        ))}
        {items.length === 0 && <div className="text-xs text-slate-400 italic mt-4 text-center">Empty</div>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full pb-8">
      {renderQuadrant('Do First', 'Urgent & Important', quadrants.do, 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30')}
      {renderQuadrant('Schedule', 'Important, Not Urgent', quadrants.decide, 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30')}
      {renderQuadrant('Delegate', 'Urgent, Not Important', quadrants.delegate, 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/30')}
      {renderQuadrant('Eliminate', 'Neither Urgent nor Important', quadrants.delete, 'border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700')}
    </div>
  );
};

export default MatrixView;