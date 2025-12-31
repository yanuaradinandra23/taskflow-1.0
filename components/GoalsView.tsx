
import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Goal, Milestone } from '../types';
import * as dataService from '../services/dataService';

const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Goal['category']>('Personal');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const data = await dataService.getGoals();
      setGoals(data);
    } catch (e) { console.error(e); }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    // Auto-create 3 generic milestones for structure
    const initialMilestones: Milestone[] = [
      { id: crypto.randomUUID(), text: 'Planning Phase', isCompleted: false },
      { id: crypto.randomUUID(), text: 'Execution Phase', isCompleted: false },
      { id: crypto.randomUUID(), text: 'Final Review', isCompleted: false },
    ];

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: newTitle,
      category: newCategory,
      progress: 0,
      milestones: initialMilestones
    };

    try {
      const saved = await dataService.addGoal(newGoal);
      setGoals([...goals, saved]);
      setNewTitle('');
      setIsAdding(false);
      setExpandedGoalId(saved.id); // Auto expand new goal
    } catch (e) { console.error(e); }
  };

  const deleteGoal = async (id: string) => {
    await dataService.deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
  };

  const toggleMilestone = async (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones?.map(m => 
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    ) || [];

    // Auto-calculate progress
    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const totalCount = updatedMilestones.length;
    const newProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    const updatedGoal = { ...goal, milestones: updatedMilestones, progress: newProgress };
    
    // Optimistic Update
    setGoals(goals.map(g => g.id === goal.id ? updatedGoal : g));
    await dataService.updateGoal(updatedGoal);
  };

  const categoryColors = {
    Personal: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    Career: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    Financial: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    Health: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  };

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
             <Trophy className="w-8 h-8 text-yellow-500" /> 
             Objectives & Key Results
           </h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Track high-level goals and break them down into milestones.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" /> New Objective
        </button>
      </div>

      {isAdding && (
        <form onSubmit={addGoal} className="mb-8 p-6 bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#333] shadow-lg animate-slide-up">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objective</label>
          <div className="flex gap-4 mb-4">
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Launch New Website, Run a Marathon"
              className="flex-1 bg-slate-50 dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#444] rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoFocus
            />
            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="bg-slate-50 dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#444] rounded-lg px-4 py-3 font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="Personal">Personal</option>
              <option value="Career">Career</option>
              <option value="Financial">Financial</option>
              <option value="Health">Health</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium">Create Goal</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {goals.map(goal => {
            const isExpanded = expandedGoalId === goal.id;
            return (
              <div key={goal.id} className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header */}
                <div 
                  className="p-5 flex items-center gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                >
                    {/* Fixed Circle Chart with viewBox */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                       <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                         <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-[#333]" />
                         <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                           strokeDasharray={125.6} 
                           strokeDashoffset={125.6 - (125.6 * goal.progress) / 100} 
                           className={`text-primary-500 transition-all duration-1000 ease-out`} 
                           strokeLinecap="round"
                         />
                       </svg>
                       <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-white">
                         {goal.progress}%
                       </span>
                    </div>

                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[goal.category]}`}>
                            {goal.category}
                          </span>
                       </div>
                       <h3 className="text-lg font-bold text-slate-800 dark:text-white">{goal.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {/* Milestones / Key Results */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-[#151515] border-t border-slate-100 dark:border-[#2f2f2f] p-5 animate-fade-in">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Key Results & Milestones</h4>
                      <div className="space-y-2">
                        {goal.milestones?.map((milestone) => (
                           <div key={milestone.id} 
                             onClick={() => toggleMilestone(goal, milestone.id)}
                             className="flex items-center gap-3 p-3 bg-white dark:bg-[#252525] rounded-lg border border-slate-200 dark:border-[#333] cursor-pointer hover:border-primary-400 transition-colors group"
                           >
                              {milestone.isCompleted 
                                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> 
                                : <Circle className="w-5 h-5 text-slate-300 group-hover:text-primary-500 flex-shrink-0" />
                              }
                              <span className={`text-sm font-medium ${milestone.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                {milestone.text}
                              </span>
                           </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default GoalsView;
