import { Settings, Wrench } from 'lucide-react';

const AdminPlaceholder = ({ title, description }) => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] animate-fade-in mx-4 my-4">
      <div className="relative">
        <div className="w-24 h-24 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-6">
          <Settings size={40} className="text-[#2B3674] animate-[spin_4s_linear_infinite]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#4318FF] rounded-full flex items-center justify-center border-4 border-white shadow-sm">
          <Wrench size={18} className="text-white" />
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-[#2B3674] mb-2 tracking-tight">{title} Module</h2>
      <p className="text-slate-500 font-medium max-w-md text-center leading-relaxed">
        {description || `The ${title} management interface is currently undergoing active construction or integration.`}
      </p>
      
      <div className="mt-8 flex gap-3">
        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Sub-System Isolated
        </span>
      </div>
    </div>
  );
};

export default AdminPlaceholder;
