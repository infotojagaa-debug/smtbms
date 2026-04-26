import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, positive, bgClass = 'bg-white', iconColorClass = 'text-indigo-600', iconBgClass = 'bg-indigo-50', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] group ${onClick ? 'cursor-pointer hover:border-indigo-400' : 'cursor-default'} ${bgClass}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors ${iconBgClass}`}>
          <Icon size={22} className={iconColorClass} strokeWidth={2.5} />
        </div>
        
        {/* Trend Pill */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
          positive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-rose-50 text-rose-600 border border-rose-100/50'
        }`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      
      <div>
         <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
         <h3 className="text-3xl font-black text-slate-800 tracking-tight tabular-nums">
           {value}
         </h3>
      </div>
    </div>
  );
};

export default StatCard;
