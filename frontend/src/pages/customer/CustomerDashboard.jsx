import { useState, useEffect } from 'react';
import { Package, Activity, MessageSquare, CreditCard, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const data = {
    totalOrders: 14,
    activeOrders: 2,
    openTickets: 1,
    balanceDue: '$1,250.00'
  };

  const recentActivities = [
    { text: 'Order #ORD-77X was shipped', time: '2 hours ago', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { text: 'Support Ticket #T-102 responded', time: '1 day ago', icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50' },
    { text: 'Payment of $5,000 received', time: '4 days ago', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 fade-up px-4 md:px-0">
      
      {/* Hero Header Area */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-10 md:p-14 shadow-2xl border border-white/5 group">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <span className="px-5 py-2 bg-white/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md flex items-center gap-2">
                    <ShieldCheck size={12} className="animate-pulse" /> CLIENT SECURE SESSION
                  </span>
               </div>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 uppercase italic leading-none">Welcome <span className="text-emerald-500">Back</span></h2>
               <p className="text-slate-400 font-bold max-w-xl text-xs md:text-sm tracking-tight opacity-70 leading-relaxed">Oversee your operational procurement baseline and track real-time logistics sync below.</p>
            </div>
            
            <div className="flex bg-white/5 p-4 rounded-[2.5rem] border border-white/5 backdrop-blur-xl items-center gap-5 pr-8 group/card hover:bg-white/10 transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover/card:rotate-12 transition-transform">
                 <Zap size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Growth Index</p>
                 <p className="text-2xl font-black text-white tabular-nums tracking-tighter">+14.2%</p>
              </div>
            </div>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Orders', val: data.totalOrders, icon: Package, color: 'text-slate-400', bg: 'bg-slate-50' },
          { label: 'Active Streams', val: data.activeOrders, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Open Signals', val: data.openTickets, icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col items-center group hover:-translate-y-3 transition-all duration-500 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className={`relative z-10 w-20 h-20 rounded-3xl ${m.bg} ${m.color} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-700`}>
                <m.icon size={32} />
             </div>
             <div className="relative z-10 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{m.label}</p>
                <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{m.val}</h3>
             </div>
          </div>
        ))}
        
        <div className="bg-slate-950 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group hover:-translate-y-3 transition-all duration-500">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-1000"><CreditCard size={120} /></div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-l-2 border-emerald-500 pl-3">Outstanding Balance</p>
              <h3 className="text-4xl font-black leading-none text-white tracking-tighter tabular-nums group-hover:text-emerald-400 transition-colors uppercase italic">{data.balanceDue}</h3>
           </div>
           <button className="relative z-10 mt-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
             Settle Baseline
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Quick Tracking Panel */}
        <div className="bg-white rounded-[3.5rem] border border-emerald-50 shadow-2xl overflow-hidden flex flex-col p-12 group/tracker">
           <div className="flex justify-between items-center mb-10">
              <div>
                 <h3 className="text-2xl font-black text-slate-900 italic uppercase">Logistics Scan</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time delivery triangulation</p>
              </div>
              <Link to="/customer/tracking" className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <ArrowRight size={20} />
              </Link>
           </div>

           <div className="flex-1 bg-[#F9FFF9] rounded-[2.5rem] p-10 border border-emerald-100 flex flex-col justify-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
              
              <div className="flex justify-between items-end relative z-10">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manifest ID</p>
                    <p className="text-xl font-black text-slate-900 italic">#ORD-77X</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Arrival Vector</p>
                    <p className="text-sm font-black text-slate-700 font-mono">2026-10-14 14:00</p>
                 </div>
              </div>
              
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                 <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full w-[60%] shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                 </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                 <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] italic">In Transit Pipeline</p>
              </div>
           </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-12 group/activity">
           <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900 italic uppercase">System Artifacts</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit log of recent operations</p>
           </div>
           
           <div className="space-y-8">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex gap-6 items-center group/item cursor-pointer">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover/item:scale-110 duration-500 ${act.bg} ${act.color}`}>
                      <act.icon size={24} />
                   </div>
                   <div className="flex-1 border-b border-slate-50 pb-5">
                      <p className="text-sm font-black text-slate-700 group-hover/item:text-emerald-600 transition-colors">{act.text}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 tabular-nums">{act.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
