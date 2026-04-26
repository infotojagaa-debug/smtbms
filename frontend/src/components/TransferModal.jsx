import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { transferMaterial, reset } from '../redux/slices/materialSlice';
import { X, ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TransferModal = ({ material, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isSuccess, isLoading } = useSelector((state) => state.material);
  
  const [formData, setFormData] = useState({
    toDepartment: '',
    quantity: 1,
    reason: ''
  });

  useEffect(() => {
    if (isSuccess && isOpen) {
      toast.success('Movement Logged');
      onClose();
      dispatch(reset());
    }
  }, [isSuccess, isOpen, onClose, dispatch]);

  if (!isOpen || !material) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.quantity > material.quantity) {
      return toast.error('Insufficient available balance');
    }
    dispatch(transferMaterial({
      materialId: material._id,
      fromDepartment: material.department,
      toDepartment: formData.toDepartment,
      quantity: formData.quantity,
      reason: formData.reason
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
         <div className="p-10 space-y-8">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <ArrowRightLeft className="text-primary-500" /> Stock Redistribution
                  </h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Movement Protocol for {material.code}</p>
               </div>
               <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                  <X size={20} />
               </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Source Unit</p>
                  <p className="font-bold text-slate-900">{material.department}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 font-bold">VS</div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Available Balanced</p>
                  <p className="font-black text-slate-900">{material.quantity} {material.unit}</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Target Department</label>
                  <select 
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                    value={formData.toDepartment}
                    onChange={(e) => setFormData({...formData, toDepartment: e.target.value})}
                  >
                     <option value="">-- Choose Destination --</option>
                     <option value="Production">Production</option>
                     <option value="Storage">Storage</option>
                     <option value="Testing">Testing</option>
                     <option value="QC">Quality Control</option>
                  </select>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Transfer Quantity</label>
                     <input 
                       required type="number" min="1" max={material.quantity}
                       className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-black font-mono"
                       value={formData.quantity}
                       onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                     />
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                     <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                     <p className="text-[10px] text-emerald-800 font-bold leading-tight uppercase">Validation Passed: Quantity Available</p>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Movement Justification</label>
                  <textarea 
                    required
                    placeholder="Provide a valid reason for this transfer..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all h-24 resize-none"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  ></textarea>
               </div>

               <button 
                 type="submit"
                 disabled={isLoading}
                 className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                  {isLoading ? 'Executing Protocol...' : (
                    <>
                      <ArrowRightLeft size={18} />
                      Authorize Movement
                    </>
                  )}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default TransferModal;
