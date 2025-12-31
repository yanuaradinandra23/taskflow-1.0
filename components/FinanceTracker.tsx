
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Trash2, PieChart, TrendingUp, Filter } from 'lucide-react';
import { FinanceItem } from '../types';
import * as dataService from '../services/dataService';

const FinanceTracker: React.FC = () => {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('General');

  const categories = ['General', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Salary', 'Freelance'];

  useEffect(() => { loadFinance(); }, []);

  const loadFinance = async () => {
    try {
        const data = await dataService.getFinanceItems();
        setItems(data);
    } catch (e) { console.error("Failed to load finance items", e); }
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    const newItem: FinanceItem = {
      id: crypto.randomUUID(), 
      description: desc, 
      amount: parseFloat(amount), 
      type, 
      category, 
      date: new Date().toISOString()
    };
    
    try {
        const saved = await dataService.addFinanceItem(newItem);
        // Use functional state update to prevent stale closures
        setItems(prevItems => [saved, ...prevItems]);
        setDesc(''); 
        setAmount('');
    } catch (e) {
        console.error("Failed to add transaction", e);
        // Fallback for optimistic UI if backend fails temporarily
        setItems(prevItems => [newItem, ...prevItems]);
        setDesc(''); 
        setAmount('');
    }
  };

  const deleteItem = async (id: string) => {
    try {
        await dataService.deleteFinanceItem(id);
        setItems(prevItems => prevItems.filter(i => i.id !== id));
    } catch (e) {
        console.error("Failed to delete", e);
    }
  };

  const totalIncome = items.filter(i => i.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = items.filter(i => i.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  // Simple Visualization Logic
  const expensePercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  
  // Helper for IDR
  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         {/* Main Card */}
         <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold mb-6">{formatRupiah(balance)}</h2>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-green-400 mb-1 text-xs uppercase font-bold">
                     <div className="p-1 bg-green-500/20 rounded"><ArrowUpRight className="w-3 h-3" /></div> Income
                  </div>
                  <p className="text-xl font-semibold">{formatRupiah(totalIncome)}</p>
               </div>
               <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-red-400 mb-1 text-xs uppercase font-bold">
                     <div className="p-1 bg-red-500/20 rounded"><ArrowDownLeft className="w-3 h-3" /></div> Expense
                  </div>
                  <p className="text-xl font-semibold">{formatRupiah(totalExpense)}</p>
               </div>
            </div>
         </div>

         {/* Budget Visualizer */}
         <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 border border-slate-200 dark:border-[#2f2f2f] flex flex-col justify-center">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-blue-500" /> Monthly Overview
            </h3>
            
            <div className="mb-2 flex justify-between text-sm font-medium">
               <span className="text-slate-500">Spent</span>
               <span className="text-slate-800 dark:text-white">{Math.round(expensePercentage)}% of Income</span>
            </div>
            <div className="h-4 bg-slate-100 dark:bg-[#333] rounded-full overflow-hidden mb-6">
               <div className={`h-full ${expensePercentage > 90 ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-1000`} style={{width: `${expensePercentage}%`}}></div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {categories.slice(1).map(cat => {
                 const catTotal = items.filter(i => i.type === 'expense' && i.category === cat).reduce((a,c) => a + Number(c.amount), 0);
                 if (catTotal === 0) return null;
                 return (
                    <div key={cat} className="flex-shrink-0 px-3 py-2 bg-slate-50 dark:bg-[#252525] rounded-lg border border-slate-100 dark:border-[#333]">
                       <span className="text-xs text-slate-400 block uppercase">{cat}</span>
                       <span className="text-sm font-bold text-slate-800 dark:text-white">{formatRupiah(catTotal)}</span>
                    </div>
                 )
               })}
            </div>
         </div>
      </div>

      <form onSubmit={addTransaction} className="bg-white dark:bg-[#202020] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm mb-6 flex flex-col md:flex-row gap-3">
         <select value={type} onChange={e=>setType(e.target.value as any)} className="bg-slate-50 dark:bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm border-none focus:ring-0 font-medium">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
         </select>
         <input 
            type="text" 
            value={desc} 
            onChange={e=>setDesc(e.target.value)} 
            placeholder="Description" 
            className="flex-1 bg-slate-50 dark:bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none" 
            required
         />
         <input 
            type="number" 
            value={amount} 
            onChange={e=>setAmount(e.target.value)} 
            placeholder="Rp 0" 
            className="w-32 bg-slate-50 dark:bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none" 
            required
            min="0"
         />
         <select value={category} onChange={e=>setCategory(e.target.value)} className="bg-slate-50 dark:bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
         </select>
         <button type="submit" className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
            Add
         </button>
      </form>

      <div className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] overflow-hidden">
         {items.map(item => (
           <div key={item.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#2f2f2f] last:border-0 hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors group">
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {item.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                 </div>
                 <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{item.description}</p>
                    <p className="text-xs text-slate-400 flex gap-2">
                       <span>{new Date(item.date).toLocaleDateString()}</span>
                       <span className="bg-slate-100 dark:bg-[#333] px-1.5 rounded">{item.category || 'General'}</span>
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
                    {item.type === 'income' ? '+' : '-'}{formatRupiah(Number(item.amount))}
                 </span>
                 <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
         {items.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No transactions yet.</div>}
      </div>
    </div>
  );
};

export default FinanceTracker;
