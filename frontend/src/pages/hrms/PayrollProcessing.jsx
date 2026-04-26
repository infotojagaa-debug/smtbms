import { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  FileText, 
  TrendingUp,
  Download,
  Activity,
  User
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PayrollProcessing = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payloads, setPayloads] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    setIsProcessing(true);
    try {
      const res = await axios.post('/api/hr/payroll/generate', { month, year }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPayloads(res.data.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Protocol Failure: ' + err.response.data.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async (id) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.put(`/api/hr/payroll/${id}/paid`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Fiscal Settlement Verified');
      setPayloads(prev => prev.map(p => p._id === id ? { ...p, status: 'Paid' } : p));
    } catch (err) {
      toast.error('Settlement Failed');
    }
  };

  const totalCost = payloads.reduce((acc, curr) => acc + curr.netSalary, 0);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Financial Compensation Engine</h2>
          <p className="text-slate-500 font-medium">Automate monthly payroll generation, audit fiscal deductions, and finalize workforce settlements.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex gap-2">
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                 {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
              </select>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                 {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
           <button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
           >
             {isProcessing ? 'CALCULATING...' : <><Plus size={18} /> Initialize Gen</>}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
           <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                 <CreditCard size={16} className="text-primary-500" /> Compensation Ledger
              </h4>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:gap-3 transition-all">
                Download ZIP Slips <Download size={14} />
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left font-bold text-slate-500">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Structure</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {payloads.map(p => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-all group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                  {p.employeeId.employeeId?.slice(-2) || 'E'}
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 uppercase text-xs leading-none">{p.employeeId.name || 'Anonymous'}</p>
                                  <p className="text-[9px] uppercase font-black text-slate-300 tracking-widest mt-1 italic">Net: ${p.netSalary.toLocaleString()}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-xs font-black text-slate-900 italic">${p.grossSalary.toLocaleString()}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-tighter">Incl. Overtime: ${p.overtime}</p>
                         </td>
                         <td className="px-8 py-6 text-red-400">
                            <p className="text-xs font-black italic">-${(p.deductions.pf + p.deductions.tax).toLocaleString()}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-tighter">PF + Statutory Tax</p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-4">
                               {p.status !== 'Paid' ? (
                                 <button 
                                   onClick={() => handleMarkPaid(p._id)}
                                   className="px-5 py-2 bg-emerald-50 text-emerald-600 font-black uppercase tracking-tight text-[10px] rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                 >
                                    Finalize Pay
                                 </button>
                               ) : (
                                 <div className="flex items-center gap-1.5 text-emerald-600 font-black uppercase text-[10px]">
                                    <CheckCircle2 size={14} /> Settlement Complete
                                 </div>
                               )}
                               <button className="p-2.5 bg-white border border-slate-100 text-slate-300 hover:text-primary-600 rounded-xl transition-all shadow-sm">
                                  <FileText size={18} />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                    {payloads.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-20 text-center opacity-30 flex flex-col items-center justify-center gap-4">
                           <Activity size={64} className="mx-auto" />
                           <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting fiscal generation cycle.</p>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-20 blur-3xl"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 mb-6">Settlement Summary</h4>
              <div className="space-y-8 relative z-10">
                 <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Fiscal Outflow</p>
                    <h3 className="text-3xl font-black text-white italic">${totalCost.toLocaleString()}</h3>
                 </div>
                 <div className="pt-6 border-t border-white/10 flex justify-between items-center font-black uppercase tracking-widest text-[9px]">
                    <span className="text-white/40">Employees Processed</span>
                    <span className="text-primary-400">{payloads.length} Units</span>
                 </div>
                 <div className="flex justify-between items-center font-black uppercase tracking-widest text-[9px]">
                    <span className="text-white/40">Statutory Deductions</span>
                    <span className="text-white">${payloads.reduce((acc, curr) => acc + curr.deductions.pf + curr.deductions.tax, 0).toLocaleString()}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-500" /> Historical Trend
              </h4>
              <div className="h-40 w-full bg-slate-50 rounded-3xl border border-slate-50 flex items-center justify-center italic text-slate-300 font-bold uppercase tracking-widest text-[9px]">
                 Fiscal Flow Analytics Loading...
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollProcessing;
