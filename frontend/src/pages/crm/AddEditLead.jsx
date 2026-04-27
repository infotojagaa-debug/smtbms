import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Target, 
  ArrowLeft, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  IndianRupee, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddEditLead = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    source: 'website',
    value: '',
    priority: 'medium',
    status: 'new',
    description: '',
    followUpDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const [custRes, matRes] = await Promise.all([
          axios.get('/api/crm/customers', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/materials', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setCustomers(custRes.data.customers || []);
        setMaterials(matRes.data.materials || []);
      } catch (err) {
        toast.error('Failed to load system data');
      }
    };
    fetchData();
  }, []);

  const handleMaterialChange = (matId) => {
    const mat = materials.find(m => m._id === matId);
    setSelectedMaterial(mat);
    if (mat && quantity) {
      const total = mat.unitPrice * quantity;
      setFormData({ ...formData, value: total });
    }
  };

  const handleQuantityChange = (qty) => {
    setQuantity(qty);
    if (selectedMaterial && qty) {
      const total = selectedMaterial.unitPrice * qty;
      setFormData({ ...formData, value: total });
    }
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const finalData = {
        ...formData,
        description: `Material: ${selectedMaterial?.name || 'N/A'}\nQuantity: ${quantity}\nUnit Price: ${selectedMaterial?.unitPrice || 0}\n\n${formData.description}`
      };
      await axios.post('/api/crm/leads', finalData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('New Inquiry Captured: Sales Sequence Initialized');
      navigate('/admin/dashboard/crm/leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to capture inquiry');
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.customerId) {
        toast.error('Identity Protocol Breach: Please provide Title and Customer.');
        return false;
      }
    }
    if (step === 2) {
      if (!selectedMaterial || !quantity || quantity <= 0) {
        toast.error('Financial Parameters Undefined: Select Material and Quantity.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { id: 1, name: 'Identity', icon: Target },
    { id: 2, name: 'Financials', icon: IndianRupee },
    { id: 3, name: 'Logistics', icon: Calendar }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center pt-8">
         <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase italic text-slate-900">Capture New Inquiry</h2>
         <p className="text-slate-500 font-medium">Provisioning a new lead into the high-density acquisition pipeline.</p>
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
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Inquiry Title / Project Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="e.g. Bulk Steel Supply for Metro Project"
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      value={formData.title}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Select Customer / Company</label>
                    <select 
                      required
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      value={formData.customerId}
                    >
                       <option value="">Choose a strategic stakeholder...</option>
                       {customers.map(c => (
                         <option key={c._id} value={c._id}>{c.name} ({c.company})</option>
                       ))}
                    </select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Source Protocol</label>
                        <select 
                          className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                          value={formData.source}
                        >
                          <option value="website">Website Source</option>
                          <option value="referral">Referral Source</option>
                          <option value="cold-call">Cold-Call Source</option>
                          <option value="social-media">Social Media</option>
                          <option value="exhibition">Exhibition/Event</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Lead Priority</label>
                        <select 
                          className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          value={formData.priority}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority (Urgent)</option>
                        </select>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {step === 2 && (
            <div className="space-y-8">
              <div className="p-8 bg-primary-50 rounded-[2.5rem] border border-primary-100 flex items-center gap-6 mb-10 text-slate-900">
                  <ShieldCheck size={32} className="text-primary-600 animate-pulse" />
                  <div className="flex flex-col">
                    <p className="text-sm font-black uppercase tracking-tight italic">Automated Price Estimation Engine Active</p>
                    <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Calculated based on registered inventory unit rates.</p>
                  </div>
               </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Select Material</label>
                    <select 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => handleMaterialChange(e.target.value)}
                    >
                       <option value="">Select Material...</option>
                       {materials.map(m => (
                         <option key={m._id} value={m._id}>{m.name} (₹{m.unitPrice}/unit)</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Quantity Required</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="e.g. 100"
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      value={quantity}
                    />
                 </div>
                 <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Estimated Total Value (INR)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        readOnly
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-3xl p-6 text-2xl font-black text-primary-600 focus:ring-0 transition-all shadow-inner"
                        value={formData.value || 0}
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-400 shadow-sm">Locked to Market Rate</div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Inquiry Description & Scope</label>
                    <textarea 
                      rows="4"
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="Detailed requirements, material specifications, etc..."
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      value={formData.description}
                    />
                 </div>
              </div>
            </div>
         )}

         {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Follow-up Deadline</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                      value={formData.followUpDate}
                    />
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
                 <ChevronLeft size={20} /> Protocol Rollback
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
                   Execute Capture <CheckCircle2 size={20} />
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AddEditLead;
