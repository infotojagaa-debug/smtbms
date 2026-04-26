import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Search, 
  Filter, 
  Edit3, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Banknote,
  Send,
  ArrowRight
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PayrollManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [salaryConfig, setSalaryConfig] = useState({
    basic: 0,
    foodAllowance: 0,
    travelAllowance: 0,
    overtimeRate: 0,
    latePenalty: 0
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [empRes, payRes] = await Promise.all([
        api.get('/api/hr/employees'),
        api.get('/api/hr/payroll')
      ]);
      setEmployees(empRes.data.employees || empRes.data);
      setPayrolls(payRes.data);
    } catch (err) {
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openProcessModal = async (emp) => {
    setSelectedEmployee(emp);
    try {
      const res = await api.get(`/api/hr/payroll/draft/${emp._id}`);
      setDraftData(res.data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Error calculating draft salary');
    }
  };

  const openConfigModal = (emp) => {
    setSelectedEmployee(emp);
    setSalaryConfig({
      basic: emp.salary?.basic || 0,
      foodAllowance: emp.salary?.foodAllowance || 0,
      travelAllowance: emp.salary?.travelAllowance || 0,
      overtimeRate: emp.salary?.overtimeRate || 0,
      latePenalty: emp.salary?.latePenalty || 0
    });
    setIsConfigModalOpen(true);
  };

  const handleUpdateConfig = async () => {
    try {
      await api.put(`/api/hr/employees/${selectedEmployee._id}`, {
        salary: {
          ...selectedEmployee.salary,
          ...salaryConfig
        }
      });
      toast.success('Salary configuration updated');
      setIsConfigModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update configuration');
    }
  };

  const handleProcessPayment = async () => {
    try {
      const payload = {
        ...draftData,
        status: 'Paid',
        paymentMethod,
        paymentDate: new Date(),
        remarks: 'Monthly payroll finalized'
      };
      await api.post('/api/hr/payroll', payload);
      toast.success(`Payroll processed for ${selectedEmployee.name}`);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to process payment');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 fade-up pb-20">
      
      {/* Admin Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-[2s]"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
               <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Workforce <span className="text-primary-400">Payroll</span></h2>
               <p className="text-slate-400 font-bold mt-4 max-w-sm">
                 Corporate-grade financial settlement node. Process and manage employee earnings with high-fidelity automation.
               </p>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                  <CreditCard className="text-primary-400" size={20} />
                  <span className="text-white font-black uppercase text-xs tracking-widest">{payrolls.filter(p => p.status === 'Paid').length} Cycles Paid</span>
               </div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Node Live Stream</div>
            </div>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Employee List */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                   <Users size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase italic">Employee Ledger</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select target to process</p>
                </div>
             </div>
             
             <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                   <input 
                     type="text" 
                     placeholder="Search Registry..." 
                     className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 placeholder:text-slate-300 transition-all"
                   />
                </div>
                <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <Filter size={18} className="text-slate-600" />
                </button>
             </div>
          </div>
          
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead className="hidden md:table-header-group">
                  <tr>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Node</th>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration</th>
                    <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                   {employees.map((emp) => (
                     <tr key={emp._id} className="bg-slate-50/50 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                       <td className="px-6 py-6 rounded-l-[2.5rem] border-y border-l border-slate-100 group-hover:border-white">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center font-black text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                                {emp.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{emp.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{emp.designation}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6 border-y border-slate-100 group-hover:border-white">
                          <span className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest">
                            {emp.department}
                          </span>
                       </td>
                       <td className="px-6 py-6 border-y border-slate-100 group-hover:border-white">
                          <button 
                            onClick={() => openConfigModal(emp)}
                            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                             <Edit3 size={14} /> ₹{emp.salary?.basic?.toLocaleString() || '0'} / Mo
                          </button>
                       </td>
                       <td className="px-6 py-6 rounded-r-[2.5rem] border-y border-r border-slate-100 group-hover:border-white text-center">
                          <div className="flex items-center justify-center gap-3">
                             <button 
                               onClick={() => openProcessModal(emp)}
                               className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 transition-all hover:scale-105"
                             >
                                Process Month
                             </button>
                             <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors">
                                <MoreVertical size={18} />
                             </button>
                          </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Process Modal */}
      {isModalOpen && draftData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60 transition-all animate-enter">
           <div className="bg-white rounded-[3rem] w-full max-w-[500px] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <DollarSign size={120} />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <Send size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Settle Monthly Node</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedEmployee.name} • {new Date().toLocaleString('default', { month: 'long' })}</p>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Present (Verified)</p>
                       <p className="text-lg font-black text-slate-900">{draftData.presentDays} Days</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                       <p className="text-[8px] font-black text-rose-400 uppercase mb-1">Absent (Leaked)</p>
                       <p className="text-lg font-black text-rose-600">{draftData.absentDays} Days</p>
                    </div>
                 </div>

                 <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent"></div>
                    <div className="relative z-10">
                       <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Calculated Net Pay</p>
                       <p className="text-3xl font-black text-indigo-900">₹{Math.round(draftData.netSalary).toLocaleString()}</p>
                    </div>
                    <Banknote className="text-indigo-200" size={40} />
                 </div>

                 <div className="space-y-1 bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-slate-100 transition-colors">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic underline decoration-indigo-300">Adjustment Node</p>
                    <div className="flex items-center justify-between gap-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Payment Method</span>
                       <select 
                         value={paymentMethod}
                         onChange={(e) => setPaymentMethod(e.target.value)}
                         className="bg-transparent text-[10px] font-black border-none focus:ring-0 cursor-pointer text-indigo-600"
                        >
                          <option>Bank Transfer</option>
                          <option>Cash</option>
                          <option>UPI</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                 >
                    Abort
                 </button>
                 <button 
                   onClick={handleProcessPayment}
                   className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                 >
                    Verify & Pay <ArrowRight size={14} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60 transition-all animate-enter">
           <div className="bg-white rounded-[3rem] w-full max-w-[600px] p-10 md:p-14 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-8 border-b border-slate-100 pb-4">Configuration Node</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Base (Basic)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       <input 
                         type="number" 
                         value={salaryConfig.basic}
                         onChange={(e) => setSalaryConfig({...salaryConfig, basic: Number(e.target.value)})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600/20"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overtime Rate (Per Hr)</label>
                    <input 
                      type="number" 
                      value={salaryConfig.overtimeRate}
                      onChange={(e) => setSalaryConfig({...salaryConfig, overtimeRate: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600/20"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Late Penalty (Fixed)</label>
                    <input 
                      type="number" 
                      value={salaryConfig.latePenalty}
                      onChange={(e) => setSalaryConfig({...salaryConfig, latePenalty: Number(e.target.value)})}
                      className="w-full bg-rose-50 border border-rose-100 rounded-xl py-3 px-4 text-sm font-bold text-rose-600 focus:ring-2 focus:ring-rose-600/20"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Food Allowance</label>
                    <input 
                      type="number" 
                      value={salaryConfig.foodAllowance}
                      onChange={(e) => setSalaryConfig({...salaryConfig, foodAllowance: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600/20"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                 <button 
                   onClick={() => setIsConfigModalOpen(false)}
                   className="py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"
                 >
                    Dismiss
                 </button>
                 <button 
                   onClick={handleUpdateConfig}
                   className="py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-xl transition-all"
                 >
                    Apply Config
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;
