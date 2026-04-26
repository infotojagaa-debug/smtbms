import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createEmployee } from '../../redux/slices/hrSlice';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Wallet, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Scan
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddEditEmployee = () => {
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: 'Male', dateOfBirth: '', address: '',
    department: '', designation: '', employeeType: 'Full-time', joiningDate: '', reportingManager: '',
    salary: { basic: 0, allowances: 0, deductions: 0 },
    bankDetails: { accountNo: '', ifsc: '', bankName: '' }
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    const res = await dispatch(createEmployee(formData));
    if (res.error) {
       toast.error(res.payload);
    } else {
       toast.success('Personnel Onboarded. Security Protocols initialized.');
       navigate('/hr/employees');
    }
  };

  const steps = [
    { id: 1, name: 'Personal ID', icon: User },
    { id: 2, name: 'Service Profile', icon: Briefcase },
    { id: 3, name: 'Fiscal Structure', icon: Wallet },
    { id: 4, name: 'Treasury Link', icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center pt-8">
         <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Personnel Induction Protocol</h2>
         <p className="text-slate-500 font-medium">Standardizing corporate identity and high-level resource allocation.</p>
      </div>

      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${(step - 1) * 33.33}%` }}></div>
         </div>
         {steps.map(s => (
           <div key={s.id} className="flex flex-col items-center gap-3 relative z-10 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                step >= s.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 text-slate-400 opacity-50'
              }`}>
                 <s.icon size={26} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary-600' : 'text-slate-400'}`}>{s.name}</p>
           </div>
         ))}
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500">
         {step === 1 && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Full Identity Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="e.g. Alexander Pierce"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      value={formData.name}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Communication Email (Secure)</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="corp@enterprise.com"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      value={formData.email}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Encrypted Phone Channel</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="+1 (555) 000-0000"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      value={formData.phone}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Temporal Origin (DOB)</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      value={formData.dateOfBirth}
                    />
                 </div>
              </div>
           </div>
         )}

         {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Departmental Nexus</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      value={formData.department}
                    >
                       <option value="">Select Unit</option>
                       <option value="Production">Production Intelligence</option>
                       <option value="Storage">Central Logistics</option>
                       <option value="HR">Human Resources</option>
                       <option value="Sales">Revenue Operations</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Functional Designation</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="e.g. Senior Strategist"
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      value={formData.designation}
                    />
                 </div>
              </div>
            </div>
         )}

         {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Core Base Salary</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      onChange={(e) => setFormData({...formData, salary: {...formData.salary, basic: e.target.value}})}
                      value={formData.salary.basic}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Incentive Allowances</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      onChange={(e) => setFormData({...formData, salary: {...formData.salary, allowances: e.target.value}})}
                      value={formData.salary.allowances}
                    />
                 </div>
              </div>
            </div>
         )}

         {step === 4 && (
            <div className="space-y-8">
               <div className="p-8 bg-primary-50 rounded-[2.5rem] border border-primary-100 flex items-center gap-6 mb-10">
                  <Scan size={32} className="text-primary-600 animate-pulse" />
                  <p className="text-sm font-black text-primary-900 uppercase tracking-tight italic">Finalizing cryptographic treasury link and system credentials.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Bank Account Registry</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNo: e.target.value}})}
                      value={formData.bankDetails.accountNo}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">IFSC Routing Code</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, ifsc: e.target.value}})}
                      value={formData.bankDetails.ifsc}
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
                 <ChevronLeft size={20} /> Reverse Protocol
              </button>
            )}
            <div className="ml-auto flex gap-4">
               {step < 4 ? (
                 <button 
                   onClick={nextStep}
                   className="flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                 >
                   Advance Stage <ChevronRight size={20} />
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   className="flex items-center gap-2 px-10 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all active:scale-95"
                 >
                   Establish Identity <CheckCircle2 size={20} />
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AddEditEmployee;
