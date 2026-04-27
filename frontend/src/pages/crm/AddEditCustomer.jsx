import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  Globe,
  Camera
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddEditCustomer = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', alternatePhone: '',
    company: '', designation: '', 
    industry: 'IT', customerType: 'corporate', source: 'website',
    address: { street: '', city: '', state: '', country: 'India', pincode: '' },
    tags: [], notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ 
        ...prev, 
        [parent]: { ...prev[parent], [child]: value } 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.post('/api/crm/customers', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Strategic Partner Successfully Registered.');
      navigate('/crm/customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Induction Sequence Failure');
    }
  };

  const steps = [
    { id: 1, title: 'Identity', icon: User },
    { id: 2, title: 'Classification', icon: Tag },
    { id: 3, title: 'Geography', icon: MapPin },
    { id: 4, title: 'Authorization', icon: ShieldCheck }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={22} />
           </button>
           <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic leading-none text-slate-900">Add New Customer</h2>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           {steps.map(s => (
              <div key={s.id} className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-primary-600 scale-125' : 'bg-slate-200'}`}></div>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-50 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-5 blur-3xl"></div>
         
         <div className="flex">
            <div className="w-1/3 bg-slate-950 p-12 text-white space-y-10 relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary-900/20 to-transparent"></div>
               <div className="relative z-10 space-y-8">
                  {steps.map(s => (
                     <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step === s.id ? 'translate-x-4 opacity-100' : 'opacity-30'}`}>
                        <div className={`p-3 rounded-2xl ${step === s.id ? 'bg-primary-600' : 'bg-white/10'}`}><s.icon size={20} /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Step 0{s.id}</p>
                           <h4 className="text-sm font-black uppercase italic tracking-tighter">{s.id === 1 ? 'Details' : s.id === 2 ? 'Category' : s.id === 3 ? 'Address' : 'Finish'}</h4>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex-1 p-16 space-y-10 relative z-10 text-slate-900">
               {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Basic Details</label>
                        <div grid-cols-1 sm:grid-cols-2>
                           <input name="name" placeholder="Full Name" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.name} />
                           <input name="email" placeholder="Email Address" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.email} />
                        </div>
                        <div grid-cols-1 sm:grid-cols-2>
                           <input name="phone" placeholder="Mobile Number" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.phone} />
                           <input name="company" placeholder="Company Name" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.company} />
                        </div>
                     </div>
                  </div>
               )}

               {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category & Source</label>
                        <div grid-cols-1 sm:grid-cols-2>
                           <select name="industry" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 shadow-sm" onChange={handleChange} value={formData.industry}>
                              {['IT', 'manufacturing', 'retail', 'healthcare', 'education', 'other'].map(i => <option key={i} value={i}>{i} SECTOR</option>)}
                           </select>
                           <select name="customerType" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 shadow-sm" onChange={handleChange} value={formData.customerType}>
                              {['individual', 'corporate', 'government'].map(t => <option key={t} value={t}>{t} TYPE</option>)}
                           </select>
                        </div>
                        <div grid-cols-1 sm:grid-cols-2>
                           <select name="source" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 shadow-sm" onChange={handleChange} value={formData.source}>
                              {['website', 'referral', 'cold-call', 'social-media', 'exhibition', 'email-campaign', 'other'].map(s => <option key={s} value={s}>{s} SOURCE</option>)}
                           </select>
                           <input name="designation" placeholder="Job Role / Position" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.designation} />
                        </div>
                     </div>
                  </div>
               )}

               {step === 3 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Address Details</label>
                        <input name="address.street" placeholder="Street Address" className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 shadow-sm" onChange={handleChange} value={formData.address.street} />
                        <div grid-cols-1 sm:grid-cols-2>
                           <input name="address.city" placeholder="City" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.address.city} />
                           <input name="address.state" placeholder="State" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.address.state} />
                        </div>
                        <div grid-cols-1 sm:grid-cols-2>
                           <input name="address.country" placeholder="Country" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.address.country} />
                           <input name="address.pincode" placeholder="Pincode" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-xs font-black uppercase italic tracking-widest outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm" onChange={handleChange} value={formData.address.pincode} />
                        </div>
                     </div>
                  </div>
               )}

               {step === 4 && (
                  <div className="space-y-12 animate-in slide-in-from-right-10 duration-500 text-center">
                     <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-primary-50/50 mb-8"><CheckCircle2 size={40} /></div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase italic tracking-tight">Review & Save</h4>
                        <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">Please check the details below before saving the customer.</p>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-3xl border border-dotted border-slate-200 text-left space-y-4">
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-[9px] font-black uppercase text-slate-400 italic">Full Name</span><span className="text-[9px] font-black text-slate-900 uppercase italic">{formData.name}</span></div>
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-[9px] font-black uppercase text-slate-400 italic">Company Name</span><span className="text-[9px] font-black text-slate-900 uppercase italic">{formData.company}</span></div>
                     </div>
                  </div>
               )}

               <div className="pt-10 flex justify-between">
                  {step > 1 && (
                     <button onClick={() => setStep(prev => prev - 1)} className="px-10 py-5 bg-slate-50 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-slate-100 transition-all flex items-center gap-2">Go Back <ArrowLeft size={16} /></button>
                  )}
                  <div className="flex-1"></div>
                  {step < 4 ? (
                     <button onClick={() => setStep(prev => prev + 1)} className="px-12 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-primary-600 transition-all flex items-center gap-2 shadow-2xl">Next Step <ArrowRight size={16} /></button>
                  ) : (
                     <button onClick={handleSubmit} className="px-12 py-5 bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-2xl">Save Customer <Globe size={16} /></button>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AddEditCustomer;
