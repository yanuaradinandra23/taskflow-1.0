
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Todo, TaskStatus, ToastNotification, PriorityLevel, ViewMode, SortOption, PageType, AppTheme, UserProfile, UserRole, AppConfig } from './types';
import * as todoService from './services/todoService';
import * as dataService from './services/dataService'; 
import * as geminiService from './services/geminiService';
import Header from './components/Header';
import AddTodo from './components/AddTodo';
import TodoItem from './components/TodoItem';
import BoardView from './components/BoardView';
import MatrixView from './components/MatrixView';
import FocusTimer from './components/FocusTimer';
import Scratchpad from './components/Scratchpad';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import TasksView from './components/TasksView';
import SettingsView from './components/SettingsView';
import JournalView from './components/JournalView';
import HabitTracker from './components/HabitTracker';
import GoalsView from './components/GoalsView';
import ReadingList from './components/ReadingList';
import FinanceTracker from './components/FinanceTracker';
import ProjectsView from './components/ProjectsView';
import MeetingNotesView from './components/MeetingNotesView';
import TeamWikiView from './components/TeamWikiView';
import TravelPlannerView from './components/TravelPlannerView';
import ArchiveView from './components/ArchiveView';
import DashboardView from './components/DashboardView';
import LoginPage from './components/LoginPage';
import ProfileView from './components/ProfileView';
import ChatWidget from './components/ChatWidget';

