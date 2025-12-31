
import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, File, CheckSquare, Briefcase } from 'lucide-react';
import { ArchivedItem } from '../types';
import * as dataService from '../services/dataService';

const ArchiveView: React.FC = () => {
  const [items, setItems] = useState<ArchivedItem[]>([]);

  useEffect(() => {
    loadArchive();
  }, []);

  const loadArchive = async () => {
    try {
      const data = await dataService.getArchivedItems();
      // Mock data if empty
      if (data.length === 0) {
         setItems([
           { id: '1', originalId: 'a', type: 'task', title: 'Buy groceries (Old)', archivedAt: '2023-10-01' },
           { id: '2', originalId: 'b', type: 'project', title: 'Q3 Marketing', archivedAt: '2023-09-15' },
           { id: '3', originalId: 'c', type: 'doc', title: 'Old Guidelines', archivedAt: '2023-01-20' },
         ]);
      } else {
        setItems(data);
      }
    } catch (e) { console.error(e); }
  };

  const handleRestore = async (id: string) => {
    await dataService.restoreFromArchive(id);
    setItems(items.filter(i => i.id !== id));
  };

  const getIcon = (type: string) => {
    if (type === 'task') return <CheckSquare className="w-4 h-4 text-blue-500" />;
    if (type === 'project') return <Briefcase className="w-4 h-4 text-indigo-500" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="animate-fade-in max-w-4xl">
       <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
             <Archive className="w-6 h-6" />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Archive</h1>
             <p className="text-sm text-slate-500">View and restore previously deleted items.</p>
          </div>
       </div>

       <div className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 dark:bg-[#252525] border-b border-slate-200 dark:border-[#2f2f2f]">
                <tr>
                   <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                   <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                   <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Archived Date</th>
                   <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-[#2f2f2f]">
                {items.map(item => (
                   <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            {getIcon(item.type)}
                            <span className="capitalize text-sm font-medium text-slate-600 dark:text-slate-400">{item.type}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.archivedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleRestore(item.id)}
                           className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1 ml-auto"
                         >
                            <RefreshCw className="w-3 h-3" /> Restore
                         </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
          {items.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">Archive is empty.</div>}
       </div>
    </div>
  );
};

export default ArchiveView;
