
import React, { useState } from 'react';
import { Lock, Mail, Layout, Shield, User, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import * as dataService from '../services/dataService';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');

    try {
        const user = await dataService.login({ email, password });
        // Save user session
        localStorage.setItem('taskflow_session', 'true');
        localStorage.setItem('taskflow_profile', JSON.stringify(user));
        
        // Callback to App.tsx
        onLogin(user.accessLevel as UserRole);
    } catch (err: any) {
        console.error("Login failed", err);
        setError(err.message || "Invalid credentials or server unavailable.");
        setIsLoading(false);
    }
  };

  const fillCredentials = (type: 'admin' | 'user') => {
      if (type === 'admin') {
          setEmail('admin@taskflow.app');
          setPassword('admin123');
      } else {
          setEmail('user@taskflow.app');
          setPassword('user123');
      }
  };

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-[#121212] animate-fade-in">
      
      {/* LEFT SIDE - Branding & Info */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 dark:bg-[#1a1a1a] border-r border-slate-200 dark:border-[#2f2f2f] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <span className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">TaskFlow</span>
          </div>

          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-[1.15]">
            Master your workflow,<br />
            <span className="text-primary-600">amplify your impact.</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
            The intelligent workspace that combines tasks, goals, habits, and finances into one seamless experience.
          </p>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-5">
           <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#333] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                 <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                 <p className="font-bold text-slate-900 dark:text-white">All-in-One Dashboard</p>
                 <p className="text-sm text-slate-500 dark:text-slate-500">Tasks, Calendar, and Wiki in one place.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#333] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                 <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                 <p className="font-bold text-slate-900 dark:text-white">Secure Access</p>
                 <p className="text-sm text-slate-500 dark:text-slate-500">Integrated with PostgreSQL Authentication.</p>
              </div>
           </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-medium">
          © 2024 TaskFlow AI. Designed for productivity.
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-[#121212]">
        <div className="max-w-[400px] w-full">
          
          <div className="lg:hidden mb-8 text-center">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">TaskFlow</h2>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400">Please enter your credentials.</p>
          </div>

          {error && (
             <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
             </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Helper for Testing */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-[#2f2f2f]">
             <p className="text-xs text-center text-slate-400 mb-3 uppercase font-bold tracking-wider">Quick Login (Testing Only)</p>
             <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => fillCredentials('admin')}
                   className="p-2 text-xs font-medium text-slate-600 bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#333] flex items-center justify-center gap-2"
                 >
                    <Shield className="w-3 h-3" /> Admin
                 </button>
                 <button 
                   onClick={() => fillCredentials('user')}
                   className="p-2 text-xs font-medium text-slate-600 bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#333] flex items-center justify-center gap-2"
                 >
                    <User className="w-3 h-3" /> User
                 </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
