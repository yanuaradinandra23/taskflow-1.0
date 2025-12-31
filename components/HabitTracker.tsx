import React, { useState, useEffect } from 'react';
import { Activity, Check, Plus, Trash2, Flame, CalendarDays } from 'lucide-react';
import * as dataService from '../services/dataService';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  history?: boolean[]; // Mock history for last 7 days (true/false)
}

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const data = await dataService.getHabits();
      // Enriched mock data for visualization if history is missing
      const enriched = data.map(h => ({
        ...h,
        history: h.history || Array(6).fill(false).map(() => Math.random() > 0.5) // Random history for demo
      }));
      setHabits(enriched);
    } catch (e) { console.error(e); } 
  };

  const toggleHabit = async (habit: Habit) => {
    const updated = {
      ...habit,
      completedToday: !habit.completedToday,
      streak: !habit.completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1)
    };
    setHabits(habits.map(h => h.id === habit.id ? updated : h));
    await dataService.updateHabit(updated);
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    const newItem = { id: crypto.randomUUID(), name: newHabit, streak: 0, completedToday: false, history: [false,false,false,false,false,false] };
    const saved = await dataService.addHabit(newItem);
    setHabits([...habits, saved]);
    setNewHabit('');
  };

  const deleteHabit = async (id: string) => {
    await dataService.deleteHabit(id);
    setHabits(habits.filter(h => h.id !== id));
  };

  // Get last 6 days names
  const days = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'narrow' });
  });

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl">
           <Activity className="w-8 h-8" />
         </div>
         <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Habit Dashboard</h2>
           <p className="text-slate-500 dark:text-slate-400">Consistency is the key to mastery.</p>
         </div>
       </div>

       <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden">
         {/* Table Header */}
         <div className="grid grid-cols-[2fr_1fr_auto] md:grid-cols-[2fr_3fr_1fr] gap-4 p-4 border-b border-slate-100 dark:border-[#2f2f2f] bg-slate-50 dark:bg-[#252525] text-xs font-bold text-slate-400 uppercase tracking-wider items-center">
            <div>Habit Name</div>
            <div className="hidden md:grid grid-cols-7 gap-1 text-center">
               {days.map((d, i) => <span key={i}>{d}</span>)}
               <span className="text-primary-600">Today</span>
            </div>
            <div className="text-right">Streak</div>
         </div>

         {/* Add Row */}
         <div className="p-4 border-b border-slate-100 dark:border-[#2f2f2f]">
           <form onSubmit={addHabit} className="flex gap-2">
             <input 
               type="text" 
               value={newHabit}
               onChange={(e) => setNewHabit(e.target.value)}
               placeholder="Create a new habit..."
               className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 font-medium"
             />
             <button type="submit" className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2 rounded-lg transition-colors">
               <Plus className="w-5 h-5" />
             </button>
           </form>
         </div>

         {/* Habits List */}
         <div className="divide-y divide-slate-100 dark:divide-[#2f2f2f]">
           {habits.map(habit => (
             <div key={habit.id} className="grid grid-cols-[2fr_1fr_auto] md:grid-cols-[2fr_3fr_1fr] gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-[#252525] group transition-colors">
               
               {/* Name */}
               <div className="flex items-center justify-between pr-4">
                 <span className={`font-medium ${habit.completedToday ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{habit.name}</span>
                 <button onClick={() => deleteHabit(habit.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>

               {/* Weekly Grid (Desktop) */}
               <div className="hidden md:grid grid-cols-7 gap-2 justify-items-center">
                  {habit.history?.map((done, idx) => (
                    <div key={idx} className={`w-8 h-8 rounded-md flex items-center justify-center ${done ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-[#333] text-slate-300'}`}>
                       {done ? <Check className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-[#444]" />}
                    </div>
                  ))}
                  {/* Today Button */}
                  <button 
                    onClick={() => toggleHabit(habit)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${habit.completedToday ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-200 dark:bg-[#333] hover:bg-slate-300 dark:hover:bg-[#444] text-slate-400'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
               </div>

               {/* Mobile Toggle (replaces grid) */}
               <div className="md:hidden flex justify-center">
                  <button 
                    onClick={() => toggleHabit(habit)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${habit.completedToday ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-200 dark:bg-[#333]'}`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
               </div>

               {/* Streak */}
               <div className="text-right flex items-center justify-end gap-1.5">
                  <Flame className={`w-4 h-4 ${habit.streak > 2 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-300'}`} />
                  <span className={`font-bold ${habit.streak > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{habit.streak}</span>
               </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};

export default HabitTracker;