import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../redux/slices/hrSlice';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Paperclip, 
  Clock, 
  Calendar, 
  CreditCard,
  Target,
  Download,
  Upload
} from 'lucide-react';
import axios from 'axios';

const EmployeeProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Personal');
  const [employee, setEmployee] = useState(null);
  
  const tabs = ['Personal', 'Job', 'Documents', 'Attendance', 'Leaves', 'Payroll', 'Performance'];

  useEffect(() => {
    const loadProfile = async () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get(`/api/hr/employees/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEmployee(res.data);
    };
    loadProfile();
  }, [id]);

  if (!employee) return <div className="p-20 text-center font-black animate-pulse">SYNCHRONIZING PERSONNEL DATA...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
         <div className="h-48 bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 opacity-20 blur-[120px]"></div>
         </div>
         <div className="px-10 pb-10 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-end gap-8">
               <div className="w-40 h-40 rounded-[3rem] border-8 border-white bg-slate-100 shadow-2xl overflow-hidden">
                  {employee.photo ? <img src={employee.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={64} /></div>}
               </div>
               <div className="flex-1 pb-4">
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">{employee.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                     <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <Briefcase size={12} /> {employee.designation}
                     </span>
                     <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <MapPin size={12} /> {employee.department}
                     </span>
                     <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">{employee.status}</span>
                  </div>
               </div>
               <div className="pb-4 flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                     Initiate Protocol
                  </button>
               </div>
            </div>
         </div>

         <div className="px-10 pb-1 border-t border-slate-50 overflow-x-auto scrollbar-hide">
            <div className="flex gap-10">
               {tabs.map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                 </button>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         {activeTab === 'Personal' && (
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Formal Email</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2"><Mail size={16} className="text-primary-400" /> {employee.email}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Identity</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2"><Phone size={16} className="text-primary-400" /> {employee.phone}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Temporal Origin (DOB)</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2"><Calendar size={16} className="text-primary-400" /> {new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                 </div>
              </div>
              <div className="pt-10 border-t border-slate-50">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Residential Nexus</p>
                 <p className="font-bold text-slate-900 bg-slate-50 p-6 rounded-3xl border border-slate-100">{employee.address}</p>
              </div>
           </div>
         )}

         {activeTab === 'Job' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2"><Briefcase size={16} /> Compensations</h4>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none mb-2">Base Salary</p>
                        <h5 className="text-2xl font-black text-slate-900">${employee.salary.basic.toLocaleString()}</h5>
                     </div>
                     <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                        <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-none mb-2">Allowances</p>
                        <h5 className="text-2xl font-black text-slate-900">${employee.salary.allowances.toLocaleString()}</h5>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2"><CreditCard size={16} /> Treasury Access</h4>
                  <div className="space-y-4">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Bank: <span className="text-slate-900">{employee.bankDetails.bankName}</span></p>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Account: <span className="text-slate-900">{employee.bankDetails.accountNo}</span></p>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">IFSC: <span className="text-slate-900">{employee.bankDetails.ifsc}</span></p>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'Documents' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
               <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2"><Paperclip size={16} /> Personnel Dossier</h4>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-slate-200">
                     <Upload size={16} /> Upload New
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employee.documents.map((doc, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-primary-200 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-2xl text-primary-500 shadow-sm"><Paperclip size={20} /></div>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{doc.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors"><Download size={18} /></button>
                    </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
