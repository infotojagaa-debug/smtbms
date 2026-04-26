import { useState } from 'react';
import { LifeBuoy, Plus, Search } from 'lucide-react';

const CustomerTickets = () => {
  const [tickets] = useState([
    { id: 'T-102', subject: 'Incorrect material quantity delivered', status: 'In Progress', date: 'Oct 15, 2026', replies: 3 },
    { id: 'T-088', subject: 'Need updated compliance certificates', status: 'Resolved', date: 'Oct 02, 2026', replies: 5 },
    { id: 'T-041', subject: 'Damaged packaging on arrival', status: 'Resolved', date: 'Sep 10, 2026', replies: 2 },
  ]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 fade-up px-4 md:px-0">
      
      {/* Hero Header Area */}
      <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-10 md:p-14 shadow-2xl border border-white/5 group">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-5 py-2 bg-white/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md flex items-center gap-2">
                    <Radio size={14} className="animate-pulse" /> SUPPORT VECTOR ACTIVE
                  </span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase italic leading-none">Help <span className="text-emerald-500">Desk</span></h2>
               <p className="text-slate-400 font-bold max-w-xl text-xs md:text-sm tracking-tight opacity-70 leading-relaxed">Initiate new support signals and track resolution triangulation via the global assistance matrix.</p>
            </div>
            
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-emerald-500/20 transition-all flex items-center gap-3 active:scale-95 group/btn">
              <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" /> RAISE SIGNAL
            </button>
         </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl flex flex-col min-h-[500px] overflow-hidden relative group/desk">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
         
         <div className="p-10 border-b border-slate-50 bg-slate-50/10 backdrop-blur-md flex flex-wrap justify-between items-center gap-8 relative z-10">
            <div className="flex bg-white border border-slate-100 rounded-2xl px-6 py-4 hover:border-emerald-500 transition-all w-96 items-center gap-4 shadow-xl shadow-slate-200/10 group/search">
              <Search size={18} className="text-slate-300 group-focus-within/search:text-emerald-500 transition-colors" />
              <input type="text" placeholder="Search operational tickets..." className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300" />
            </div>
            
            <div className="flex text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl p-1.5">
               <button className="px-8 py-3 bg-slate-900 text-white rounded-xl shadow-lg transition-all">Active Signals</button>
               <button className="px-8 py-3 hover:bg-slate-50 transition-colors rounded-xl font-black">Archived</button>
            </div>
         </div>

         <div className="p-10 grid gap-6 relative z-10">
            {tickets.map((t, i) => (
              <div key={i} className="group/item bg-white border border-slate-50 hover:border-emerald-100 rounded-[2.5rem] p-8 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-wrap items-center justify-between gap-6 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover/item:scale-150 transition-transform duration-1000"></div>
                 
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 group-hover/item:bg-emerald-500 group-hover/item:text-white flex items-center justify-center transition-all duration-500 shadow-inner">
                       <MessageCircle size={28} />
                    </div>
                    <div>
                       <div className="flex items-center gap-4 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">INDEX: #{t.id}</span>
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm ${
                             t.status === 'Resolved' ? 'bg-slate-100 text-slate-500 border-transparent' :
                             'bg-emerald-500 text-white border-transparent shadow-emerald-500/20'
                          }`}>
                            {t.status}
                          </span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 group-hover/item:text-emerald-600 transition-colors italic uppercase tracking-tight">{t.subject}</h3>
                    </div>
                 </div>

                 <div className="text-right flex items-center gap-12 relative z-10">
                    <div className="text-center hidden md:block">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Artifacts</p>
                       <div className="flex items-center justify-center gap-2">
                          <Zap size={14} className="text-emerald-500" />
                          <p className="text-sm font-black text-slate-900 tracking-tighter">{t.replies} Transmissions</p>
                       </div>
                    </div>
                    <div className="text-center hidden md:block border-l border-slate-50 pl-12 h-12 flex flex-col justify-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Vector</p>
                       <p className="text-xs font-black text-slate-500 tabular-nums tracking-widest uppercase">{t.date}</p>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default CustomerTickets;
