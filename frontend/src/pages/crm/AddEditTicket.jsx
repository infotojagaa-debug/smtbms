import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket as TicketIcon, 
  ArrowLeft, 
  User, 
  Tag, 
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Layout,
  IndianRupee
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddEditTicket = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    customerId: '',
    category: 'general',
    priority: 'medium',
    description: '',
    source: 'internal'
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const res = await axios.get('/api/crm/customers', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCustomers(res.data.customers || []);
      } catch (err) {
        toast.error('Stakeholder Data Sync Error');
      }
    };
    fetchCustomers();
  }, []);

  const validateStep = () => {
    if (step === 1) {
      if (!formData.subject || !formData.customerId) {
        toast.error('Identity Protocol Violation: Subject and Stakeholder Required.');
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
      await axios.post('/api/crm/tickets', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Support Case Initialized: Resolution Protocol Active');
      navigate('/admin/dashboard/crm/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Support Initialization Failure');
    }
  };

  const steps = [
    { id: 1, name: 'Classification', icon: TicketIcon },
    { id: 2, name: 'Diagnostics', icon: MessageSquare }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center pt-8 text-slate-900">
         <h2 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase italic">Initialize Support Case</h2>
         <p className="text-slate-500 font-medium italic">Provisioning a new customer help request into the help desk resolution pipeline.</p>
      </div>

      <div className="flex justify-center items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
         <div className="flex gap-10">
           {steps.map(s => (
             <div key={s.id} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  step >= s.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'bg-slate-100 text-slate-400 opacity-50'
                }`}>
                   <s.icon size={26} />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.name}</p>
             </div>
           ))}
         </div>
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500 text-slate-900">
         {step === 1 && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Subject / Issue Summary</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                      placeholder="e.g. Delayed Material Delivery in Zone A"
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      value={formData.subject}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Select Affected Customer</label>
                    <select 
                      required
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      value={formData.customerId}
                    >
                       <option value="">Select stakeholder...</option>
                       {customers.map(c => (
                         <option key={c._id} value={c._id}>{c.name} ({c.company})</option>
                       ))}
                    </select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Priority Level</label>
                        <select 
                          className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          value={formData.priority}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="critical">Critical (Immediate Action)</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Support Category</label>
                        <select 
                          className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          value={formData.category}
                        >
                          <option value="general">General Support</option>
                          <option value="billing">Billing/Accounts</option>
                          <option value="delivery">Delivery/Logistics</option>
                          <option value="technical">Technical Support</option>
                        </select>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {step === 2 && (
            <div className="space-y-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 mb-10">
                  <AlertCircle size={32} className="text-slate-900 animate-pulse" />
                  <div className="flex flex-col">
                    <p className="text-xs font-black uppercase tracking-tight italic">Case Diagnostic Parameters</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail the issue for accurate resolution mapping.</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Issue Diagnostics / Description</label>
                  <textarea 
                    rows="6"
                    className="w-full bg-white border-2 border-slate-200 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                    placeholder="Provide full context of the support request..."
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    value={formData.description}
                  />
               </div>
            </div>
         )}

         <div className="flex justify-between pt-10 border-t border-slate-50">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center gap-2 px-8 py-5 text-slate-400 font-extrabold uppercase tracking-widest text-[11px] hover:text-slate-900 transition-all"
              >
                 <ChevronLeft size={20} /> Matrix Rollback
              </button>
            )}
            <div className="ml-auto flex gap-4">
               {step < 2 ? (
                 <button 
                   onClick={nextStep}
                   className="flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                 >
                   Advance Sequence <ChevronRight size={20} />
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   className="flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                 >
                   Initialize Authorization <CheckCircle2 size={20} />
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AddEditTicket;
