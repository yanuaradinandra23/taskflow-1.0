
import React, { useState } from 'react';
import { Todo, TaskStatus, PriorityLevel } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2, X, List, CheckCircle2, AlertCircle, Clock, AlignLeft, Tag, Sparkles } from 'lucide-react';
import TodoItem from './TodoItem';

interface CalendarViewProps {
  todos: Todo[];
  onAddEvent: (text: string, priority: PriorityLevel, dueDate: string | undefined, tags: string[], description: string, startDate?: string) => Promise<void>;
  onDeleteEvent: (id: string) => void;
  onToggleTodo?: (todo: Todo) => void;
  onAiBreakdown?: (todo: Todo) => void;
  breakingDownId?: string | null;
  onUpdateTodo?: (updatedTodo: Todo) => void; 
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  todos, 
  onAddEvent, 
  onDeleteEvent,
  onToggleTodo,
  onAiBreakdown,
  breakingDownId,
  onUpdateTodo
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState<string>('');
  
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handleDateClick = (dateStr: string) => {
    setPreSelectedDate(dateStr);
    setIsAddModalOpen(true);
  };

  const isDayInRange = (checkDate: Date, startDateStr?: string, dueDateStr?: string) => {
    if (!startDateStr && !dueDateStr) return false;
    const check = checkDate.getTime();
    if (!startDateStr && dueDateStr) {
      return new Date(dueDateStr).setHours(0,0,0,0) === check;
    }
    if (startDateStr && dueDateStr) {
      const start = new Date(startDateStr).setHours(0,0,0,0);
      const end = new Date(dueDateStr).setHours(0,0,0,0);
      return check >= start && check <= end;
    }
    return false;
  };

  const getTaskStyle = (todo: Todo, day: number, month: number, year: number) => {
     const checkDate = new Date(year, month, day).setHours(0,0,0,0);
     const start = todo.startDate ? new Date(todo.startDate).setHours(0,0,0,0) : null;
     const end = todo.dueDate ? new Date(todo.dueDate).setHours(0,0,0,0) : null;

     let isStart = false;
     let isEnd = false;
     let isMiddle = false;

     if (start && end) {
       if (checkDate === start) isStart = true;
       if (checkDate === end) isEnd = true;
       if (checkDate > start && checkDate < end) isMiddle = true;
     } else if (end && checkDate === end) {
       isStart = true; isEnd = true; 
     }

     const baseColor = todo.priority === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                       todo.priority === 'medium' ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                       'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
     
     const completedStyle = todo.completed ? 'opacity-50 grayscale' : '';

     let roundedClass = 'rounded';
     if (isStart && !isEnd) roundedClass = 'rounded-l rounded-r-none ml-1';
     if (!isStart && isEnd) roundedClass = 'rounded-r rounded-l-none mr-1';
     if (isMiddle) roundedClass = 'rounded-none mx-[-1px]'; 

     return `${baseColor} ${completedStyle} ${roundedClass}`;
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const daysArray = [];

    // Empty cells
    for (let i = 0; i < startDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-32 md:h-40 bg-slate-50/30 dark:bg-dark-card/30 border border-slate-100 dark:border-[#2f2f2f]"></div>);
    }

    // Days
    for (let day = 1; day <= totalDays; day++) {
      const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = new Date().toDateString() === thisDate.toDateString();
      const dayTasks = todos.filter(t => isDayInRange(thisDate, t.startDate, t.dueDate));

      daysArray.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(dateStr)}
          className={`
            h-32 md:h-40 border border-slate-100 dark:border-[#2f2f2f] p-1 relative group cursor-pointer transition-all
            hover:bg-slate-50 dark:hover:bg-[#252525]
            ${isToday ? 'bg-primary-50/30 dark:bg-primary-900/10' : 'bg-white dark:bg-dark-card'}
          `}
        >
          <div className="flex justify-between items-start mb-1 px-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
              {day}
            </span>
          </div>
          
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-32px)] custom-scrollbar">
            {dayTasks.map(todo => (
              <div 
                key={todo.id} 
                onClick={(e) => { e.stopPropagation(); setSelectedTask(todo); }}
                className={`
                  text-[11px] px-2 py-1 font-medium truncate cursor-pointer hover:brightness-95 transition-all shadow-sm
                  ${getTaskStyle(todo, day, currentDate.getMonth(), currentDate.getFullYear())}
                `}
                title={`${todo.text} (${todo.status})`}
              >
                {todo.text}
              </div>
            ))}
          </div>
          
