
import React, { useState, useEffect } from 'react';
import { Trash2, Moon, Sun, Download, Database, Info, Palette, Layout, ShieldAlert, CheckSquare, EyeOff, Eye, UserPlus, Users, X, Shield } from 'lucide-react';
import { Todo, AppTheme, UserProfile, AppConfig } from '../types';
import * as dataService from '../services/dataService';

interface SettingsViewProps {
  todos: Todo[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onClearData: () => void;
  theme: AppTheme;
  updateTheme: (key: keyof AppTheme, value: string) => void;
  user: UserProfile;
  config: AppConfig;
  updateConfig: (newConfig: AppConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  todos, 
  isDarkMode, 
  toggleDarkMode, 
  onClearData,
  theme,
  updateTheme,
  user,
  config,
  updateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'modules'>('general');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  
  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
     if (user.accessLevel === 'admin') {
         loadUsers();
     }
  }, [user.accessLevel]);

  const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
          const data = await dataService.getAllUsers();
          setUsersList(data);
      } catch (e) {
          console.error("Failed to load users", e);
      } finally {
          setIsLoadingUsers(false);
      }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.email || !newUser.password || !newUser.name) return;
      
      try {
          const created = await dataService.createUser({
              ...newUser,
              id: crypto.randomUUID()
          });
          setUsersList([...usersList, created]);
          setShowAddUser(false);
          setNewUser({ name: '', email: '', password: '', role: 'user' });
          alert("User created successfully");
      } catch (e) {
          alert("Failed to create user");
      }
  };

  const handleDeleteUser = async (userId: string) => {
      if(!window.confirm("Are you sure? This user will lose access immediately.")) return;
      try {
          await dataService.deleteUser(userId);
          setUsersList(usersList.filter(u => u.id !== userId));
      } catch (e) {
          alert("Failed to delete user");
      }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "taskflow_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const backgrounds = [
    { id: 'clean', label: 'Clean', class: 'bg-[#fbfbfa]' },
    { id: 'focus', label: 'Focus', class: 'bg-gradient-to-br from-indigo-50 to-purple-50' },
    { id: 'warm', label: 'Warmth', class: 'bg-gradient-to-br from-orange-50 to-rose-50' },
    { id: 'mesh', label: 'Mesh', class: 'bg-gradient-to-tr from-blue-50 via-white to-cyan-50' },
    { id: 'nature', label: 'Nature', class: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { id: 'ocean', label: 'Ocean', class: 'bg-gradient-to-br from-sky-50 to-blue-100' },
    { id: 'sunset', label: 'Sunset', class: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50' },
    { id: 'cyber', label: 'Cyber', class: 'bg-gradient-to-br from-slate-200 to-zinc-300' },
  ];

  const availableModules = [
    { id: 'goals', label: 'Life Goals' },
    { id: 'habits', label: 'Habit Tracker' },
    { id: 'journal', label: 'Journal' },
    { id: 'reading', label: 'Reading List' },
    { id: 'finances', label: 'Finances' },
    { id: 'projects', label: 'Projects' },
    { id: 'meeting-notes', label: 'Meeting Notes' },
    { id: 'team-wiki', label: 'Team Wiki' },
    { id: 'travel', label: 'Travel Plans' },
    { id: 'archive', label: 'Archive' },
  ];

  const toggleModule = (moduleId: string) => {
      const isDisabled = config.disabledModules.includes(moduleId);
      let newDisabled;
      if (isDisabled) {
          newDisabled = config.disabledModules.filter(id => id !== moduleId);
      } else {
          newDisabled = [...config.disabledModules, moduleId];
      }
      updateConfig({ ...config, disabledModules: newDisabled });
  };

  return (
    <div className="animate-fade-in max-w-4xl pb-10">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Settings</h2>
      <p className="text-slate-500 text-sm mb-6">Manage your preferences and data.</p>

      {/* ADMIN TABS */}
      {user.accessLevel === 'admin' && (
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-[#333]">
              <button 
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  General
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  <Users className="w-4 h-4" /> User Management
              </button>
              <button 
                onClick={() => setActiveTab('modules')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'modules' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  <Layout className="w-4 h-4" /> Workspace Modules
              </button>
          </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {user.accessLevel === 'admin' && activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">System Users</h3>
                      <p className="text-sm text-slate-500">Add or remove members from your workspace.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
                  >
                      <UserPlus className="w-4 h-4" /> Add User
                  </button>
              </div>

              {showAddUser && (
                  <div className="bg-slate-50 dark:bg-[#252525] p-6 rounded-xl border border-slate-200 dark:border-[#333] animate-slide-up">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-slate-700 dark:text-slate-200">Create New Account</h4>
                          <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                              placeholder="Full Name" 
                              className="p-2 rounded border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a]"
                              value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                              required
                          />
                          <input 
                              placeholder="Email Address" 
                              type="email"
                              className="p-2 rounded border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a]"
                              value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                              required
                          />
                          <input 
                              placeholder="Password" 
                              type="password"
                              className="p-2 rounded border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a]"
                              value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                              required
                          />
                          <select 
                              className="p-2 rounded border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a]"
                              value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                          >
                              <option value="user">Regular User</option>
                              <option value="admin">Administrator</option>
                          </select>
                          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                              <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded font-medium">Create Account</button>
                          </div>
                      </form>
                  </div>
              )}

              <div className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-[#252525] border-b border-slate-200 dark:border-[#2f2f2f]">
                          <tr>
                              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#2f2f2f]">
                          {usersList.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#252525]">
                                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${u.role === 'admin' ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                          {u.name.charAt(0)}
                                      </div>
                                      {u.name}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                                  <td className="px-6 py-4">
                                      <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                          {u.role}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button 
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete User"
                                        disabled={u.email === 'admin@taskflow.app'} // Protect main admin
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {isLoadingUsers && <div className="p-8 text-center text-slate-400">Loading users...</div>}
              </div>
          </div>
      )}

      {/* MODULE MANAGEMENT TAB */}
      {user.accessLevel === 'admin' && activeTab === 'modules' && (
          <div className="space-y-6 animate-fade-in">
             <section className="bg-white dark:bg-[#202020] rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                 Global Config
              </div>
              <div className="p-4 border-b border-indigo-50 dark:border-indigo-900/20 bg-indigo-50/50 dark:bg-indigo-900/10">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Module Visibility
                </h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                   Toggle modules to show or hide them for ALL standard users. Admins always see everything.
                </p>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {availableModules.map(mod => {
                    const isEnabled = !config.disabledModules.includes(mod.id);
                    return (
                       <div 
                         key={mod.id}
                         onClick={() => toggleModule(mod.id)}
                         className={`
                           flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                           ${isEnabled 
                             ? 'bg-white dark:bg-[#252525] border-slate-200 dark:border-[#444]' 
                             : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333] opacity-60'
                           }
                         `}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`p-1.5 rounded ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                {isEnabled ? <CheckSquare className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                             </div>
                             <span className={`text-sm font-medium ${isEnabled ? 'text-slate-800 dark:text-white' : 'text-slate-500 line-through'}`}>
                                {mod.label}
                             </span>
                          </div>
                          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                             <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </section>
          </div>
      )}

      {/* GENERAL SETTINGS (Visible to all, or just "General" tab for admins) */}
      {(activeTab === 'general' || user.accessLevel !== 'admin') && (
      <div className="space-y-6 animate-fade-in">
        
        {/* PERSONALIZATION */}
        <section className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#2f2f2f]">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Personalization
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Background Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Background Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => updateTheme('background', bg.id)}
                    className={`
                      relative group h-16 rounded-lg border-2 transition-all overflow-hidden
                      ${theme.background === bg.id 
                        ? 'border-primary-500 ring-2 ring-primary-500/20' 
                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    <div className={`w-full h-full ${bg.class} dark:opacity-20`}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 bg-white/50 dark:bg-black/50 transition-opacity">
                      {bg.label}
                    </span>
                    {theme.background === bg.id && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-[#2f2f2f]"></div>

            {/* Sidebar Style */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sidebar Appearance</label>
              <div className="flex gap-2">
                {(['solid', 'glass', 'minimal'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateTheme('sidebarStyle', style)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize
                      ${theme.sidebarStyle === style
                        ? 'bg-primary-5 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                        : 'bg-slate-50 dark:bg-[#2a2a2a] border-slate-200 dark:border-[#333] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#333]'
                      }
                    `}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* APP SETTINGS */}
        <section className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#2f2f2f]">
             <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <Layout className="w-4 h-4" /> App Settings
             </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch between light and dark themes</p>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-primary-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* DATA MANAGEMENT */}
        <section className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#2f2f2f]">
             <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <Database className="w-4 h-4" /> Data Management
             </h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#252525] rounded-lg">
                <div>
                   <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Export Data</p>
                   <p className="text-xs text-slate-500">Download a backup of your tasks</p>
                </div>
                <button onClick={exportData} className="p-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">
                   <Download className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
                <div>
                   <p className="text-sm font-medium text-red-700 dark:text-red-400">Clear All Data</p>
                   <p className="text-xs text-red-600/70 dark:text-red-400/70">Permanently delete all tasks and settings</p>
                </div>
                <button onClick={onClearData} className="p-2 text-red-500 hover:text-red-700">
                   <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>
        </section>

      </div>
      )}

      <div className="text-center pt-8">
           <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
             <Info className="w-3 h-3" /> TaskFlow v1.5.0 • {user.accessLevel} mode
           </p>
      </div>

    </div>
  );
};

export default SettingsView;
