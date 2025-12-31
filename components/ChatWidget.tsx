
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, User, MoreVertical } from 'lucide-react';
import { ChatMessage, ChatUser } from '../types';
import * as dataService from '../services/dataService';

interface ChatWidgetProps {
  currentUser: { name: string; email: string };
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock Users List
  const users: ChatUser[] = [
    { id: '1', name: 'Product Team', status: 'online', avatarColor: 'bg-indigo-500' },
    { id: '2', name: 'Sarah Designer', status: 'busy', avatarColor: 'bg-pink-500' },
    { id: '3', name: 'Mike Engineer', status: 'offline', avatarColor: 'bg-blue-500' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Poll for messages every 5 seconds (Simple polling)
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatUser]);

  const loadMessages = async () => {
    try {
      const data = await dataService.getChatMessages(currentUser.email);
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: currentUser.email,
      receiverId: activeChatUser.id,
      text: inputText,
      timestamp: Date.now(),
      isRead: false
    };

    // Optimistic Update
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    await dataService.sendChatMessage(newMessage);

    // SIMULATE REPLY (Mock Only)
    if (true) { // In a real app, this check wouldn't exist
        setTimeout(async () => {
            const reply: ChatMessage = {
                id: crypto.randomUUID(),
                senderId: activeChatUser.id,
                receiverId: currentUser.email,
                text: `Thanks for your message, ${currentUser.name.split(' ')[0]}! I'll get back to you shortly.`,
                timestamp: Date.now(),
                isRead: false
            };
            setMessages(prev => [...prev, reply]);
            await dataService.sendChatMessage(reply);
        }, 2000);
    }
  };

  // Filter messages for current conversation
  const currentMessages = messages.filter(m => 
    (m.senderId === currentUser.email && m.receiverId === activeChatUser?.id) ||
    (m.senderId === activeChatUser?.id && m.receiverId === currentUser.email)
  );

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all animate-slide-up"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white dark:bg-[#202020] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#333] flex flex-col overflow-hidden animate-slide-up h-[500px]">
      
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
        {activeChatUser ? (
            <div className="flex items-center gap-3">
                <button onClick={() => setActiveChatUser(null)} className="hover:bg-indigo-700 p-1 rounded"><ChevronDown className="w-5 h-5 rotate-90" /></button>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeChatUser.avatarColor}`}>
                        {activeChatUser.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">{activeChatUser.name}</h3>
                        <p className="text-[10px] opacity-80 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${activeChatUser.status === 'online' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                            {activeChatUser.status}
                        </p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-bold">Team Chat</h3>
            </div>
        )}
        <div className="flex gap-1">
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-indigo-700 rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#1a1a1a]">
        {!activeChatUser ? (
            // User List
            <div className="divide-y divide-slate-100 dark:divide-[#2f2f2f]">
                {users.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => setActiveChatUser(u)}
                      className="p-4 flex items-center gap-3 hover:bg-white dark:hover:bg-[#252525] cursor-pointer transition-colors"
                    >
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${u.avatarColor}`}>
                            {u.name.charAt(0)}
                            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#1a1a1a] rounded-full ${u.status === 'online' ? 'bg-green-500' : u.status === 'busy' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</h4>
                                <span className="text-[10px] text-slate-400">12:30</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Click to start chatting...</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            // Chat Messages
            <div className="p-4 space-y-3">
                <div className="text-center text-[10px] text-slate-400 mb-4">Today</div>
                {currentMessages.length === 0 && (
                    <div className="text-center text-slate-400 text-xs mt-10">
                        Start the conversation with {activeChatUser.name}!
                    </div>
                )}
                {currentMessages.map(msg => {
                    const isMe = msg.senderId === currentUser.email;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                                isMe 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-200 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        )}
      </div>

      {/* Input */}
      {activeChatUser && (
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#202020] border-t border-slate-200 dark:border-[#333] flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-[#2a2a2a] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
            />
            <button type="submit" disabled={!inputText.trim()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
            </button>
        </form>
      )}
    </div>
  );
};

export default ChatWidget;
