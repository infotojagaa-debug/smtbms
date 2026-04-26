import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createVendor } from '../../redux/slices/vendorSlice';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddEditVendor = () => {
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', category: 'raw-material',
    address: '', city: '', state: '', country: 'India',
    gstNumber: '', panNumber: '',
    bankDetails: { accountNo: '', ifsc: '', bankName: '', accountName: '' },
    notes: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    const res = await dispatch(createVendor(formData));
    if (res.error) {
       toast.error(res.payload);
    } else {
       toast.success('Partner Identity Established. Procurement channel active.');
       navigate('/erp/vendors');
    }
  };

  const steps = [
    { id: 1, name: 'Core Identity', icon: Building2 },
    { id: 2, name: 'Nexus Location', icon: MapPin },
    { id: 3, name: 'Tax Integrity', icon: ShieldCheck },
    { id: 4, name: 'Treasury Link', icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center pt-8">
         <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Add New Supplier</h2>
         <p className="text-slate-500 font-medium">Add details for your new material supplier or partner.</p>
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
              <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary-600' : 'text-slate-400'}`}>
                {s.id === 1 ? 'Company' : s.id === 2 ? 'Address' : s.id === 3 ? 'Tax Info' : 'Bank Info'}
              </p>
           </div>
         ))}
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500 text-slate-900">
         {step === 1 && (
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Company Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="e.g. Global Steel Solutions"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      value={formData.name}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Supplier Type</label>
                    <select 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      value={formData.category}
                    >
                       <option value="raw-material">Raw Material</option>
                       <option value="service">Services</option>
                       <option value="equipment">Machinery</option>
                       <option value="consumable">Others</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="sales@vendor.com"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      value={formData.email}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Mobile Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="+91-XXXXXXXXXX"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      value={formData.phone}
                    />
                 </div>
              </div>
           </div>
         )}

         {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Street Address</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="Building, Street, Area"
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      value={formData.address}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">City</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="Mumbai"
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      value={formData.city}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">State</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="Maharashtra"
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      value={formData.state}
                    />
                 </div>
              </div>
            </div>
         )}

         {step === 3 && (
            <div className="space-y-8">
              <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center gap-6 mb-10">
                  <ShieldCheck size={32} className="text-amber-600 animate-pulse" />
                  <p className="text-sm font-black text-amber-900 uppercase tracking-tight italic leading-relaxed">Please provide GST and PAN details for tax compliance.</p>
               </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">GST Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all uppercase"
                      placeholder="27AAAAAAAAA0000Z1"
                      onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                      value={formData.gstNumber}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">PAN Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all uppercase"
                      placeholder="ABCDE1234F"
                      onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                      value={formData.panNumber}
                    />
                 </div>
              </div>
            </div>
         )}

         {step === 4 && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Bank Account Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="Account Number"
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNo: e.target.value}})}
                      value={formData.bankDetails.accountNo}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">IFSC Code</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="BANK0001234"
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, ifsc: e.target.value}})}
                      value={formData.bankDetails.ifsc}
                    />
                 </div>
                 <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Bank Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="e.g. HDFC Bank"
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                      value={formData.bankDetails.bankName}
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
                 <ChevronLeft size={20} /> Go Back
              </button>
            )}
            <div className="ml-auto flex gap-4">
               {step < 4 ? (
                 <button 
                   onClick={nextStep}
                   className="flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                 >
                   Next Step <ChevronRight size={20} />
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   className="flex items-center gap-2 px-10 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all active:scale-95"
                 >
                   Save Supplier <CheckCircle2 size={20} />
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AddEditVendor;
