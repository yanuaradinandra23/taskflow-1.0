
import React, { useState, useRef } from 'react';
import { User, Mail, Shield, LogOut, Camera, MapPin, Briefcase, Loader2, Check, Send, Smartphone } from 'lucide-react';
import { UserProfile, ToastNotification } from '../types';
import * as dataService from '../services/dataService';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  showToast: (msg: string, type: ToastNotification['type']) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onLogout, showToast }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio,
    role: user.role,
    telegramChatId: user.telegramChatId || ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        onUpdateUser(formData);
        setIsSaving(false);
        setIsEditing(false);
        showToast("Profile updated successfully", "success");
    }, 1000);
  };

  const handlePasswordReset = () => {
    setIsResettingPass(true);
    setTimeout(() => {
        setIsResettingPass(false);
        showToast("Password reset link sent to email", "info");
    }, 1500);
  };

  const handleLogoutClick = () => {
    setIsLoggingOut(true);
    // Add small delay for visual feedback before App.tsx reloads the page
    setTimeout(() => {
        onLogout();
    }, 500);
  };

  const handleTestNotification = async () => {
    if (!formData.telegramChatId) {
        showToast("Please save a Telegram Chat ID first", "error");
        return;
    }
    setIsTestingNotif(true);
    try {
        await dataService.sendTelegramNotification(
            formData.telegramChatId, 
            "🔔 Test Notification from TaskFlow! Your integration is working."
        );
        showToast("Test message sent to Telegram!", "success");
    } catch (error) {
        showToast("Failed to send. Check ID or Backend connection.", "error");
    } finally {
        setIsTestingNotif(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        showToast("Photo uploaded successfully", "success");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header / Cover */}
      <div className="h-48 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative mb-16">
        <div className="absolute -bottom-12 left-8 flex items-end">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
             <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#191919] bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shadow-lg">
                <span className="text-4xl font-bold text-slate-400 select-none">{getInitials(user.name)}</span>
             </div>
             <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Camera className="w-4 h-4" />
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8">
        <div className="flex justify-between items-start mb-8">
           <div className="pt-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400">{user.role} • Joined Jan 2024</p>
           </div>
           <div className="flex gap-3">
              {isEditing ? (
                 <>
                   <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg disabled:opacity-50">Cancel</button>
                   <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                     Save Changes
                   </button>
                 </>
              ) : (
                 <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-[#252525]">Edit Profile</button>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Left Column: Stats & Info */}
           <div className="space-y-6">
              <div className="bg-white dark:bg-[#202020] p-6 rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-4">About</h3>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                       <Briefcase className="w-4 h-4 text-slate-400" />
                       <span>{user.role}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                       <MapPin className="w-4 h-4 text-slate-400" />
                       <span>Jakarta, Indonesia</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                       <Mail className="w-4 h-4 text-slate-400" />
                       <span className="truncate">{user.email}</span>
                    </div>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#2f2f2f]">
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Subscription</h4>
                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                       <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Pro Plan</span>
                       <span className="text-xs font-medium text-indigo-600 bg-white dark:bg-black/20 px-2 py-1 rounded">Active</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Edit Form or Details */}
           <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#202020] p-6 rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-6">Profile Details</h3>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                          <input 
                             name="name"
                             type="text" 
                             value={formData.name} 
                             onChange={handleInputChange}
                             disabled={!isEditing}
                             className="w-full p-2.5 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                          <input 
                             name="email"
                             type="email" 
                             value={formData.email} 
                             onChange={handleInputChange}
                             disabled={!isEditing}
                             className="w-full p-2.5 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title / Role</label>
                       <input 
                          name="role"
                          type="text"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full p-2.5 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
                       />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                       <textarea 
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className="w-full p-2.5 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                       />
                    </div>
                 </div>
              </div>

              {/* Integrations / Notifications */}
              <div className="bg-white dark:bg-[#202020] p-6 rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Smartphone className="w-5 h-5 text-blue-500" /> Notifications & Integrations
                  </h3>
                  
                  <div className="space-y-4">
                     <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                        <div className="flex items-start gap-3">
                           <Send className="w-5 h-5 text-blue-600 mt-1" />
                           <div className="flex-1">
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Telegram Integration</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                 Get task reminders directly on Telegram. <br/>
                                 1. Start a chat with your bot (e.g. @MyTaskBot). <br/>
                                 2. Get your numeric ID (Use @userinfobot). <br/>
                                 3. Enter it below.
                              </p>
                              <div className="flex gap-2 mt-3">
                                 <input 
                                    name="telegramChatId"
                                    type="text" 
                                    placeholder="e.g. 123456789"
                                    value={formData.telegramChatId}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="flex-1 p-2 text-sm bg-white dark:bg-[#333] border border-slate-200 dark:border-[#444] rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                 />
                                 <button 
                                   onClick={handleTestNotification}
                                   disabled={isTestingNotif || !formData.telegramChatId}
                                   className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-1 disabled:opacity-50"
                                 >
                                    {isTestingNotif ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    Test
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>

              {/* Danger Zone / Logout */}
              <div className="bg-white dark:bg-[#202020] p-6 rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-4">Account Actions</h3>
                 <div className="flex flex-col gap-4">
                     <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-[#333] rounded-lg">
                        <div className="flex items-center gap-3">
                           <Shield className="w-5 h-5 text-slate-400" />
                           <div>
                              <p className="font-medium text-slate-700 dark:text-slate-200">Password & Security</p>
                              <p className="text-xs text-slate-500">Manage 2FA and password</p>
                           </div>
                        </div>
                        <button 
                           onClick={handlePasswordReset}
                           disabled={isResettingPass}
                           className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
                        >
                           {isResettingPass ? 'Sending Email...' : 'Update Password'}
                        </button>
                     </div>

                     <button 
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-70"
                     >
                        {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                     </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;