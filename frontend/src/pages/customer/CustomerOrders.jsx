import { ShoppingBag, FileText, CheckCircle2 } from 'lucide-react';

const CustomerOrders = () => {
  const orders = [
    { id: 'ORD-77X', date: 'Oct 12, 2026', total: '$4,250.00', status: 'In Transit', items: 24, paid: true },
    { id: 'ORD-82B', date: 'Oct 10, 2026', total: '$850.50', status: 'Packed', items: 5, paid: true },
    { id: 'ORD-44F', date: 'Sep 25, 2026', total: '$1,200.00', status: 'Delivered', items: 10, paid: true },
    { id: 'ORD-91A', date: 'Sep 15, 2026', total: '$12,400.00', status: 'Cancelled', items: 100, paid: false },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 fade-up px-4 md:px-0">
      <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-10 md:p-14 shadow-2xl border border-white/5 group">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <span className="px-5 py-2 bg-white/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md flex items-center gap-2">
                 <ShoppingBag size={14} className="animate-pulse" /> TRANSACTION ARCHIVE
               </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase italic leading-none">Purchase <span className="text-emerald-500">Ledger</span></h2>
            <p className="text-slate-400 font-bold max-w-xl text-xs md:text-sm tracking-tight opacity-70 leading-relaxed">Review and export your historical material procurement manifests and synchronized financial artifacts.</p>
         </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative group/ledger">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover/ledger:scale-110"></div>
         
         <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white sticky top-0 z-20">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Manifest ID</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Deployment Date</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 text-right">Value (USD)</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Logistics Phase</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 text-center">Settlement Status</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 text-right">Artifacts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {orders.map((o, i) => (
                   <tr key={i} className="hover:bg-slate-50 transition-all duration-300 group/row cursor-pointer">
                     <td className="px-10 py-8">
                       <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover/row:bg-emerald-500 group-hover/row:text-white transition-all duration-500 shadow-inner">
                           <ShoppingBag size={20} />
                         </div>
                         <div>
                           <p className="font-black text-slate-900 text-lg italic uppercase tracking-tight">#{o.id}</p>
                           <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">{o.items} Units Bundled</p>
                         </div>
                       </div>
                     </td>
                     <td className="px-10 py-8">
                        <p className="text-sm font-black text-slate-500 tracking-widest uppercase font-mono">{o.date}</p>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <p className="text-xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                           {o.total}
                        </p>
                     </td>
                     <td className="px-10 py-8 text-center md:text-left">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-sm flex items-center justify-center w-fit gap-2 ${
                           o.status === 'Delivered' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                           o.status === 'Cancelled' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                           'bg-slate-900 text-white shadow-slate-900/20'
                        }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${o.status === 'Delivered' ? 'bg-white' : 'bg-emerald-400 animate-pulse'}`}></div>
                           {o.status}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex justify-center">
                           {o.paid ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm transition-all group-hover/row:scale-105">
                                 <CheckCircle2 size={14} /> Full Clearance
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em]">
                                 <div className="w-2 h-2 rounded-full border-2 border-slate-300"></div> Pending Settlement
                              </div>
                           )}
                        </div>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <button className="text-slate-300 hover:text-emerald-500 transition-all p-3 rounded-2xl hover:bg-emerald-50 inline-block group/btn active:scale-95 shadow-sm border border-transparent hover:border-emerald-100 bg-white">
                           <FileText size={20} className="group-hover/btn:rotate-12 transition-transform" />
                        </button>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