           <button 
              onClick={(e) => { e.stopPropagation(); handleDateClick(dateStr); }}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-[#333] rounded-full shadow text-slate-400 hover:text-primary-600 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
        </div>
      );
    }
    return daysArray;
  };

  return (
    <div className="animate-fade-in flex flex-col h-full relative gap-6">
      
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
             <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-light">{currentDate.getFullYear()}</span>
             </h2>
             <p className="text-sm text-slate-500">Plan your schedule and visualize your timeline.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex gap-4 text-xs font-medium bg-white dark:bg-[#202020] px-3 py-2 rounded-lg border border-slate-200 dark:border-[#333]">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-200 rounded-full"></div> High</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-orange-200 rounded-full"></div> Medium</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-200 rounded-full"></div> Low</div>
           </div>
           
           <div className="flex items-center gap-1 bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] rounded-lg p-1 shadow-sm">
             <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded"><ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
             <button onClick={goToToday} className="text-xs font-bold px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded text-slate-600 dark:text-slate-300">Today</button>
             <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded"><ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
           </div>
        </div>
      </div>

      {/* Full Width Calendar Grid */}
      <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-200 dark:border-[#333] shadow-lg overflow-hidden flex flex-col min-h-[600px]">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#252525]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Modals reused from previous code ... */}
      {selectedTask && (
        <TaskDetailModal 
           todo={selectedTask}
           onClose={() => setSelectedTask(null)}
           onUpdate={(updated) => {
              if (onUpdateTodo) onUpdateTodo(updated);
              setSelectedTask(updated);
           }}
           onDelete={onDeleteEvent}
           onAiBreakdown={onAiBreakdown}
        />
      )}

      {isAddModalOpen && (
         <QuickAddModal 
            date={preSelectedDate}
            onClose={() => setIsAddModalOpen(false)}
            onSave={async (title, start, end) => {
                await onAddEvent(title, 'medium', end, [], '', start);
                setIsAddModalOpen(false);
            }}
         />
      )}
    </div>
  );
};

// Sub-components (kept same as previous but ensured available in this file scope)
const TaskDetailModal = ({ todo, onClose, onUpdate, onDelete, onAiBreakdown }: any) => {
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [desc, setDesc] = useState(todo.description || '');
    const handleSaveDesc = () => { onUpdate({ ...todo, description: desc }); setIsEditingDesc(false); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-[#333] flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-slate-100 dark:border-[#333] flex justify-between items-start">
                    <div className="flex-1">
                        <input type="text" value={todo.text} onChange={(e) => onUpdate({...todo, text: e.target.value})} className="text-2xl font-bold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none w-full" />
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                             <span className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded ${todo.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{todo.status}</span>
                             <select value={todo.priority} onChange={(e) => onUpdate({...todo, priority: e.target.value})} className="bg-transparent uppercase font-bold text-[10px] text-slate-500 focus:outline-none cursor-pointer hover:text-indigo-500">
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                             </select>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-[#252525] rounded-xl border border-slate-100 dark:border-[#333]">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Timeline</h4>
                        <div className="flex items-center gap-4 mt-1">
                            <div><label className="text-[10px] text-slate-400 block mb-1">Start Date</label><input type="date" value={todo.startDate || ''} onChange={(e) => onUpdate({...todo, startDate: e.target.value})} className="bg-white dark:bg-[#333] border border-slate-200 dark:border-[#444] rounded px-2 py-1 text-sm font-medium"/></div>
                            <div className="h-px w-8 bg-slate-300"></div>
                            <div><label className="text-[10px] text-slate-400 block mb-1">Due Date</label><input type="date" value={todo.dueDate || ''} onChange={(e) => onUpdate({...todo, dueDate: e.target.value})} className="bg-white dark:bg-[#333] border border-slate-200 dark:border-[#444] rounded px-2 py-1 text-sm font-medium"/></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><AlignLeft className="w-3.5 h-3.5" /> Description</h4></div>
                        {isEditingDesc ? (
                            <div className="flex flex-col gap-2">
                                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full h-32 p-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-lg text-sm focus:outline-none" placeholder="Add detailed notes..."/>
                                <div className="flex justify-end gap-2"><button onClick={() => setIsEditingDesc(false)} className="text-xs px-3 py-1 text-slate-500">Cancel</button><button onClick={handleSaveDesc} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded">Save</button></div>
                            </div>
                        ) : (
                            <div onClick={() => setIsEditingDesc(true)} className="min-h-[80px] p-3 rounded-lg border border-transparent hover:bg-slate-50 dark:hover:bg-[#252525] hover:border-slate-100 dark:hover:border-[#333] cursor-text text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{todo.description || <span className="text-slate-400 italic">Add a description...</span>}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-[#333]">
                        <button onClick={() => { onUpdate({...todo, status: todo.status === 'done' ? 'todo' : 'done', completed: !todo.completed}); onClose(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${todo.status === 'done' ? 'bg-slate-100 text-slate-600' : 'bg-green-600 text-white hover:bg-green-700'}`}><CheckCircle2 className="w-4 h-4" /> {todo.status === 'done' ? 'Mark Incomplete' : 'Complete Task'}</button>
                        <button onClick={() => onAiBreakdown && onAiBreakdown(todo)} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg text-sm font-bold hover:bg-purple-100"><Sparkles className="w-4 h-4" /> AI Breakdown</button>
                        <div className="flex-1"></div>
                        <button onClick={() => { onDelete(todo.id); onClose(); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const QuickAddModal = ({ date, onClose, onSave }: { date: string, onClose: () => void, onSave: (t: string, s: string, e: string) => Promise<void> }) => {
    const [title, setTitle] = useState('');
    const [endDate, setEndDate] = useState(date);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-xl w-96 border border-slate-200 dark:border-[#333] animate-slide-up">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Quick Add Task</h3>
                <input autoFocus className="w-full p-2 mb-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded focus:outline-none focus:border-indigo-500" placeholder="Task title..." value={title} onChange={e => setTitle(e.target.value)} />
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1"><label className="text-[10px] text-slate-400 uppercase font-bold">Start</label><div className="text-sm font-medium">{date}</div></div>
                    <div className="flex-1"><label className="text-[10px] text-slate-400 uppercase font-bold">Due</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-transparent text-sm font-medium focus:outline-none" /></div>
                </div>
                <div className="flex justify-end gap-2"><button onClick={onClose} className="px-3 py-1.5 text-slate-500 text-sm">Cancel</button><button onClick={() => onSave(title, date, endDate)} disabled={!title} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-bold disabled:opacity-50">Save</button></div>
            </div>
        </div>
    )
}

export default CalendarView;
