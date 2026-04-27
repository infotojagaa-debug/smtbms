import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Calendar, 
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  ShieldCheck,
  Zap,
  Activity,
  Download
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MySalary = () => {
  const { user } = useSelector((state) => state.auth);
  const [draft, setDraft] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [currentMonthPayroll, setCurrentMonthPayroll] = useState(null); // paid record for this month

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const empRes = await api.get('/api/analytics/employee');
      const empId = empRes.data.employee?._id;
      setEmployeeProfile(empRes.data.employee);

      if (empId) {
        const draftRes = await api.get(`/api/hr/payroll/draft/${empId}`);
        setDraft(draftRes.data);
        const historyRes = await api.get('/api/hr/payroll/my');
        const allRecords = historyRes.data;
        setHistory(allRecords);
        // Check if current month is already paid
        const now = new Date();
        const paid = allRecords.find(
          r => r.month === (now.getMonth() + 1) && r.year === now.getFullYear() && r.status === 'Paid'
        );
        setCurrentMonthPayroll(paid || null);
      }
    } catch (err) {
      console.error('Failed to fetch salary data:', err);
      toast.error('Could not sync salary records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadCSV = () => {
    if (!history.length) return toast.error('No history to export');
    const headers = ['Month', 'Year', 'Base Salary', 'Net Salary', 'Present Days', 'Absent Days', 'Status'];
    const rows = history.map(h => [
      new Date(h.year, h.month - 1).toLocaleString('default', { month: 'long' }),
      h.year,
      h.baseSalary,
      h.netSalary,
      h.presentDays,
      h.absentDays,
      h.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_history_${user?.name?.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></motion.div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 max-w-[1400px] mx-auto px-4 md:px-8"
    >
      
      {/* Header Banner - Balanced Size */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 md:p-8 shadow-xl border-2 border-slate-800"
      >
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl mb-4">
                  <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                    Live Computation
                  </span>
               </div>
               <h2 className="text-2xl md:text-4xl font-black text-white leading-none tracking-tight mb-2">
                 PAYROLL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-rose-400">ENGINE</span>
               </h2>
               <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed">
                 Real-time salary calculation synchronized with your daily attendance and leave quotas.
               </p>
            </div>
            
            <div className={`rounded-2xl p-6 min-w-[260px] text-center border backdrop-blur-md transition-all duration-500 ${
              currentMonthPayroll 
                ? 'bg-emerald-500/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-800/30 border-white/10'
            }`}>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                 {currentMonthPayroll ? 'This Month — Paid' : 'Net Pay Estimate'}
               </p>
               <AnimatePresence mode="wait">
                 <motion.h3 
                   key={currentMonthPayroll?.netSalary || draft?.netSalary || 0}
                   initial={{ opacity: 0, y: 8 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`text-4xl font-black tabular-nums tracking-tighter ${
                     currentMonthPayroll ? 'text-emerald-300' : 'text-white'
                   }`}
                 >
                   ₹{Math.round((currentMonthPayroll?.netSalary || draft?.netSalary || 0)).toLocaleString('en-IN')}
                 </motion.h3>
               </AnimatePresence>
               <div className="mt-3 flex items-center justify-center">
                 {currentMonthPayroll ? (
                   <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black tracking-widest flex items-center gap-1.5 shadow-md shadow-emerald-500/30 whitespace-nowrap">
                     <CheckCircle2 size={13} /> PAYMENT DONE
                   </div>
                 ) : (
                   <div className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[8px] font-black tracking-widest border border-amber-500/30 flex items-center gap-1.5">
                     <Clock size={11} /> AWAITING PAYMENT
                   </div>
                 )}
               </div>
               {currentMonthPayroll?.paymentDate && (
                 <p className="text-[8px] text-emerald-400/70 font-bold mt-2 uppercase tracking-widest">
                   Paid on {new Date(currentMonthPayroll.paymentDate).toLocaleDateString('en-GB')}
                 </p>
               )}
            </div>
         </div>
      </motion.div>

      {/* Overview Stats - Dark Border Style */}
      <div grid-cols-1 sm:grid-cols-2>
        {[
          { label: 'Base Salary', value: `₹${Math.round(draft?.baseSalary || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'primary' },
          { label: 'Paid Leave', value: `${draft?.paidLeaveDays || 0} Days`, icon: Calendar, color: 'indigo' },
          { label: 'LOP Days', value: `${draft?.lopDays || 0} Days`, icon: TrendingDown, color: 'rose' },
          { label: 'Deduction', value: `₹${Math.round(draft?.lopDeduction || 0).toLocaleString()}`, icon: Activity, color: 'amber' }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.15)" }}
            className="bg-white rounded-xl p-4 border-2 border-slate-900 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center border border-slate-800 shadow-inner group-hover:bg-primary-600 transition-colors`}>
                  <stat.icon size={16} />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500 mb-0.5">{stat.label}</p>
                  <h3 className="text-base font-black text-slate-900 tracking-tight tabular-nums">
                    {stat.value}
                  </h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>


      {/* === CURRENT MONTH PAYMENT STATUS BANNER === */}
      <motion.div
        variants={itemVariants}
        className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 ${
          currentMonthPayroll
            ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100'
            : 'bg-amber-50 border-amber-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
            currentMonthPayroll ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
          }`}>
            {currentMonthPayroll ? <CheckCircle2 size={24} /> : <Clock size={24} />}
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest ${
              currentMonthPayroll ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {currentMonthPayroll ? 'This Month — Salary Credited' : 'This Month — Payment Pending'}
            </p>
            <p className={`text-[10px] font-bold mt-0.5 ${
              currentMonthPayroll ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {currentMonthPayroll
                ? `Paid on ${new Date(currentMonthPayroll.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'HR has not yet disbursed salary for this month'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-black tabular-nums tracking-tight ${
            currentMonthPayroll ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            ₹{Math.round(currentMonthPayroll?.netSalary || draft?.netSalary || 0).toLocaleString('en-IN')}
          </p>
          <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
            currentMonthPayroll ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {currentMonthPayroll ? 'Net Amount Received' : 'Estimated Net Pay'}
          </p>
        </div>
      </motion.div>


      {/* Computation Logic - Proper Professional Layout */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
        className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-900 shadow-md relative transition-shadow duration-300"
      >
        <div className="flex justify-between items-center mb-8">
           <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <Activity size={20} className="text-primary-500" /> Computation Logic
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Transparency settlement log</p>
           </div>
           <div className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                 <Clock size={12} className="text-primary-500" /> ACTIVE SYNC
              </span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Component A: Earnings */}
           <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Credit Streams</p>
              <div className="space-y-2">
                 <motion.div 
                   whileHover={{ x: 5 }}
                   className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 transition-all bg-slate-50/50 cursor-pointer"
                 >
                    <p className="text-[8px] font-black text-primary-600 uppercase mb-1">Monthly Basic</p>
                    <p className="text-base font-black text-slate-900 tabular-nums">₹{Math.round(draft?.baseSalary || 0).toLocaleString('en-IN')}</p>
                 </motion.div>
                 <motion.div 
                   whileHover={{ x: 5 }}
                   className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 transition-all bg-slate-50/50 cursor-pointer"
                 >
                    <p className="text-[8px] font-black text-indigo-600 uppercase mb-1">Overtime Settlement</p>
                    <p className="text-base font-black text-slate-900 tabular-nums">₹{Math.round(draft?.overtimePay || 0).toLocaleString('en-IN')}</p>
                 </motion.div>
              </div>
           </div>

           {/* Component B: Deductions */}
           <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 border-b border-slate-100 pb-2">Debit Streams</p>
              <div className="space-y-2">
                 <motion.div 
                   whileHover={{ x: 5 }}
                   className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 transition-all bg-slate-50/50 cursor-pointer"
                 >
                    <p className="text-[8px] font-black text-rose-600 uppercase mb-1">LOP Deduction</p>
                    <p className="text-base font-black text-rose-600 tabular-nums">- ₹{Math.round(draft?.lopDeduction || 0).toLocaleString('en-IN')}</p>
                 </motion.div>
                 <motion.div 
                   whileHover={{ x: 5 }}
                   className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 transition-all bg-slate-50/50 cursor-pointer"
                 >
                    <p className="text-[8px] font-black text-amber-600 uppercase mb-1">Time Vigilance (Late)</p>
                    <p className="text-base font-black text-amber-600 tabular-nums">- ₹{Math.round(draft?.deductions?.late || 0).toLocaleString('en-IN')}</p>
                 </motion.div>
              </div>
           </div>

           {/* Component C: External */}
           <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Statutory Factors</p>
              <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50 flex flex-col items-center justify-center">
                 <ShieldCheck size={24} className="text-slate-400 mb-2" />
                 <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Statutory Node</p>
                 <p className="text-[8px] font-bold text-slate-400 italic">Self-computing at month end</p>
              </div>
           </div>
        </div>
      </motion.div>

      {/* History Table - Neatly Arranged Final Image */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-[2rem] border-2 border-slate-900 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50">
           <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Payroll Archive</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Verified Financial Record Ledger</p>
           </div>
           <button 
             onClick={downloadCSV}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
           >
              <Download size={14} /> Export Ledger
           </button>
        </div>
        
        <div className="p-4 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-6 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Record Context</th>
                  <th className="px-6 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Workforce Stats</th>
                  <th className="px-6 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-right">Net Settlement</th>
                  <th className="px-6 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                 {history.length > 0 ? history.map((record, i) => (
                   <motion.tr 
                     key={i} 
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     whileHover={{ y: -2, transition: { duration: 0.2 } }}
                     className="group cursor-default"
                   >
                     <td className="px-6 py-4 rounded-l-2xl bg-white border-y border-l border-slate-100 group-hover:border-slate-800 group-hover:bg-slate-50 transition-all duration-300">
                        <div className="flex items-center gap-4">
                           <motion.div 
                             whileHover={{ scale: 1.1, rotate: 2 }}
                             className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-lg"
                           >
                              {record.month.toString().padStart(2, '0')}
                           </motion.div>
                           <div>
                              <p className="text-base font-black text-slate-900 leading-none">
                                {new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                              </p>
                              <div className="flex gap-2 mt-1.5">
                                 <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">NODE: {record._id.slice(-6)}</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 bg-white border-y border-slate-100 group-hover:border-slate-800 group-hover:bg-slate-50 transition-all duration-300">
                        <div className="flex items-center gap-6 divide-x divide-slate-100">
                           <div className="flex flex-col pr-4">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Present</span>
                              <span className="text-sm font-bold text-slate-700 leading-none">{record.presentDays}d</span>
                           </div>
                           <div className="flex flex-col px-4">
                              <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Paid Lv</span>
                              <span className="text-sm font-bold text-indigo-500 leading-none">{record.paidLeaveDays || 0}d</span>
                           </div>
                           <div className="flex flex-col pl-4">
                              <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-0.5">LOP</span>
                              <span className="text-sm font-bold text-rose-500 leading-none">{record.lopDays || 0}d</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right bg-white border-y border-slate-100 text-xl font-black text-slate-900 tabular-nums group-hover:border-slate-800 group-hover:bg-slate-50 transition-all duration-300">
                        ₹{record.netSalary.toLocaleString()}
                     </td>
                      <td className="px-6 py-4 rounded-r-2xl bg-white border-y border-r border-slate-100 text-center group-hover:border-slate-800 group-hover:bg-slate-50 transition-all duration-300">
                         <div className="flex flex-col items-center justify-center gap-1.5">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                              record.status === 'Paid' 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                : record.status === 'Processed'
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                              <CheckCircle2 size={12} />
                              {record.status === 'Paid' ? 'Payment Done' : record.status}
                           </motion.span>
                            {record.status === 'Paid' && record.paymentDate && (
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">
                                Paid on {new Date(record.paymentDate).toLocaleDateString('en-GB')}
                              </p>
                             )}
                         </div>
                      </td>
                   </motion.tr>
                 )) : (
                   <tr>
                      <td colSpan="4" className="text-center py-10 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                         No financial history record.
                      </td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MySalary;