import { Loader2, Search, Wand2, Quote, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: 'User',
    email: 'user@taskflow.app',
    bio: 'Productivity enthusiast.',
    role: 'Team Member',
    accessLevel: 'user',
    telegramChatId: ''
  });

  // App Configuration (Admin Controls)
  const [appConfig, setAppConfig] = useState<AppConfig>({
      disabledModules: []
  });

  // Navigation State
  const [activePage, setActivePage] = useState<PageType>('dashboard');

  // Data State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Notification State
  const notifiedTasks = useRef<Set<string>>(new Set());
  
  // Global UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  // Feature States
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Theme State
  const [theme, setTheme] = useState<AppTheme>({
    background: 'clean',
    sidebarStyle: 'solid'
  });

  // =========================================
  // INITIALIZATION & EFFECTS
  // =========================================

  // Check for existing session (mock)
  useEffect(() => {
    const session = localStorage.getItem('taskflow_session');
    if (session) {
        setIsAuthenticated(true);
        // Load user profile if exists
        const savedProfile = localStorage.getItem('taskflow_profile');
        if (savedProfile) {
            setUser(JSON.parse(savedProfile));
        }
    }
    
    // Load App Configuration
    loadAppConfig();

    // Request Notification Permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadAppConfig = async () => {
      try {
          const config = await dataService.getAppConfig();
          setAppConfig(config);
      } catch (e) {
          console.warn("Could not load app config (using default). Ensure backend is running.");
          // We keep the default config { disabledModules: [] } so the app works
      }
  }

  // Handle Config Updates
  const handleUpdateConfig = async (newConfig: AppConfig) => {
      setAppConfig(newConfig);
      try {
          await dataService.saveAppConfig(newConfig);
          showToast("Workspace settings updated", "success");
      } catch (e) {
          showToast("Failed to save settings to server", "error");
      }
  };

  // SMART NOTIFICATIONS SYSTEM
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkReminders = async () => {
      // Logic: Notify if Due Date is TODAY and haven't notified in this session
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

      for (const todo of todos) {
        // Skip if done or no due date
        if (todo.status === 'done' || !todo.dueDate) continue;

        if (todo.dueDate === todayStr && !notifiedTasks.current.has(todo.id)) {
           
           // 1. Native Desktop Notification
           if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("📅 Task Due Today", {
                body: `Reminder: "${todo.text}" is scheduled for today!`,
                icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png' 
              });
           }

           // 2. Telegram Integration
           if (user.telegramChatId) {
              try {
                  await dataService.sendTelegramNotification(
                      user.telegramChatId, 
                      `🔔 *TaskFlow Reminder*\n\nYour task *"${todo.text}"* is due today! 🚀`
                  );
                  console.log("Sent Telegram reminder");
              } catch (e) {
                  console.error("Failed to send Telegram", e);
              }
           }
           
           // Mark as notified so we don't spam every minute
           notifiedTasks.current.add(todo.id);
           showToast(`Reminder: ${todo.text} due today`, 'info');
        }
      }
    };

    // Check immediately and then every minute
    checkReminders();
    const intervalId = setInterval(checkReminders, 60000); 

    return () => clearInterval(intervalId);
  }, [todos, isAuthenticated, user.telegramChatId]);

  const handleLogin = (role: UserRole) => {
    localStorage.setItem('taskflow_session', 'true');
    
    // Set user based on role selection
    const newUser: UserProfile = {
        name: role === 'admin' ? 'Admin User' : 'Standard User',
        email: role === 'admin' ? 'admin@taskflow.app' : 'user@taskflow.app',
        bio: 'Productivity enthusiast.',
        role: role === 'admin' ? 'Workspace Owner' : 'Team Member',
        accessLevel: role,
        telegramChatId: ''
    };
    
    setUser(newUser);
    localStorage.setItem('taskflow_profile', JSON.stringify(newUser));

    setIsAuthenticated(true);
    setActivePage('dashboard');
    showToast(`Welcome back, ${role === 'admin' ? 'Admin' : 'User'}!`, "success");
  };

  const handleLogout = () => {
    // 1. Clear Local Storage Session
    localStorage.removeItem('taskflow_session');
    
    // 2. Clear State
    setIsAuthenticated(false);
    setUser({} as any);
    setTodos([]);
    
    // 3. Stop Audio if playing
    if(audioRef.current && isPlayingSound) {
        audioRef.current.pause();
        setIsPlayingSound(false);
    }

    // 4. Force Reload to clear all memory/intervals cleanly
    window.location.reload();
  };

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
      const newUser = { ...user, ...updates };
      setUser(newUser);
      localStorage.setItem('taskflow_profile', JSON.stringify(newUser));
  };

  // Initialize Audio safely
  useEffect(() => {
    // Use a reliable public domain sound (Heavy Rain)
    const audio = new Audio('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg'); 
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleSounds = async () => {
    if (!audioRef.current) return;

    if (isPlayingSound) {
      audioRef.current.pause();
      setIsPlayingSound(false);
      showToast("Focus sound paused", "info");
    } else {
      try {
        await audioRef.current.play();
        setIsPlayingSound(true);
        showToast("Playing Focus Sound (Rain)", "success");
      } catch (error) {
        console.error("Audio playback failed", error);
        showToast("Could not play audio (Check browser permissions)", "error");
      }
    }
  };

  // Dark Mode
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow_theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  // Update Theme Helper
  const updateTheme = (key: keyof AppTheme, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    localStorage.setItem('taskflow_theme', JSON.stringify(newTheme));
  };

  // FIX: Sync Body AND HTML Background to avoid "black block" on overscroll or empty areas
  useEffect(() => {
    const bgColors: Record<string, string> = {
      clean: isDarkMode ? '#191919' : '#fbfbfa',
      focus: isDarkMode ? '#1a1a2e' : '#f0f4ff', 
      warm: isDarkMode ? '#2d1b1b' : '#fff7ed',
      mesh: isDarkMode ? '#0f172a' : '#f0f9ff',
      nature: isDarkMode ? '#0c1f18' : '#ecfdf5', // Emerald
      ocean: isDarkMode ? '#0c4a6e' : '#f0f9ff', // Sky/Blue
      sunset: isDarkMode ? '#2e1065' : '#f5f3ff', // Violet/Purple
      cyber: isDarkMode ? '#18181b' : '#e4e4e7', // Zinc
    };
    
    let color;
    if (isZenMode) {
        color = isDarkMode ? '#000000' : '#ffffff';
    } else {
        color = bgColors[theme.background] || (isDarkMode ? '#191919' : '#fbfbfa');
    }

    document.body.style.backgroundColor = color;
    document.documentElement.style.backgroundColor = color; // Key fix for "black block"
  }, [theme.background, isDarkMode, isZenMode]);

  // Load Data
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await todoService.getTodos();
        const migratedData = data.map(t => ({
            ...t,
            status: t.status || (t.completed ? 'done' : 'todo'),
            tags: t.tags || [],
            priority: t.priority || 'medium'
        }));
        setTodos(migratedData);
      } catch (error) {
        // Only show offline mode toast if backend is definitely unreachable
        console.warn("Using offline mode or cache due to connection error");
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) loadTodos();
  }, [isAuthenticated]);

  // =========================================
  // HELPERS
  // =========================================

  const showToast = (message: string, type: ToastNotification['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.status === 'done').length;
    const active = total - completed;
    const percent = total === 0 ? 0 : (completed / total) * 100;
    const highPriority = todos.filter(t => t.priority === 'high' && t.status !== 'done').length;
    return { total, active, completed, percent, highPriority };
  }, [todos]);

  // =========================================
  // ACTIONS
  // =========================================

  const handleAddTodo = async (text: string, priority: PriorityLevel, dueDate: string | undefined, tags: string[], description: string, startDate?: string) => {
    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId, text, completed: false, status: 'todo', createdAt: Date.now(),
      priority, dueDate, tags, description, startDate, isAiGenerated: false,
    };
    setTodos(prev => [newTodo, ...prev]);
    try {
      const saved = await todoService.saveTodo(newTodo);
      setTodos(prev => prev.map(t => t.id === tempId ? saved : t));
      showToast("Task scheduled", "success");
    } catch (e) {
      // Keep optimistic update but warn
      showToast("Task saved locally (Server unreachable)", "info");
    }
  };

  const handleUpdateStatus = async (todo: Todo, newStatus: TaskStatus) => {
    const updated = { ...todo, status: newStatus, completed: newStatus === 'done' };
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    try { await todoService.updateTodo(updated); } 
    catch (e) { 
        // Revert on error? Or keep optimistic?
        // keeping optimistic for now
        console.error("Sync failed", e);
    }
  };

  const handleFullUpdate = async (updatedTodo: Todo) => {
      setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t));
      try { await todoService.updateTodo(updatedTodo); }
      catch (e) { showToast("Update failed", "error"); }
  };

  const handleDeleteTodo = async (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;
    if (!window.confirm('Delete this task?')) return;
    setTodos(prev => prev.filter(t => t.id !== id));
    try { await todoService.deleteTodo(id); showToast("Deleted", "info"); } 
    catch (e) { setTodos(prev => [...prev, todoToDelete]); showToast("Failed to delete", "error"); }
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure? This will delete ALL tasks properly.")) {
      localStorage.clear();
      setTodos([]);
      showToast("All data cleared", "success");
      // Optional: Logout on clear
      setIsAuthenticated(false);
    }
  };

  const handleAiBreakdown = async (todo: Todo) => {
    setBreakingDownId(todo.id);
    try {
      const subtasksText = await geminiService.generateSubtasks(todo.text);
      if (subtasksText.length === 0) { showToast("AI response empty. Try again.", "info"); return; }
      const newSubtasks: Todo[] = subtasksText.map(text => ({
        id: crypto.randomUUID(), text, completed: false, status: 'todo',
        createdAt: Date.now(), priority: 'medium', tags: ['subtask'], isAiGenerated: true
      }));
      setTodos(prev => [...newSubtasks, ...prev]); // Add to top for visibility
      try { await todoService.addMultipleTodos(newSubtasks); }
      catch (e) { console.error(e); }
    } catch (error) {
      showToast("AI Service unavailable", "error");
    } finally {
      setBreakingDownId(null);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // --- RENDER CURRENT VIEW ---
  const renderView = () => {
    switch(activePage) {
      case 'dashboard': return <DashboardView todos={todos} navigateTo={setActivePage} user={user} />;
      case 'tasks': return (
        <TasksView 
           todos={todos}
           onAdd={handleAddTodo}
           onToggle={(t) => handleUpdateStatus(t, t.status === 'done' ? 'todo' : 'done')}
           onDelete={handleDeleteTodo}
           onAiBreakdown={handleAiBreakdown}
           breakingDownId={breakingDownId}
           onUpdateStatus={handleUpdateStatus}
        />
      );
      case 'calendar': return (
         <CalendarView 
            todos={todos} 
            onAddEvent={handleAddTodo}
            onDeleteEvent={handleDeleteTodo}
            onUpdateTodo={handleFullUpdate}
            onAiBreakdown={handleAiBreakdown}
         />
      );
      case 'goals': return <GoalsView />;
      case 'journal': return <JournalView />;
      case 'habits': return <HabitTracker />;
      case 'settings': return (
        <SettingsView 
          todos={todos} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onClearData={handleClearAllData}
          theme={theme}
          updateTheme={updateTheme}
          user={user}
          config={appConfig}
          updateConfig={handleUpdateConfig}
        />
      );
      case 'reading': return <ReadingList />;
      case 'finances': return <FinanceTracker />;
      case 'projects': return <ProjectsView />;
      case 'meeting-notes': return <MeetingNotesView />;
      case 'team-wiki': return <TeamWikiView />;
      case 'travel': return <TravelPlannerView />;
      case 'archive': return <ArchiveView />;
      case 'profile': return (
        <ProfileView 
          user={user}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          showToast={showToast}
        />
      );
      default: return <DashboardView todos={todos} navigateTo={setActivePage} user={user} />;
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${theme.background === 'clean' ? (isDarkMode ? 'bg-[#191919]' : 'bg-[#fbfbfa]') : ''}`}>
      {/* Sidebar */}
      {isAuthenticated && <Sidebar activePage={activePage} setPage={setActivePage} theme={theme} onLogout={handleLogout} user={user} config={appConfig} />}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isAuthenticated ? 'md:ml-64' : ''} pb-24 md:pb-0`}>
        <div className={`p-4 md:p-8 max-w-7xl mx-auto min-h-screen ${activePage === 'dashboard' ? '' : ''}`}>
          
          {/* Header (Visible on most pages except Dashboard maybe? No, keep consistent) */}
          {activePage !== 'dashboard' && activePage !== 'settings' && activePage !== 'profile' && (
             <Header 
               stats={stats} 
               viewMode={viewMode} setViewMode={setViewMode}
               isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
               searchQuery={searchQuery} setSearchQuery={setSearchQuery}
               sortOption={sortOption} setSortOption={setSortOption}
               toggleTimer={() => setIsTimerOpen(!isTimerOpen)}
               toggleZenMode={() => setIsZenMode(!isZenMode)}
               toggleScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
               toggleSounds={toggleSounds}
               isZenMode={isZenMode}
             />
          )}

          {renderView()}

        </div>
      </main>

      {/* Global Overlays */}
      <FocusTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      <Scratchpad isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />

      {/* Chat Widget */}
      {isAuthenticated && <ChatWidget currentUser={user} />}

      {/* Toasts */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} notification={toast} onClose={closeToast} />
        ))}
      </div>
    </div>
  );
};

export default App;
