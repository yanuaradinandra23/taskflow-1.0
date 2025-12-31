
import React from 'react';
import { 
  LayoutDashboard, CheckSquare, Calendar, Settings, BookOpen, Activity, 
  Target, Archive, Wallet, Book, Briefcase, FileText, Globe, Map,
  User, LogOut, ShieldCheck
} from 'lucide-react';
import { PageType, AppTheme, UserProfile, AppConfig } from '../types';

interface SidebarProps {
  activePage: PageType;
  setPage: (page: PageType) => void;
  theme: AppTheme;
  onLogout?: () => void;
  user: UserProfile;
  config: AppConfig; // Receive global configuration
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage, theme, onLogout, user, config }) => {
  
  // Section 1: Favorites / Core
  const favorites = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { id: 'tasks', icon: <CheckSquare className="w-4 h-4" />, label: 'My Tasks' },
    { id: 'calendar', icon: <Calendar className="w-4 h-4" />, label: 'Calendar' },
  ];

  // Section 2: Personal
  const personalItems = [
    { id: 'goals', icon: <Target className="w-4 h-4" />, label: 'Life Goals' },
    { id: 'habits', icon: <Activity className="w-4 h-4" />, label: 'Habit Tracker' },
    { id: 'journal', icon: <BookOpen className="w-4 h-4" />, label: 'Journal' },
    { id: 'reading', icon: <Book className="w-4 h-4" />, label: 'Reading List' },
    { id: 'finances', icon: <Wallet className="w-4 h-4" />, label: 'Finances' },
  ];

  // Section 3: Workspace (Advanced Features)
  const workspaceItems = [
    { id: 'projects', icon: <Briefcase className="w-4 h-4" />, label: 'Projects' },
    { id: 'meeting-notes', icon: <FileText className="w-4 h-4" />, label: 'Meeting Notes' },
    { id: 'team-wiki', icon: <Globe className="w-4 h-4" />, label: 'Team Wiki' },
    { id: 'travel', icon: <Map className="w-4 h-4" />, label: 'Travel Plans' },
    { id: 'archive', icon: <Archive className="w-4 h-4" />, label: 'Archive' },
  ];

  // --- FILTERING LOGIC ---
  // If user is admin, show everything.
  // If user is regular user, hide items in config.disabledModules
  const filterItems = (items: typeof favorites) => {
      if (user.accessLevel === 'admin') return items;
      return items.filter(item => !config.disabledModules.includes(item.id));
  };

  const visibleFavorites = filterItems(favorites);
  const visiblePersonal = filterItems(personalItems);
  const visibleWorkspace = filterItems(workspaceItems);

  // Dynamic styles based on user preference
  const sidebarClasses = theme.sidebarStyle === 'glass' 
    ? 'bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-[#2f2f2f]/50'
    : theme.sidebarStyle === 'minimal'
    ? 'bg-transparent border-r border-transparent'
    : 'bg-[#fbfbfa] dark:bg-[#1f1f1f] border-r border-slate-200 dark:border-[#2f2f2f]';

  const renderMenuItem = (item: any) => (
    <button
      key={item.id}
      onClick={() => setPage(item.id as PageType)}
      className={`
        w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 group
        ${activePage === item.id 
          ? 'bg-slate-100 dark:bg-[#333] text-slate-900 dark:text-white font-medium' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-slate-200'
        }
      `}
    >
      <span className={`${activePage === item.id ? 'text-slate-600 dark:text-slate-200' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500'}`}>
        {item.icon}
      </span>
      {item.label}
    </button>
  );

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-30 transition-all duration-300 ${sidebarClasses}`}>
        
        {/* Header */}
        <div className="px-6 py-6 pb-4">
           <h1 className="font-serif text-lg font-bold tracking-tight text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#333] px-2 py-1 -ml-2 rounded cursor-default transition-colors inline-block">
             TaskFlow
             {user.accessLevel === 'admin' && <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Admin</span>}
           </h1>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-2 custom-scrollbar">
          
          {/* Section: Favorites */}
          <div>
            <div className="space-y-0.5">
              {visibleFavorites.map(renderMenuItem)}
            </div>
          </div>

          {/* Section: Personal */}
          {visiblePersonal.length > 0 && (
            <div>
              <p className="px-3 mb-1 text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider">Personal</p>
              <div className="space-y-0.5">
                {visiblePersonal.map(renderMenuItem)}
              </div>
            </div>
          )}

          {/* Section: Workspace */}
          {visibleWorkspace.length > 0 && (
            <div>
              <p className="px-3 mb-1 text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider">Workspace</p>
              <div className="space-y-0.5">
                {visibleWorkspace.map(renderMenuItem)}
              </div>
            </div>
          )}

        </nav>

        {/* Footer: User Profile & Actions */}
        <div className="p-4 border-t border-slate-200/50 dark:border-[#2f2f2f]">
           <div className="bg-slate-100/50 dark:bg-[#252525] rounded-xl p-2">
             {/* User Card */}
             <button 
               onClick={() => setPage('profile')}
               className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white dark:hover:bg-[#333] transition-colors text-left group mb-1"
             >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${user.accessLevel === 'admin' ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                   {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{user.name}</p>
                   <p className="text-[10px] text-slate-500 truncate capitalize">{user.accessLevel}</p>
                </div>
             </button>

             {/* Action Buttons Row */}
             <div className="grid grid-cols-2 gap-1 mt-1">
                 <button 
                   onClick={() => setPage('settings')}
                   className="flex items-center justify-center gap-2 p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white dark:hover:bg-[#333] transition-colors relative"
                   title="Settings"
                 >
                   <Settings className="w-3.5 h-3.5" />
                   {user.accessLevel === 'admin' && <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                 </button>
                 <button 
                   onClick={onLogout}
                   className="flex items-center justify-center gap-2 p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-[#333] transition-colors"
                   title="Logout"
                 >
                   <LogOut className="w-3.5 h-3.5" />
                 </button>
             </div>
           </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#202020]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#2f2f2f] z-50 px-2 py-3 flex justify-between items-center safe-area-bottom">
        {[favorites[0], favorites[1], favorites[2]].map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as PageType)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activePage === item.id ? 'text-primary-600 dark:text-white' : 'text-slate-400'}`}
          >
            {item.icon}
          </button>
        ))}
         <button
            onClick={() => setPage('profile')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activePage === 'profile' ? 'text-primary-600 dark:text-white' : 'text-slate-400'}`}
          >
            <User className="w-4 h-4" />
          </button>
      </div>
    </>
  );
};

export default Sidebar;
