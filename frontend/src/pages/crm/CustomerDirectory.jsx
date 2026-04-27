import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, reset } from '../../redux/slices/crmSlice';
import { 
  Users, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  History, 
  TrendingUp,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDirectory = () => {
  const dispatch = useDispatch();
  const { customers, isLoading, isError, message } = useSelector((state) => state.crm);

  useEffect(() => {
    dispatch(fetchCustomers());
    if (isError) toast.error(message);
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Enterprise Client Portfolios</h2>
          <p className="text-slate-500 font-medium">Global customer directory, relationship longevity, and account health analytics.</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <div className="px-6 py-2 text-center border-r border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total</p>
              <p className="font-black text-slate-900 leading-none">{customers.length}</p>
           </div>
           <div className="px-6 py-2 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Retention</p>
              <p className="font-black text-emerald-600 leading-none">98.4%</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full md:w-96 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Locate client portfolio..." 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm font-bold"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 font-bold text-slate-500">
           {customers.map(cust => (
             <div key={cust._id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative border-b-8 border-b-slate-50 hover:border-b-primary-500">
                <div className="flex items-start justify-between mb-8">
                   <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all shadow-inner">
                      <Building2 size={28} />
                   </div>
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={10} /> Account Active
                   </div>
                </div>

                <div className="space-y-6">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{cust.company || cust.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                         Tier 1 Strategic Partner
                      </p>
                   </div>

                   <div className="pt-6 border-t border-slate-50 space-y-3">
                      <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                         <Mail size={16} className="text-slate-300 group-hover:text-primary-400" />
                         <span className="text-xs font-bold">{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                         <Phone size={16} className="text-slate-300 group-hover:text-primary-400" />
                         <span className="text-xs font-bold">{cust.phone || 'N/A'}</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50 flex items-center justify-between">
                      <div className="text-center">
                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Lifetime</p>
                         <p className="text-sm font-black text-slate-900">$12,400</p>
                      </div>
                      <div className="w-[1px] h-6 bg-slate-200"></div>
                      <div className="text-center">
                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Score</p>
                         <p className="text-sm font-black text-emerald-600">A+</p>
                      </div>
                   </div>
                </div>

                <div className="pt-8 flex items-center justify-between mt-auto">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <History size={12} className="text-primary-400" /> Last Contact: 2d ago
                   </div>
                   <button className="flex items-center gap-1.5 text-[9px] font-black uppercase text-primary-500 hover:gap-3 transition-all">
                      Access Portfolio <ChevronRight size={14} />
                   </button>
                </div>
             </div>
           ))}
           {customers.length === 0 && (
             <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30">
                <Users size={64} className="text-slate-300 mb-4" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">Directory awaiting corporate portfolio initialization.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDirectory;
