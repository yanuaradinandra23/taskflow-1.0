
import React, { useState, useEffect } from 'react';
import { Briefcase, MoreHorizontal, Loader2, Plus, Calendar, CheckCircle2, CircleDashed, Users, Clock } from 'lucide-react';
import { Project } from '../types';
import * as dataService from '../services/dataService';

const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<Project['status']>('planning');

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
        const data = await dataService.getProjects();
        setProjects(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const addProject = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newName.trim()) return;
      
      const newItem: Project = { 
          id: crypto.randomUUID(), 
          name: newName,
          description: newDesc,
          status: newStatus, 
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
          progress: 0,
          teamMembers: ['ME'], // Mock
          tags: ['Development']
      };
      
      try {
          const saved = await dataService.addProject(newItem);
          setProjects([saved, ...projects]);
          setNewName(''); setNewDesc(''); setIsAdding(false);
      } catch (e) { console.error(e); }
  };

  const statusConfig = {
      planning: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: CircleDashed, label: 'Planning' },
      active: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300', icon: Clock, label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2, label: 'Completed' },
      paused: { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300', icon: CircleDashed, label: 'Paused' }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="animate-fade-in max-w-6xl">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Active Projects</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your roadmap and deliverables.</p>
                </div>
            </div>
            <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" /> New Project
            </button>
        </div>

        {isAdding && (
            <form onSubmit={addProject} className="mb-8 p-6 bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#333] shadow-lg animate-slide-up">
                <div className="grid gap-4">
                    <input 
                        type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                        placeholder="Project Name"
                        className="w-full text-lg font-bold border-b border-slate-200 dark:border-[#444] pb-2 bg-transparent focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                        autoFocus
                    />
                    <textarea 
                        value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Brief description..."
                        className="w-full text-sm bg-transparent border border-slate-200 dark:border-[#444] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                    />
                    <div className="flex justify-between items-center">
                        <select 
                            value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}
                            className="bg-slate-50 dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 text-sm font-medium">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Create</button>
                        </div>
                    </div>
                </div>
            </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => {
                const StatusIcon = statusConfig[p.status].icon;
                return (
                    <div key={p.id} className="group bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${statusConfig[p.status].color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig[p.status].label}
                                </span>
                                <button className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200"><MoreHorizontal className="w-4 h-4" /></button>
                            </div>
                            
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{p.description || "No description provided."}</p>
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(p.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{p.teamMembers?.length || 1}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Footer */}
                        <div className="px-5 pb-5 pt-0 mt-auto">
                            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                                <span>Progress</span>
                                <span>{p.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-[#333] rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${p.progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            <button 
                onClick={() => setIsAdding(true)}
                className="border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-[#252525] transition-all min-h-[200px]"
            >
                <Plus className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm">Add New Project</span>
            </button>
        </div>
    </div>
  );
};

export default ProjectsView;
