import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createMaterial, reset } from '../../redux/slices/materialSlice';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  MapPin, 
  Truck, 
  Settings,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddEditMaterial = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuccess, isLoading, isError, message } = useSelector((state) => state.material);
  const { vendors } = useSelector((state) => state.vendors);
  const [previewCode, setPreviewCode] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const watchedCode = watch('code');

  useEffect(() => {
    if (watchedCode) setPreviewCode(watchedCode);
  }, [watchedCode]);

  useEffect(() => {
    dispatch(fetchVendors({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Inventory Ledger Updated');
      navigate('/material/list');
      dispatch(reset());
    }
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(createMaterial(data));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add New Resource</h2>
          <p className="text-slate-500 font-medium">Register unique materials into the enterprise master data.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Material Identity *</label>
                    <input 
                      {...register('name', { required: true })}
                      placeholder="e.g. Industrial Steel Plate" 
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Unique SKU/Code *</label>
                    <input 
                      {...register('code', { required: true })}
                      placeholder="e.g. ST-2024-XP" 
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none transition-all font-black font-mono text-slate-900 placeholder:text-slate-300 shadow-sm"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Asset Category *</label>
                    <select 
                      {...register('category', { required: true })}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none transition-all font-bold text-slate-800 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Finished Goods">Finished Goods</option>
                      <option value="Components">Components</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Assigned Unit *</label>
                    <select 
                      {...register('unit', { required: true })}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none transition-all font-bold text-slate-800 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="ltr">Liters (ltr)</option>
                      <option value="mtr">Meters (mtr)</option>
                    </select>
                 </div>
              </div>

              <div className="pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1 flex items-center gap-2"><Settings size={14} className="text-primary-500" /> Initial Qty</label>
                    <input 
                      type="number" {...register('quantity', { required: true, min: 0 })}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-primary-500 outline-none font-black font-mono text-slate-900 shadow-sm"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1 flex items-center gap-2"><Package size={14} className="text-amber-500" /> Min Threshold</label>
                    <input 
                      type="number" {...register('minStockLevel', { required: true, min: 1 })}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-amber-500 outline-none font-black font-mono text-amber-600 shadow-sm"
                    />
                 </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1 flex items-center gap-2"><Truck size={14} className="text-emerald-500" /> Supplier</label>
                    <select 
                      {...register('supplierName')}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-800 appearance-none shadow-sm cursor-pointer truncate"
                    >
                      <option value="">Strategic Partner</option>
                      {vendors.map(v => (
                        <option key={v._id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
              </div>

              <div className="pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1 flex items-center gap-2">Department Allocation</label>
                    <select 
                      {...register('department', { required: true })}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-primary-500 outline-none font-bold text-slate-800 shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="Production">Production</option>
                      <option value="Storage">Storage</option>
                      <option value="Testing">Testing</option>
                      <option value="QC">Quality Control</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1 flex items-center gap-2"><MapPin size={14} className="text-rose-500" /> Precise Location</label>
                    <input 
                      {...register('location')}
                      placeholder="e.g. Rack B-12" 
                      className="w-full px-7 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-rose-500 outline-none font-bold text-slate-800 shadow-sm"
                    />
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 flex items-center gap-2">
                    <QrCode size={18} /> Tag Identity Preview
                 </h4>
                 <div className="h-64 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4">
                    {previewCode ? (
                      <>
                        <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black text-xs animate-pulse">
                           Auto-Generation Active
                        </div>
                        <p className="text-[10px] font-black font-mono tracking-widest text-primary-300">{previewCode}</p>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-white/30 italic">Input SKU code to initialize tag generation</p>
                    )}
                 </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                 <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-white/50 font-medium leading-relaxed">System will automatically generate high-resolution QR & Barcode tags for this resource.</p>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isLoading ? 'Writing Ledger...' : (
                  <>
                    <Save size={20} />
                    Commit Resource
                  </>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditMaterial;
