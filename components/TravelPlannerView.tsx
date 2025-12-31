
import React, { useState, useEffect } from 'react';
import { Map, Plus, Calendar, Wallet, MapPin, CheckSquare, Trash2, CheckCircle2, X } from 'lucide-react';
import { TravelTrip } from '../types';
import * as dataService from '../services/dataService';

const TravelPlannerView: React.FC = () => {
  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [newDest, setNewDest] = useState('');
  const [newBudget, setNewBudget] = useState('');
  
  // State for adding activity inline
  const [addingActivityTo, setAddingActivityTo] = useState<string | null>(null);
  const [newActivityText, setNewActivityText] = useState('');
  const [newActivityDay, setNewActivityDay] = useState('1');

  useEffect(() => { loadTrips(); }, []);

  const loadTrips = async () => {
    try {
      const data = await dataService.getTravelTrips();
      setTrips(data);
    } catch (e) { console.error(e); }
  };

  const addTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest) return;
    const newTrip: TravelTrip = {
      id: crypto.randomUUID(), 
      destination: newDest, 
      dates: 'TBD', 
      status: 'wishlist', 
      budget: newBudget ? parseInt(newBudget) : 5000000,
      itinerary: []
    };
    const saved = await dataService.addTravelTrip(newTrip);
    setTrips([...trips, saved]);
    setNewDest('');
    setNewBudget('');
  };

  const deleteTrip = async (id: string) => {
    await dataService.deleteTravelTrip(id);
    setTrips(trips.filter(t => t.id !== id));
  };

  const saveActivity = async (trip: TravelTrip) => {
    if (!newActivityText) return;
    
    const day = parseInt(newActivityDay) || 1;
    const newItinerary = [...(trip.itinerary || []), { day, activity: newActivityText }];
    
    // Sort by day
    newItinerary.sort((a, b) => a.day - b.day);

    const updatedTrip = { ...trip, itinerary: newItinerary };
    setTrips(trips.map(t => t.id === trip.id ? updatedTrip : t));
    
    setAddingActivityTo(null);
    setNewActivityText('');
    setNewActivityDay('1');
  };

  const toggleStatus = (trip: TravelTrip) => {
     const nextStatus = trip.status === 'wishlist' ? 'upcoming' : trip.status === 'upcoming' ? 'completed' : 'wishlist';
     const updated = { ...trip, status: nextStatus as any };
     setTrips(trips.map(t => t.id === trip.id ? updated : t));
  };

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="animate-fade-in max-w-5xl">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
               <Map className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Travel Plans</h1>
               <p className="text-sm text-slate-500">The world is a book and those who do not travel read only one page.</p>
             </div>
          </div>
       </div>

       <form onSubmit={addTrip} className="mb-8 bg-white dark:bg-[#202020] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-[#333] flex flex-col md:flex-row gap-3">
          <input 
            value={newDest} onChange={(e) => setNewDest(e.target.value)}
            className="flex-1 p-3 bg-slate-50 dark:bg-[#2a2a2a] border-none rounded-lg focus:ring-2 focus:ring-orange-500/20"
            placeholder="Destination (e.g. Bali, Japan)"
          />
          <input 
            value={newBudget} onChange={(e) => setNewBudget(e.target.value)}
            type="number"
            className="w-48 p-3 bg-slate-50 dark:bg-[#2a2a2a] border-none rounded-lg focus:ring-2 focus:ring-orange-500/20"
            placeholder="Budget (Rp)"
          />
          <button type="submit" className="px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition-colors">
            Plan Trip
          </button>
       </form>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map(trip => (
             <div key={trip.id} className="bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-[#2f2f2f] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="h-32 bg-slate-200 dark:bg-[#333] relative group">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900 to-slate-900"></div>
                   <div className="absolute bottom-4 left-4">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white bg-white/80 dark:bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                        {trip.destination}
                      </h3>
                   </div>
                   <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => toggleStatus(trip)} className="p-2 bg-white/50 hover:bg-white hover:text-green-600 rounded-lg transition-colors" title="Toggle Status">
                          <CheckCircle2 className={`w-4 h-4 ${trip.status === 'completed' ? 'text-green-600' : ''}`} />
                      </button>
                      <button onClick={() => deleteTrip(trip.id)} className="p-2 bg-white/50 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-[10px] uppercase font-bold tracking-wider">
                      {trip.status}
                   </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                   <div className="flex gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] px-3 py-1.5 rounded-lg">
                         <Calendar className="w-4 h-4" /> {trip.dates}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] px-3 py-1.5 rounded-lg">
                         <Wallet className="w-4 h-4" /> {formatRupiah(trip.budget)}
                      </div>
                   </div>

                   <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Itinerary Highlights</h4>
                      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                         {trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary.map((item, idx) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                               <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-orange-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                               </div>
                               <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#252525] shadow-sm">
                                  <div className="flex items-center justify-between space-x-2 mb-1">
                                     <div className="font-bold text-slate-900 dark:text-white text-xs">Day {item.day}</div>
                                  </div>
                                  <div className="text-slate-500 text-sm">{item.activity}</div>
                               </div>
                            </div>
                         )) : (
                            <p className="text-xs text-slate-400 italic pl-8">No activities planned yet.</p>
                         )}
                      </div>
                   </div>
                   
                   {addingActivityTo === trip.id ? (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-[#252525] rounded-lg border border-slate-200 dark:border-[#333] animate-fade-in">
                          <div className="flex gap-2 mb-2">
                             <input 
                               value={newActivityDay} onChange={e=>setNewActivityDay(e.target.value)}
                               type="number" className="w-16 p-2 text-sm rounded border border-slate-200 dark:border-[#444] bg-white dark:bg-[#333]" placeholder="Day"
                             />
                             <input 
                               value={newActivityText} onChange={e=>setNewActivityText(e.target.value)}
                               type="text" className="flex-1 p-2 text-sm rounded border border-slate-200 dark:border-[#444] bg-white dark:bg-[#333]" placeholder="Activity..."
                             />
                          </div>
                          <div className="flex justify-end gap-2">
                             <button onClick={() => setAddingActivityTo(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                             <button onClick={() => saveActivity(trip)} className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded">Save</button>
                          </div>
                      </div>
                   ) : (
                      <button 
                        onClick={() => setAddingActivityTo(trip.id)}
                        className="relative flex items-center gap-2 justify-center w-full py-2 mt-4 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg font-medium transition-colors"
                      >
                         <Plus className="w-4 h-4" /> Add Activity
                      </button>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default TravelPlannerView;
