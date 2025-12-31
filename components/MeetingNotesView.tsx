
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Clock, Users, Search, Trash2 } from 'lucide-react';
import { MeetingNote } from '../types';
import * as dataService from '../services/dataService';

const MeetingNotesView: React.FC = () => {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await dataService.getMeetingNotes();
      setNotes(data);
      if (data.length > 0 && !activeNoteId) setActiveNoteId(data[0].id);
    } catch (e) { console.error(e); }
  };

  const addNote = async () => {
    const newNote: MeetingNote = {
      id: crypto.randomUUID(),
      title: 'New Meeting',
      date: new Date().toISOString(),
      type: 'Adhoc',
      attendees: ['Me'],
      content: ''
    };
    const saved = await dataService.addMeetingNote(newNote);
    setNotes([saved, ...notes]);
    setActiveNoteId(saved.id);
  };

  const updateActiveNote = async (updates: Partial<MeetingNote>) => {
    if (!activeNoteId) return;
    const updatedNotes = notes.map(n => n.id === activeNoteId ? { ...n, ...updates } : n);
    setNotes(updatedNotes);
    const note = updatedNotes.find(n => n.id === activeNoteId);
    if (note) await dataService.updateMeetingNote(note);
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note?")) return;
    await dataService.deleteMeetingNote(id);
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-100px)] animate-fade-in bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 dark:border-[#2f2f2f] flex flex-col bg-slate-50 dark:bg-[#1a1a1a]">
        <div className="p-4 border-b border-slate-200 dark:border-[#2f2f2f]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Meetings
            </h2>
            <button onClick={addNote} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search notes..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-md focus:outline-none focus:border-blue-500"
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-3 rounded-lg cursor-pointer group transition-colors ${activeNoteId === note.id ? 'bg-white dark:bg-[#252525] shadow-sm border border-slate-200 dark:border-[#333]' : 'hover:bg-slate-200/50 dark:hover:bg-[#252525]/50 border border-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <h4 className={`font-semibold text-sm truncate mb-1 ${activeNoteId === note.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{note.title}</h4>
                <button onClick={(e) => deleteNote(e, note.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{new Date(note.date).toLocaleDateString()}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="uppercase text-[9px] font-bold tracking-wider">{note.type}</span>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && <p className="text-center text-xs text-slate-400 mt-4">No meetings found.</p>}
        </div>
      </div>

      {/* Editor Area */}
      {activeNote ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#202020]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-[#2f2f2f]">
             <input 
               type="text" 
               value={activeNote.title}
               onChange={(e) => updateActiveNote({ title: e.target.value })}
               className="text-3xl font-bold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none w-full placeholder-slate-300"
               placeholder="Meeting Title"
             />
             
             <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 <input 
                   type="datetime-local" 
                   value={activeNote.date ? new Date(activeNote.date).toISOString().slice(0,16) : ''}
                   onChange={(e) => updateActiveNote({ date: e.target.value })}
                   className="bg-transparent focus:outline-none"
                 />
               </div>
               <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <input 
                    type="text" 
                    value={activeNote.attendees.join(', ')} 
                    onChange={(e) => updateActiveNote({ attendees: e.target.value.split(', ') })}
                    className="bg-transparent focus:outline-none w-64"
                    placeholder="Add attendees..."
                  />
               </div>
               <select 
                  value={activeNote.type} 
                  onChange={(e) => updateActiveNote({ type: e.target.value as any })}
                  className="bg-slate-100 dark:bg-[#2a2a2a] rounded px-2 py-0.5 focus:outline-none"
               >
                 <option>Adhoc</option>
                 <option>Daily</option>
                 <option>Weekly</option>
                 <option>1:1</option>
               </select>
             </div>
          </div>

          {/* Content */}
          <textarea 
            value={activeNote.content}
            onChange={(e) => updateActiveNote({ content: e.target.value })}
            className="flex-1 w-full p-8 resize-none focus:outline-none text-lg leading-relaxed text-slate-700 dark:text-slate-200 bg-transparent font-serif"
            placeholder="Start typing meeting minutes, action items, and notes..."
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-[#1f1f1f]">
           <div className="text-center">
             <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
             <p>Select a meeting or create a new one.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default MeetingNotesView;
