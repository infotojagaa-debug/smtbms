import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPIBox = ({ title, value, trend, positive, id }) => {
  return (
    <div className="bg-white rounded-2xl p-6 relative border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        
        {/* Trend Pill */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
          positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      
      <h3 className="text-3xl font-black text-[#2B3674] tabular-nums tracking-tight">
        {value}
      </h3>
      
      <p className="text-xs font-medium text-slate-400 mt-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
        Compared to Last Month
      </p>

      {/* Decorative vertical line similar to the Inven screenshot */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-slate-100/50 rounded-l-full"></div>
    </div>
  );
};

export default KPIBox;
