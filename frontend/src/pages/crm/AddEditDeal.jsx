import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Briefcase, 
  ArrowLeft, 
  User, 
  Building2, 
  IndianRupee, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  TrendingUp,
  Trash,
  Package,
  Plus,
  X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddEditDeal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    leadId: '',
    value: '',
    stage: 'prospecting',
    priority: 'medium',
    description: '',
    expectedCloseDate: '',
    products: []
  });
  const [materials, setMaterials] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({ name: '', email: '', phone: '', company: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const [custRes, leadRes, matRes] = await Promise.all([
          axios.get('/api/crm/customers', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/crm/leads', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/materials', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setCustomers(custRes.data.customers || []);
        setMaterials(matRes.data.materials || []);
        const filteredLeads = leadRes.data.filter(l => l.status === 'won' || l.status === 'qualified') || [];
        setLeads(filteredLeads);

        // Check if leadId is in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const leadIdParam = urlParams.get('leadId');
        if (leadIdParam && !isEdit) {
          const lead = filteredLeads.find(l => l._id === leadIdParam);
          if (lead) {
            setFormData(prev => ({
              ...prev,
              leadId: lead._id,
              title: `Deal: ${lead.title}`,
              customerId: lead.customerId?._id || lead.customerId,
              value: lead.value,
              description: lead.description
            }));
          }
        }

        // If in Edit Mode, fetch the deal data
        if (isEdit) {
          const dealRes = await axios.get(`/api/crm/deals/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
          const deal = dealRes.data;
          setFormData({
            title: deal.title || '',
            customerId: deal.customerId?._id || deal.customerId || '',
            leadId: deal.leadId?._id || deal.leadId || '',
            value: deal.value || '',
            stage: deal.stage || 'prospecting',
            priority: deal.priority || 'medium',
            description: deal.description || '',
            expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
            products: deal.products || []
          });
        }
      } catch (err) {
        toast.error('Failed to load system data');
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleLeadSelect = (leadId) => {
    const lead = leads.find(l => l._id === leadId);
    if (lead) {
      setFormData({
        ...formData,
        leadId: lead._id,
        title: `Deal: ${lead.title}`,
        customerId: lead.customerId?._id || lead.customerId,
        value: lead.value,
        description: lead.description
      });
    }
  };
  const addProduct = (materialId) => {
    const mat = materials.find(m => m._id === materialId);
    if (!mat) return;
    
    // Check if already added
    if (formData.products.some(p => p.materialId === materialId)) {
      toast.error('Item already in matrix.');
      return;
    }

    const newProduct = {
      materialId: mat._id,
      name: mat.name,
      quantity: 1,
      price: mat.price || 0
    };
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      value: (Number(prev.value) || 0) + (newProduct.price * newProduct.quantity)
    }));
  };

  const updateProductQuantity = (idx, q) => {
    const updated = [...formData.products];
    updated[idx].quantity = Number(q);
    
    // Recalculate total value
    const newValue = updated.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    
    setFormData({ ...formData, products: updated, value: newValue });
  };

  const removeProduct = (idx) => {
    const updated = formData.products.filter((_, i) => i !== idx);
    const newValue = updated.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    setFormData({ ...formData, products: updated, value: newValue });
  };

  const handleQuickAddCustomer = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.post('/api/crm/customers', quickCustomer, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const newCust = res.data;
      setCustomers(prev => [newCust, ...prev]);
      setFormData(prev => ({ ...prev, customerId: newCust._id }));
      setShowQuickAdd(false);
      setQuickCustomer({ name: '', email: '', phone: '', company: '' });
      toast.success('Strategic Partner Registered Successfully');
    } catch (err) {
      toast.error('Failed to register partner quickly');
    }
  };
  const validateStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.customerId) {
        toast.error('Strategic Identification Failure: Provide Title and Stakeholder.');
        return false;
      }
    }
    if (step === 2) {
      if (formData.value < 0) { // Allow 0, but not negative
        toast.error('Financial Valuation Required: Magnitude cannot be negative.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      // Sanitize leadId: if empty, set to undefined so it doesn't fail backend validation
      const submissionData = { ...formData };
      if (!submissionData.leadId) delete submissionData.leadId;
      
      if (isEdit) {
        await axios.put(`/api/crm/deals/${id}`, submissionData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Strategic Matrix Re-synchronized: Deal Updated');
      } else {
        await axios.post('/api/crm/deals', submissionData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Deal Initialized: Pipeline Matrix Updated');
      }
      navigate('/admin/dashboard/crm/deals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deal Initialization Failure');
    }
  };

  const steps = [
    { id: 1, name: 'Portfolio', icon: Briefcase },
    { id: 2, name: 'Financials', icon: IndianRupee },
    { id: 3, name: 'Lifecycle', icon: Calendar }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center pt-8">
         <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{isEdit ? 'Modify Strategic Deal' : 'Initialize Strategic Deal'}</h2>
         <p className="text-slate-500 font-medium">{isEdit ? 'Re-adjusting portfolio parameters for current engagement.' : 'Provisioning a high-value contract into the organizational revenue pipeline.'}</p>
      </div>

      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
         </div>
         {steps.map(s => (
           <div key={s.id} className="flex flex-col items-center gap-3 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                step >= s.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 text-slate-400 opacity-50'
              }`}>
                 <s.icon size={26} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary-600' : 'text-slate-400'}`}>{s.name}</p>
           </div>
         ))}
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500 text-slate-900">
         {step === 1 && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Convert From Existing Inquiry (Optional)</label>
                    <div className="relative">
                       <select 
                         className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm appearance-none cursor-pointer"
                         onChange={(e) => handleLeadSelect(e.target.value)}
                         value={formData.leadId}
                       >
                          <option value="">Start from fresh deal...</option>
                          {leads.map(l => (
                            <option key={l._id} value={l._id}>{l.title} (Value: ₹{l.value?.toLocaleString()})</option>
                          ))}
                       </select>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30"><Briefcase size={18} /></div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Deal Title / Contract Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white border-2 border-slate-100 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="e.g. Annual Material Procurement Agreement"
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      value={formData.title}
                    />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center ml-4 pr-4">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Associated Stakeholder</label>
                       <button 
                         onClick={() => setShowQuickAdd(true)}
                         className="text-[9px] font-black text-primary-600 uppercase tracking-tighter hover:underline"
                       >
                          + Quick Add New
                       </button>
                    </div>
                    <div className="relative">
                       <select 
                         required
                         className="w-full bg-white border-2 border-slate-100 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm appearance-none cursor-pointer"
                         onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                         value={formData.customerId}
                       >
                          <option value="">Select established customer...</option>
                          {customers.map(c => (
                            <option key={c._id} value={c._id}>{c.name} ({c.company})</option>
                          ))}
                       </select>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30"><User size={18} /></div>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Projected Deal Magnitude (INR)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="e.g. 1500000"
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      value={formData.value}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Pipeline Phase / Stage</label>
                    <select 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, stage: e.target.value})}
                      value={formData.stage}
                    >
                      <option value="prospecting">Prospecting Phase</option>
                      <option value="qualification">Qualification Status</option>
                      <option value="proposal">Proposal/Quote Sent</option>
                      <option value="negotiation">Contract Negotiation</option>
                    </select>
                 </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Strategic Description & Scope</label>
                    <textarea 
                      rows="3"
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="Objectives, deliverables, terms..."
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      value={formData.description}
                    />
                  </div>

                  {/* Inventory / Product Selection */}
                  <div className="md:col-span-2 space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center px-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Inventory & Product Matrix</h4>
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg uppercase tracking-tighter">Live Registry Enabled</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Select Material to Add</label>
                          <select 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold"
                            onChange={(e) => {
                              if (e.target.value) {
                                addProduct(e.target.value);
                                e.target.value = "";
                              }
                            }}
                          >
                             <option value="">Search material database...</option>
                             {materials.map(m => (
                               <option key={m._id} value={m._id} disabled={m.quantity <= 0}>
                                 {m.name} (In Stock: {m.quantity}) - ₹{m.price || 0}
                               </option>
                             ))}
                          </select>
                       </div>
                       
                       <div className="space-y-4">
                          {formData.products.map((prod, idx) => (
                            <div key={prod.materialId} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-right-4">
                               <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                  <Package size={18} />
                               </div>
                               <div className="flex-1">
                                  <p className="text-[10px] font-black text-slate-900 uppercase italic truncate">{prod.name}</p>
                                  <p className="text-[8px] font-bold text-slate-400">Unit Price: ₹{prod.price}</p>
                               </div>
                               <div className="w-20">
                                  <input 
                                    type="number"
                                    min="1"
                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px] font-black text-center"
                                    value={prod.quantity}
                                    onChange={(e) => updateProductQuantity(idx, e.target.value)}
                                  />
                               </div>
                               <button 
                                 onClick={() => removeProduct(idx)}
                                 className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                               >
                                  <Trash size={16} />
                               </button>
                            </div>
                          ))}
                          {formData.products.length === 0 && (
                            <div className="h-24 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                               No items selected for this engagement
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
              </div>
            </div>
         )}

         {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Target Closure Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                      value={formData.expectedCloseDate}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Execution Priority</label>
                    <select 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      value={formData.priority}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Strategic Priority</option>
                    </select>
                 </div>
              </div>
            </div>
         )}

         <div className="flex justify-between pt-10 border-t border-slate-50">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center gap-2 px-8 py-5 text-slate-500 font-extrabold uppercase tracking-widest text-[11px] hover:text-slate-900 transition-all"
              >
                 <ChevronLeft size={20} /> Matrix Rollback
              </button>
            )}
            <div className="ml-auto flex gap-4">
               {step < 3 ? (
                 <button 
                   onClick={nextStep}
                   className="flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                 >
                   Advance Sequence <ChevronRight size={20} />
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   className="flex items-center gap-2 px-10 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all active:scale-95"
                 >
                   Execute Authorization <CheckCircle2 size={20} />
                 </button>
               )}
            </div>
         </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Quick Partner Registration</h3>
                    <button onClick={() => setShowQuickAdd(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                 </div>
                 
                 <div className="space-y-4">
                    <input 
                      placeholder="Stakeholder Name" 
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none transition-all"
                      value={quickCustomer.name}
                      onChange={(e) => setQuickCustomer({...quickCustomer, name: e.target.value})}
                    />
                    <input 
                      placeholder="Email Address" 
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none transition-all"
                      value={quickCustomer.email}
                      onChange={(e) => setQuickCustomer({...quickCustomer, email: e.target.value})}
                    />
                    <input 
                      placeholder="Contact Number" 
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none transition-all"
                      value={quickCustomer.phone}
                      onChange={(e) => setQuickCustomer({...quickCustomer, phone: e.target.value})}
                    />
                    <input 
                      placeholder="Company / Organization" 
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none transition-all"
                      value={quickCustomer.company}
                      onChange={(e) => setQuickCustomer({...quickCustomer, company: e.target.value})}
                    />
                 </div>

                 <button 
                   onClick={handleQuickAddCustomer}
                   className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary-600 transition-all shadow-xl"
                 >
                    Register & Link Partner
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AddEditDeal;
