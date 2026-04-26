import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterials, sendManualAlert, reset } from '../../redux/slices/materialSlice';
import { 
  AlertTriangle, 
  Mail, 
  CheckCircle2, 
  Package, 
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LowStockAlerts = () => {
  const dispatch = useDispatch();
  const { materials, isLoading, isError, message } = useSelector((state) => state.material);

  useEffect(() => {
    dispatch(fetchMaterials({ stockStatus: 'low' }));
    if (isError) toast.error(message);
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  const handleSendEmail = (id) => {
    dispatch(sendManualAlert(id));
    toast.success('Alert email sent to administration');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Critical Inventory Alerts</h2>
          <p className="text-slate-500 font-medium">Manage and acknowledge stock shortages across departments.</p>
        </div>
        <button 
          onClick={() => dispatch(fetchMaterials({ stockStatus: 'low' }))}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400"
          title="Refresh Alerts"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-xs italic">Scanning system for shortages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {materials.map(material => {
             const isOutOfStock = material.quantity === 0;
             return (
               <div key={material._id} className={`group relative bg-white rounded-[3rem] p-10 border transition-all hover:shadow-2xl hover:shadow-slate-200 ${
                 isOutOfStock ? 'border-red-100 shadow-red-50' : 'border-amber-100 shadow-amber-50'
               }`}>
                  <div className={`absolute top-0 right-10 px-6 py-2 rounded-b-2xl font-black text-[10px] uppercase tracking-[0.2em] transform -translate-y-px ${
                    isOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'
                  }`}>
                    {isOutOfStock ? 'Critical: Out of Stock' : 'Low Stock Warning'}
                  </div>

                  <div className="flex flex-col h-full">
                     <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          isOutOfStock ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                        }`}>
                           <Package size={28} />
                        </div>
                        <div>
                           <h3 className="font-black text-slate-800 leading-tight group-hover:text-primary-600 transition-colors uppercase">{material.name}</h3>
                           <p className="text-[10px] font-bold text-slate-400 tracking-widest">{material.code}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Current</p>
                           <p className={`text-2xl font-black font-mono ${isOutOfStock ? 'text-red-600' : 'text-slate-900'}`}>{material.quantity}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Minimum</p>
                           <p className="text-2xl font-black font-mono text-slate-500 italic">{material.minStockLevel}</p>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                           <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}`}></div>
                           {material.department}
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleSendEmail(material._id)}
                             className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-100 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm"
                             title="Manual Email Alert"
                           >
                              <Mail size={18} />
                           </button>
                           <Link 
                             to={`/material/${material._id}`}
                             className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/10"
                             title="Manage Ledger"
                           >
                              <ArrowRight size={18} />
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
             );
           })}
           {materials.length === 0 && (
             <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30">
                <CheckCircle2 size={80} className="text-emerald-500 mb-6" />
                <p className="font-black uppercase tracking-[0.4em] text-slate-900">All Levels Optimized</p>
                <p className="text-xs font-bold mt-2">No material shortages detected in the system.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
