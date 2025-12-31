
import React, { useState, useEffect } from 'react';
import { 
  Activity, Wallet, Briefcase, Target, Book, 
  CheckCircle2, ChevronRight
} from 'lucide-react';
import { Todo, PageType, Goal, Project, Book as BookType, UserProfile } from '../types';
import * as dataService from '../services/dataService';

interface DashboardViewProps {
  todos: Todo[];
  navigateTo: (page: PageType) => void;
  user: UserProfile; // Changed from string to UserProfile
}

const DashboardView: React.FC<DashboardViewProps> = ({ todos, navigateTo, user }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reading, setReading] = useState<BookType | null>(null);
  const [financeSummary, setFinanceSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [habitStreak, setHabitStreak] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Load Goals
      try {
        const goalsData = await dataService.getGoals();
        setGoals(goalsData.filter(g => g.progress < 100).slice(0, 2));
      } catch (error) { console.warn("Failed to load goals", error); }

      // Load Projects
      try {
        const projectsData = await dataService.getProjects();
        setProjects(projectsData.filter(p => p.status === 'active' || p.status === 'planning').slice(0, 3));
      } catch (error) { console.warn("Failed to load projects", error); }

      // Load Books
      try {
        const booksData = await dataService.getBooks();
        setReading(booksData.find(b => b.status === 'reading') || null);
      } catch (error) { console.warn("Failed to load books", error); }

      // Load Finance
      try {
        const financeData = await dataService.getFinanceItems();
        const inc = financeData.filter(i => i.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
        const exp = financeData.filter(i => i.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
        setFinanceSummary({ income: inc, expense: exp, balance: inc - exp });
      } catch (error) { console.warn("Failed to load finance summary", error); }

      // Load Habits
      try {
        const habitsData = await dataService.getHabits();
        const maxStreak = habitsData.length > 0 ? Math.max(...habitsData.map(h => h.streak)) : 0;
        setHabitStreak(maxStreak);
      } catch (error) { console.warn("Failed to load habits", error); }
    };

    loadDashboardData();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const activeTasks = todos.filter(t => t.status !== 'done');
  const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
  const greeting = new Date().getHours() < 12 ? 'Selamat Pagi' : new Date().getHours() < 18 ? 'Selamat Siang' : 'Selamat Malam';

  const StatCard = ({ icon, label, value, subtext, colorClass, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#202020] p-5 rounded-2xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClass} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {subtext && <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-[#2a2a2a] px-2 py-1 rounded-full">{subtext}</span>}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2 truncate">{value}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">
            {new Date().toLocaleDateString('id-ID', {weekday:'long', month:'long', day:'numeric'})}
          </p>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{greeting}, {user.name.split(' ')[0]}.</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          colorClass="bg-indigo-50 dark:bg-indigo-900/20"
          value={activeTasks.length}
          label="Tasks Pending"
          subtext={`${highPriorityTasks.length} High Priority`}
          onClick={() => navigateTo('tasks')}
        />
        <StatCard 
          icon={<Wallet className="w-5 h-5 text-emerald-600" />}
          colorClass="bg-emerald-50 dark:bg-emerald-900/20"
          value={formatRupiah(financeSummary.balance)}
          label="Saldo Saat Ini"
          subtext={financeSummary.income > 0 ? 'Liquid' : 'Stable'}
          onClick={() => navigateTo('finances')}
        />
        <StatCard 
          icon={<Activity className="w-5 h-5 text-rose-600" />}
          colorClass="bg-rose-50 dark:bg-rose-900/20"
          value={habitStreak}
          label="Best Streak"
          subtext="Keep it up!"
          onClick={() => navigateTo('habits')}
        />
        <StatCard 
          icon={<Briefcase className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50 dark:bg-blue-900/20"
          value={projects.length}
          label="Active Projects"
          subtext="In Progress"
          onClick={() => navigateTo('projects')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" /> Focus Zone
              </h3>
              <button onClick={() => navigateTo('tasks')} className="text-xs font-medium text-slate-500 hover:text-indigo-600">View All</button>
            </div>
            
            {highPriorityTasks.length > 0 ? (
              <div className="space-y-3">
                {highPriorityTasks.slice(0, 3).map(todo => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{todo.text}</span>
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase bg-white dark:bg-[#202020] px-2 py-1 rounded">High Priority</span>
                  </div>
                ))}
                {activeTasks.length > highPriorityTasks.length && (
                   <div className="p-3 text-center text-sm text-slate-500">
                      + {activeTasks.length - Math.min(highPriorityTasks.length, 3)} other tasks
                   </div>
                )}
              </div>
            ) : activeTasks.length > 0 ? (
               <div className="space-y-3">
                {activeTasks.slice(0, 4).map(todo => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-[#333] rounded-xl">
                    <div className={`w-1.5 h-1.5 rounded-full ${todo.priority === 'medium' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{todo.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No active tasks. You're all caught up!</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" /> Recent Projects
                </h3>
                <button onClick={() => navigateTo('projects')} className="text-xs font-medium text-slate-500 hover:text-indigo-600">View All</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.length > 0 ? projects.map(p => (
                   <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-[#333]">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold uppercase bg-white dark:bg-[#333] px-2 py-0.5 rounded text-slate-500">{p.status}</span>
                         <span className="text-xs text-slate-400">{p.progress}%</span>
                      </div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-1">{p.name}</h4>
                      <div className="h-1.5 bg-slate-200 dark:bg-[#333] rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{width: `${p.progress}%`}}></div>
                      </div>
                   </div>
                )) : (
                   <div className="col-span-2 text-center text-sm text-slate-400 py-4">No active projects.</div>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer" onClick={() => navigateTo('reading')}>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Book className="w-24 h-24" /></div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2"><Book className="w-3 h-3" /> Reading Now</h3>
              {reading ? (
                <>
                   <h4 className="text-xl font-bold leading-tight mb-1">{reading.title}</h4>
                   <p className="text-sm opacity-80 mb-4">{reading.author}</p>
                   <div className="flex items-center gap-2 text-xs font-medium">
                      <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                         <div className="h-full bg-white/90" style={{width: `${((reading.currentPage || 0) / (reading.totalPages || 1)) * 100}%`}}></div>
                      </div>
                      <span>{Math.round(((reading.currentPage || 0) / (reading.totalPages || 1)) * 100)}%</span>
                   </div>
                </>
              ) : (
                <div className="py-2">
                   <p className="text-sm opacity-90 mb-2">No active book selected.</p>
                   <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors inline-block">Browse Library</span>
                </div>
              )}
           </div>

           <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800 dark:text-white">Active Goals</h3>
                 <button onClick={() => navigateTo('goals')} className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
              </div>
              {goals.length > 0 ? (
                 <div className="space-y-4">
                    {goals.map(g => (
                       <div key={g.id}>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="font-medium text-slate-700 dark:text-slate-300">{g.title}</span>
                             <span className="text-slate-400">{g.progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-[#333] rounded-full overflow-hidden">
                             <div className={`h-full ${g.category === 'Financial' ? 'bg-green-500' : g.category === 'Health' ? 'bg-orange-500' : 'bg-purple-500'}`} style={{width: `${g.progress}%`}}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <p className="text-sm text-slate-400">No active goals set.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
