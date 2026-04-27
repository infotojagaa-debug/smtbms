import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { createPO } from '../../redux/slices/purchaseOrderSlice';
import { fetchMaterials } from '../../redux/slices/materialSlice';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Save, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  IndianRupee,
  Package,
  Search,
  X,
  PlusCircle,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePurchaseOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendors } = useSelector(state => state.vendors);
  const { materials } = useSelector(state => state.material);

  const [formData, setFormData] = useState({
    vendorId: '',
    items: [{ materialId: '', itemName: '', quantity: 1, unit: 'kg', unitPrice: 0, totalPrice: 0 }],
    taxPercentage: 18,
    shippingCharges: 0,
    expectedDeliveryDate: '',
    deliveryAddress: '',
    terms: '',
    notes: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMat, setNewMat] = useState({ name: '', unit: 'pcs', minStockLevel: 0, quantity: 0, category: 'General' });
  const [activeSelectIdx, setActiveSelectIdx] = useState(null);
  const [showSelect, setShowSelect] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchMaterials());
  }, [dispatch]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialId: '', itemName: '', quantity: 1, unit: 'kg', unitPrice: 0, totalPrice: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'materialId') {
       const mat = materials.find(m => m._id === value);
       newItems[index].materialId = value;
       newItems[index].itemName = mat?.name || '';
       newItems[index].unit = mat?.unit || 'kg';
    } else {
       newItems[index][field] = value;
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
       newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData({ ...formData, items: newItems });
  };

  const subtotal = formData.items.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = (subtotal * formData.taxPercentage) / 100;
  const totalAmount = subtotal + taxAmount + Number(formData.shippingCharges);

  const handleSubmit = async (status = 'draft') => {
    if (!formData.vendorId) return toast.error('Vendor allocation required.');
    if (formData.items.some(item => !item.materialId)) return toast.error('All line items must have a designated resource.');
    
    const res = await dispatch(createPO({ ...formData, subtotal, taxAmount, totalAmount, status }));
    if (res.error) {
       toast.error(res.payload);
    } else {
       toast.success(`Purchase Order ${status === 'draft' ? 'Drafted' : 'Submitted'} successfully.`);
       navigate('/erp/orders');
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      // Auto-generate a unique SKU code if not provided
      const autoCode = `MAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      const payload = {
        ...newMat,
        code: autoCode,
        quantity: Number(newMat.quantity) || 0,
        department: 'Operations', // Default department for manager-added resources
        category: newMat.category || 'General'
      };

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Resource provisioned successfully.');
        dispatch(fetchMaterials());
        setIsModalOpen(false);
        setNewMat({ name: '', unit: 'pcs', minStockLevel: 0, quantity: 0, category: 'General' }); // Reset
        if (activeSelectIdx !== null) {
          handleItemChange(activeSelectIdx, 'materialId', data._id);
        }
      } else {
        toast.error(data.message || 'Validation failed');
      }
    } catch (err) {
      toast.error('Material creation failed.');
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase italic">Generate Acquisition Order</h2>
            <p className="text-slate-500 font-medium">Initialize a high-fidelity procurement sequence for organizational resources.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Supplier Identity</label>
                     <select 
                        className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                        onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                        value={formData.vendorId}
                     >
                        <option value="">Select Primary Vendor</option>
                        {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.vendorId})</option>)}
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Expected Cargo Arrival</label>
                     <div className="relative">
                        <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                           type="date" 
                           className="w-full bg-slate-50 border-none rounded-3xl p-5 pl-16 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                           onChange={(e) => setFormData({...formData, expectedDeliveryDate: e.target.value})}
                           value={formData.expectedDeliveryDate}
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex justify-between items-center px-4">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic flex items-center gap-2">
                        <Package size={16} className="text-primary-500" /> Acquisition Items
                     </h4>
                     <button 
                        onClick={handleAddItem}
                        className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all active:scale-95"
                     >
                        <Plus size={14} /> Add Row
                     </button>
                  </div>

                  <div className="overflow-x-auto scroller-hide">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-slate-50">
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resource Selector</th>
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Unit Price (₹)</th>
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Yield (₹)</th>
                              <th className="py-4 w-12 text-center"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {formData.items.map((item, idx) => (
                             <tr key={idx} className="group">
                                <td className="py-6 min-w-[240px] relative">
                                    <div className="relative">
                                       <button 
                                          type="button"
                                          onClick={() => {
                                             setShowSelect(showSelect === idx ? null : idx);
                                             setSearchQuery('');
                                          }}
                                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-left flex justify-between items-center group-hover:bg-slate-100 transition-all"
                                       >
                                          <span className={item.materialId ? 'text-slate-900' : 'text-slate-400'}>
                                             {item.materialId ? materials.find(m => m._id === item.materialId)?.name : 'Select Resource'}
                                          </span>
                                          <ChevronRight size={14} className={`text-slate-400 transition-transform ${showSelect === idx ? 'rotate-90' : ''}`} />
                                       </button>

                                       {showSelect === idx && (
                                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-300">
                                             <div className="relative mb-3">
                                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input 
                                                   autoFocus
                                                   type="text"
                                                   placeholder="Search resources..."
                                                   className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 pl-10 text-[10px] font-bold focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                                   value={searchQuery}
                                                   onChange={(e) => setSearchQuery(e.target.value)}
                                                   onClick={(e) => e.stopPropagation()}
                                                />
                                             </div>
                                             <div className="max-h-48 overflow-y-auto scroller-dark scroller-thin space-y-1">
                                                {filteredMaterials.map(m => (
                                                   <button
                                                      key={m._id}
                                                      type="button"
                                                      onClick={() => {
                                                         handleItemChange(idx, 'materialId', m._id);
                                                         setShowSelect(null);
                                                      }}
                                                      className="w-full text-left px-5 py-4 rounded-2xl hover:bg-slate-50 transition-all flex justify-between items-center group/item border border-transparent hover:border-slate-100 mb-1"
                                                   >
                                                      <div className="flex flex-col gap-1">
                                                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover/item:text-primary-600">{m.name}</span>
                                                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{m.category || 'General'}</span>
                                                      </div>
                                                      <span className="text-[8px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-400 group-hover/item:bg-primary-50 group-hover/item:text-primary-500 uppercase">{m.unit}</span>
                                                   </button>
                                                ))}
                                                {filteredMaterials.length === 0 && (
                                                   <p className="text-center py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">No results found</p>
                                                )}
                                             </div>
                                             <button 
                                                type="button"
                                                onClick={() => {
                                                   setActiveSelectIdx(idx);
                                                   setIsModalOpen(true);
                                                   setShowSelect(null);
                                                }}
                                                className="w-full mt-3 p-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 transition-all"
                                             >
                                                <PlusCircle size={14} /> Add New Resource
                                             </button>
                                          </div>
                                       )}
                                    </div>
                                 </td>
                                <td className="py-6 px-4">
                                   <input 
                                      type="number" 
                                      className="w-20 bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-center mx-auto block"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                   />
                                </td>
                                <td className="py-6 px-4">
                                   <input 
                                      type="number" 
                                      className="w-24 bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-center mx-auto block"
                                      value={item.unitPrice}
                                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                   />
                                </td>
                                <td className="py-6 text-right">
                                   <p className="text-xs font-black text-slate-900 italic">₹{item.totalPrice.toLocaleString()}</p>
                                </td>
                                <td className="py-6 pl-4">
                                   <button 
                                      onClick={() => handleRemoveItem(idx)}
                                      className="p-3 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-20 blur-3xl"></div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 relative z-10 italic">Fiscal Summary</h4>
               
               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center font-black uppercase tracking-widest text-[10px]">
                     <span className="text-white/40">Subtotal Yield</span>
                     <span className="italic">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-black uppercase tracking-widest text-[10px]">
                     <span className="text-white/40">Statutory Tax ({formData.taxPercentage}%)</span>
                     <span className="text-red-400">₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-black uppercase tracking-widest text-[10px]">
                     <span className="text-white/40">Shipping Charges</span>
                     <input 
                        type="number" 
                        className="bg-white/5 border border-white/10 rounded-lg w-24 text-right px-3 py-1 text-xs"
                        value={formData.shippingCharges}
                        onChange={(e) => setFormData({...formData, shippingCharges: e.target.value})}
                     />
                  </div>
                  <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] leading-none mb-2">Final Settlement</p>
                        <h3 className="text-4xl font-black italic tracking-tighter">₹{totalAmount.toLocaleString()}</h3>
                     </div>
                     <ShoppingBag size={40} className="text-primary-600 opacity-30" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                  onClick={() => handleSubmit('draft')}
                  className="py-5 bg-white border border-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                  <Save size={16} /> Save Draft
               </button>
               <button 
                  onClick={() => handleSubmit('sent')}
                  className="py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  Authorize <Send size={16} />
               </button>
            </div>
         </div>
      </div>

      <ResourceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateMaterial}
        newMat={newMat}
        setNewMat={setNewMat}
      />
    </div>
  );
};

// --- NEW RESOURCE MODAL COMPONENT ---
const ResourceModal = ({ isOpen, onClose, onSave, newMat, setNewMat }) => {
   if (!isOpen) return null;
   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
         <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-10 text-white relative">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600 opacity-20 blur-3xl"></div>
               <button onClick={onClose} className="absolute top-10 right-10 text-white/50 hover:text-white transition-all"><X size={24} /></button>
               
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg"><Database size={20} /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight">Provision Resource</h3>
               </div>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Initialize New Inventory Node</p>
            </div>

            <form onSubmit={onSave} className="p-12 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Resource Nomenclature</label>
                  <input 
                     required
                     type="text" 
                     placeholder="e.g. Industrial Iron Rods"
                     className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500"
                     value={newMat.name}
                     onChange={(e) => setNewMat({...newMat, name: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Unit Specification</label>
                     <select 
                        className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500"
                        value={newMat.unit}
                        onChange={(e) => setNewMat({...newMat, unit: e.target.value})}
                     >
                        {['pcs', 'kg', 'm', 'l', 'ton', 'sqft'].map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Resource Category</label>
                     <select 
                        className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500"
                        value={newMat.category}
                        onChange={(e) => setNewMat({...newMat, category: e.target.value})}
                     >
                        {['General', 'Hardware', 'Electrical', 'Raw Material', 'Consumables'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Minimum Threshold</label>
                     <input 
                        type="number" 
                        className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500"
                        value={newMat.minStockLevel}
                        onChange={(e) => setNewMat({...newMat, minStockLevel: e.target.value})}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Initial Stock Quantity</label>
                     <input 
                        type="number" 
                        className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500"
                        value={newMat.quantity}
                        onChange={(e) => setNewMat({...newMat, quantity: e.target.value})}
                     />
                  </div>
               </div>

               <button 
                  type="submit"
                  className="w-full py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                  Authorize Resource <PlusCircle size={20} />
               </button>
            </form>
         </div>
      </div>
   );
};

export default CreatePurchaseOrder;
