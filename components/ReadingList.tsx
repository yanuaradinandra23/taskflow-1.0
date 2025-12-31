
import React, { useState, useEffect } from 'react';
import { Book, Star, Trash2, Plus, Edit3, Minus } from 'lucide-react';
import { Book as BookType } from '../types';
import * as dataService from '../services/dataService';

const ReadingList: React.FC = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit Page State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [tempPage, setTempPage] = useState<number>(0);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [category, setCategory] = useState('Non-Fiction');

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    const data = await dataService.getBooks();
    setBooks(data);
  };

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const colors = ['bg-amber-100', 'bg-blue-100', 'bg-emerald-100', 'bg-rose-100', 'bg-violet-100'];
    const newBook: BookType = {
      id: crypto.randomUUID(),
      title, author, status: 'to-read', rating: 0,
      coverColor: colors[Math.floor(Math.random() * colors.length)],
      totalPages: parseInt(pages) || 300,
      currentPage: 0,
      genre: category
    };
    const saved = await dataService.addBook(newBook);
    setBooks([...books, saved]);
    setIsAdding(false); setTitle(''); setAuthor(''); setPages('');
  };

  const updateProgress = async (book: BookType, page: number) => {
    const newPage = Math.max(0, Math.min(page, book.totalPages || 100));
    const updated = { ...book, currentPage: newPage };
    if (updated.currentPage === updated.totalPages) updated.status = 'finished';
    else if (updated.currentPage > 0) updated.status = 'reading';
    
    setBooks(books.map(b => b.id === book.id ? updated : b));
    await dataService.updateBook(updated);
  };

  const startEditingPage = (book: BookType) => {
    setEditingBookId(book.id);
    setTempPage(book.currentPage || 0);
  };

  const savePageEdit = async (book: BookType) => {
    await updateProgress(book, tempPage);
    setEditingBookId(null);
  };

  const deleteBook = async (id: string) => {
     await dataService.deleteBook(id);
     setBooks(books.filter(b => b.id !== id));
  };

  return (
    <div className="animate-fade-in max-w-5xl">
       <div className="flex items-center justify-between mb-8">
          <div>
             <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <Book className="w-8 h-8 text-indigo-500" /> Digital Bookshelf
             </h2>
             <p className="text-slate-500 dark:text-slate-400 mt-1">Track your reading journey and insights.</p>
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium shadow-md">
             + Add Book
          </button>
       </div>

       {isAdding && (
         <form onSubmit={addBook} className="bg-white dark:bg-[#202020] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-lg mb-8 animate-slide-up grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="p-3 rounded-lg border dark:border-[#444] bg-slate-50 dark:bg-[#2a2a2a]" autoFocus />
            <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author" className="p-3 rounded-lg border dark:border-[#444] bg-slate-50 dark:bg-[#2a2a2a]" />
            <input value={pages} onChange={e=>setPages(e.target.value)} placeholder="Total Pages" type="number" className="p-3 rounded-lg border dark:border-[#444] bg-slate-50 dark:bg-[#2a2a2a]" />
            <button type="submit" className="bg-indigo-600 text-white rounded-lg font-bold">Save Book</button>
         </form>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => {
             const progress = Math.round(((book.currentPage || 0) / (book.totalPages || 1)) * 100);
             const isEditing = editingBookId === book.id;
             const current = book.currentPage || 0;

             return (
               <div key={book.id} className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
                  {/* Spine / Header */}
                  <div className={`h-3 ${book.coverColor} w-full`}></div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 dark:border-[#333] px-2 py-0.5 rounded-full">{book.genre || 'General'}</span>
                        <div className="flex text-yellow-400 gap-0.5">
                           {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= book.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />)}
                        </div>
                     </div>
                     
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1">{book.title}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">by {book.author}</p>
                     
                     <div className="mt-auto space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                           {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={tempPage} 
                                  onChange={(e) => setTempPage(Number(e.target.value))}
                                  className="w-12 px-1 py-0.5 border rounded bg-white dark:bg-[#333] text-slate-800 dark:text-white"
                                  autoFocus
                                  onBlur={() => savePageEdit(book)}
                                  onKeyDown={(e) => e.key === 'Enter' && savePageEdit(book)}
                                />
                                <span>/ {book.totalPages}</span>
                              </div>
                           ) : (
                              <div className="flex items-center gap-2">
                                <span onClick={() => startEditingPage(book)} className="cursor-pointer hover:text-indigo-600 flex items-center gap-1">
                                   {current} / {book.totalPages} <Edit3 className="w-3 h-3 opacity-50" />
                                </span>
                                <div className="flex gap-1 ml-2">
                                   <button onClick={() => updateProgress(book, current - 10)} className="p-0.5 bg-slate-100 dark:bg-[#333] rounded hover:bg-slate-200"><Minus className="w-3 h-3" /></button>
                                   <button onClick={() => updateProgress(book, current + 10)} className="p-0.5 bg-slate-100 dark:bg-[#333] rounded hover:bg-slate-200"><Plus className="w-3 h-3" /></button>
                                </div>
                              </div>
                           )}
                           <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden relative group/bar">
                           <div className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{width: `${progress}%`}}></div>
                           <input 
                              type="range" min="0" max={book.totalPages} value={book.currentPage || 0}
                              onChange={(e) => updateProgress(book, parseInt(e.target.value))}
                              className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
                           />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${book.status === 'reading' ? 'bg-blue-50 text-blue-600' : book.status === 'finished' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                             {book.status}
                           </span>
                           <button onClick={() => deleteBook(book.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </div>
                  </div>
               </div>
             )
          })}
       </div>
    </div>
  );
};

export default ReadingList;
