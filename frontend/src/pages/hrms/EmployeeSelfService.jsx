import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Zap, 
  MoreVertical, 
  Send, 
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmployeeSelfService = () => {
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [slips, setSlips] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');

  const loadSelfData = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    // 1. Get Employee Profile
    const profileRes = await axios.get(`/api/hr/employees/profile/self`, { // Assume self profile endpoint
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setEmployee(profileRes.data);

    // 2. Get Leaves
    const leaveRes = await axios.get(`/api/hr/leaves`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setLeaves(leaveRes.data);

    // 3. Get Slips
    const slipRes = await axios.get(`/api/hr/payroll/${profileRes.data._id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setSlips(slipRes.data);

    // 4. Get Balance
    const balRes = await axios.get(`/api/hr/leaves/balance/${profileRes.data._id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setBalance(balRes.data);
  };

  useEffect(() => {
    // Dummy Data if API not ready
    setEmployee({ name: 'Alexander Pierce', department: 'Production Intelligence', designation: 'Senior Analyst', employeeId: 'EMP001' });
    setBalance({ 
       casual: { remaining: 8, total: 12 }, 
       sick: { remaining: 4, total: 10 }, 
       earned: { remaining: 15, total: 15 } 
    });
    setSlips([
       { month: 4, year: 2024, netSalary: 5400, status: 'Paid' },
       { month: 3, year: 2024, netSalary: 5400, status: 'Paid' }
    ]);
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase italic">Self-Service Terminal</h2>
           <p className="text-slate-500 font-medium">Manage your corporate credentials, absence requests, and fiscal records.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><ShieldCheck size={20} /></div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400 leading-none">Status</p>
              <p className="text-xs font-black text-slate-900 uppercase">Authenticated</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-4 space-y-10">
            <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-20 blur-3xl"></div>
               <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                  <div className="w-32 h-32 rounded-[3rem] border-4 border-white/20 p-1">
                     <div className="w-full h-full bg-white/10 rounded-[2.8rem] flex items-center justify-center text-3xl font-black italic">AP</div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tight">{employee?.name}</h3>
                     <p className="text-[10px] font-black uppercase text-primary-400 tracking-[0.3em] mt-1">{employee?.designation}</p>
                  </div>
                  <div className="w-full pt-8 border-t border-white/10 flex justify-between uppercase font-black text-[9px] tracking-widest text-white/40">
                     <span>Unit: {employee?.department}</span>
                     <span>{employee?.employeeId}</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6">
               <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2 italic"><Clock size={16} /> Absence Balances</h4>
               <div className="space-y-4">
                  {balance && ['casual', 'sick', 'earned'].map(type => (
                    <div key={type} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{type}</p>
                          <p className="text-lg font-black text-slate-900 leading-none">{balance[type].remaining} / {balance[type].total}</p>
                       </div>
                       <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600" style={{ width: `${(balance[type].remaining / balance[type].total) * 100}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Send size={14} /> Initialize Leave Protocol
               </button>
            </div>
         </div>

         <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
               <div className="px-10 py-2 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex gap-10">
                     {['Journal', 'Fiscal Records', 'Security'].map(tab => (
                       <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                          {tab}
                          {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="p-10 flex-1">
                  {activeTab === 'Journal' && (
                     <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center gap-4">
                              <Zap size={32} className="text-emerald-600" />
                              <div>
                                 <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Attendance Health</p>
                                 <h4 className="text-2xl font-black text-emerald-900 italic">98.2% Perfect</h4>
                              </div>
                           </div>
                           <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex flex-col items-center text-center gap-4">
                              <Building2 size={32} className="text-blue-600" />
                              <div>
                                 <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Active Engagements</p>
                                 <h4 className="text-2xl font-black text-blue-900 italic">2 Requests</h4>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t border-slate-50">
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Activity Logs</h5>
                           {[1,2,3].map(i => (
                             <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary-200 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-500 shadow-sm"><FileText size={18} /></div>
                                   <div>
                                      <p className="text-[11px] font-black text-slate-800 uppercase">Check-In Event</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase">Success • Apr 18, 08:45 AM</p>
                                   </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-all" />
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeTab === 'Fiscal Records' && (
                     <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
                        {slips.map((slip, idx) => (
                           <div key={idx} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white"><DollarSign size={24} /></div>
                                 <div>
                                    <h5 className="text-xl font-black italic text-slate-900">{new Date(0, slip.month-1).toLocaleString('en', {month: 'long'})} {slip.year} Ledger</h5>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                       <ShieldCheck size={12} /> Settlement Verified • ${slip.netSalary.toLocaleString()}
                                    </p>
                                 </div>
                              </div>
                              <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">
                                 Record <FileText size={16} />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default EmployeeSelfService;
