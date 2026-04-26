import { useEffect, useState } from 'react';
import { 
  Activity, 
  Package, 
  Users, 
  Briefcase, 
  Target, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Filter
} from 'lucide-react';

const ActivityFeed = ({ activities = [], maxHeight = 'h-[600px]' }) => {
  const [filter, setFilter] = useState('all');

  const getModuleIcon = (mod) => {
    switch(mod) {
      case 'material': return <Package size={14} className="text-blue-500" />;
      case 'hrms': return <Users size={14} className="text-emerald-500" />;
      case 'erp': return <Briefcase size={14} className="text-amber-500" />;
      case 'crm': return <Target size={14} className="text-purple-500" />;
      default: return <ShieldCheck size={14} className="text-slate-400" />;
    }
  };

  const filtered = activities.filter(a => filter === 'all' || a.module === filter);

  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-10 flex flex-col ${maxHeight}`}>
      <div className="flex justify-between items-center shrink-0">
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900 border-l-4 border-primary-600 pl-4">
           <Activity size={18} className="text-primary-600" /> Operational Protocol Stream
        </h4>
        <div className="flex items-center gap-3">
           <Filter size={14} className="text-slate-300" />
           <select 
             className="bg-transparent border-none outline-none text-[8px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           >
              <option value="all">Global Matrix</option>
              <option value="material">Material Flux</option>
              <option value="hrms">Workforce Node</option>
              <option value="erp">Fiscal Stream</option>
              <option value="crm">Stakeholder Interaction</option>
           </select>
        </div>
      </div>

      <div className="overflow-y-auto scroller-hide flex-1 space-y-8 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-50"></div>
        
        {filtered.map((log, i) => (
          <div key={i} className="flex gap-6 group relative">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 relative z-10 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                {getModuleIcon(log.module)}
             </div>
             
             <div className="space-y-2 flex-1 pt-1">
                <div className="flex justify-between items-start">
                   <p className="text-[11px] font-black text-slate-900 uppercase italic leading-none group-hover:text-primary-600 transition-all">{log.description}</p>
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <div className="flex items-center gap-3">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Executor: <span className="text-slate-900">{log.userName || log.userId?.name}</span></p>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <p className="text-[9px] font-black text-slate-400 tracking-tighter uppercase">{log.module} node</p>
                </div>
                <div className="hidden group-hover:flex items-center gap-2 pt-2 animate-in slide-in-from-left-2">
                   <button className="text-[8px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1 group/btn">
                      Artifact Details <ChevronRight size={10} className="group-hover/btn:translate-x-1 transition-all" />
                   </button>
                </div>
             </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
             <Activity size={40} />
             <p className="text-[8px] font-black uppercase tracking-widest">Awaiting System Protocols</p>
          </div>
        )}
      </div>
      
      <div className="pt-6 border-t border-slate-50 shrink-0">
         <button className="w-full py-4 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
            Enter Audit Ledger Matrix
         </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
