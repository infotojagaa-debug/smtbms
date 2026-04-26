import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors, createOrder, reset } from '../../redux/slices/erpSlice';
import { fetchMaterials } from '../../redux/slices/materialSlice';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ShoppingBag, 
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendors, isSuccess, isError, message, isLoading } = useSelector((state) => state.erp);
  const { materials } = useSelector((state) => state.material);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      items: [{ material: '', quantity: 1, unitPrice: 0, total: 0 }],
      totalAmount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Purchase Order created');
      navigate('/erp/orders');
      dispatch(reset());
    }
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, navigate, dispatch]);

  // Handle total amount calculation
  useEffect(() => {
    const total = watchedItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    setValue('totalAmount', total);
  }, [watchedItems, setValue]);

  const updateItemTotal = (index) => {
    const qty = watchedItems[index].quantity;
    const price = watchedItems[index].unitPrice;
    setValue(`items.${index}.total`, (qty * price).toFixed(2));
  };

  const onSubmit = (data) => {
    const orderData = {
      ...data,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
    };
    dispatch(createOrder(orderData));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Purchase Order</h2>
          <p className="text-slate-500 font-medium">Request materials from your registered suppliers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-10">
               <div>
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs text-slate-400 mb-6 flex items-center gap-2">
                    <ShoppingBag size={14} className="text-primary-500" />
                    Order Particulars
                  </h3>
                  
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 relative group transition-all">
                        {fields.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                           <div className="lg:col-span-2 space-y-2">
                              <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Material</label>
                              <select 
                                {...register(`items.${index}.material`, { required: true })}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white font-bold text-sm"
                              >
                                 <option value="">-- Choose Item --</option>
                                 {materials.map(m => (
                                   <option key={m._id} value={m._id}>{m.name}</option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Quantity</label>
                              <input 
                                type="number"
                                {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                                onChange={() => updateItemTotal(index)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Unit Price</label>
                              <div className="relative">
                                 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                 <input 
                                   type="number" step="0.01"
                                   {...register(`items.${index}.unitPrice`, { required: true })}
                                   onChange={() => updateItemTotal(index)}
                                   className="w-full pl-10 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white font-bold"
                                 />
                              </div>
                           </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100 flex items-center gap-2">
                           <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Item Line Total:</span>
                           <span className="text-lg font-black text-slate-900 font-mono tracking-tighter">${watchedItems[index]?.total || '0.00'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={() => append({ material: '', quantity: 1, unitPrice: 0, total: 0 })}
                    className="mt-8 w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <Plus size={18} />
                    Add Purchase Line
                  </button>
               </div>
            </div>
          </div>

          {/* Sidebar / Summary Area */}
          <div className="space-y-8">
             <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl space-y-8 sticky top-32">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-400 mb-6">Order Checkout</h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Vendor *</label>
                         <select 
                           {...register('vendor', { required: true })}
                           className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                         >
                            <option value="">-- Choose Vendor --</option>
                            {vendors.map(v => (
                              <option key={v._id} value={v._id}>{v.name}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Expected Delivery</label>
                         <input 
                           type="date"
                           {...register('expectedDelivery')}
                           className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Payable</p>
                      <h4 className="text-4xl font-black text-white font-mono tracking-tighter decoration-4 decoration-primary-500 underline underline-offset-8">
                        ${Number(watch('totalAmount')).toLocaleString()}
                      </h4>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                   {isLoading ? 'Processing...' : (
                     <>
                       <Save size={20} />
                       Finalize order
                     </>
                   )}
                </button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
