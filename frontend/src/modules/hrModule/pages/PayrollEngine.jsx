import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  Search, 
  DollarSign, 
  TrendingUp, 
  FileCheck,
  MoreVertical,
  Download,
  Eye,
  Percent,
  CheckCircle2,
  Clock,
  Printer,
  FileText
} from 'lucide-react';

const PayrollEngine = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role?.toLowerCase();
  const isAuthorized = ['admin', 'hr'].includes(userRole);

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [draftData, setDraftData] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [empRes, payrollRes] = await Promise.all([
        axios.get('/api/hr/employees', config),
        axios.get(`/api/hr/payroll?month=${selectedMonth}&year=${selectedYear}`, config)
      ]);
      setEmployees(empRes.data.employees.filter(e => e.userId?.role?.toLowerCase() !== 'admin'));
      setPayrolls(payrollRes.data);
    } catch (err) {
      toast.error('Financial Node Sync Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [selectedMonth, selectedYear]);

  const viewDraft = async (empId) => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get(
        `/api/hr/payroll/draft/${empId}?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDraftData(res.data);
      setIsPreviewModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation Engine Failure');
    }
  };

  const finalizePayroll = async () => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      await axios.post('/api/hr/payroll', { ...draftData, status: 'Paid', paymentDate: new Date() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Capital Distribution Finalized & Paid');
      setIsPreviewModalOpen(false);
      fetchFinancialData();
    } catch (err) {
      toast.error('Data Commit Failed');
    }
  };

  // Direct pay for already-calculated records stuck in Pending/Processed state
  const directPay = async (empId) => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Fetch fresh draft for the selected period
      const draftRes = await axios.get(
        `/api/hr/payroll/draft/${empId}?month=${selectedMonth}&year=${selectedYear}`,
        config
      );
      // Immediately post as Paid
      await axios.post(
        '/api/hr/payroll',
        { ...draftRes.data, status: 'Paid', paymentDate: new Date() },
        config
      );
      toast.success(`Salary disbursed for Period_${String(selectedMonth).padStart(2,'0')}`);
      fetchFinancialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Direct Pay Failed');
    }
  };

  const bulkDisbursement = async () => {
    try {
      const pendingEmployees = employees.filter(e => !payrolls.some(p => p.employeeId?._id === e._id));
      if (pendingEmployees.length === 0) return toast.error('No pending distributions detected');

      setLoading(true);
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch all drafts in parallel for the selected period
      const draftPromises = pendingEmployees.map(emp =>
        axios.get(`/api/hr/payroll/draft/${emp._id}?month=${selectedMonth}&year=${selectedYear}`, config)
      );
      const draftResponses = await Promise.all(draftPromises);
      const drafts = draftResponses.map(r => r.data);

      // 2. Send bulk post
      await axios.post('/api/hr/payroll/bulk', { payrolls: drafts }, config);
      
      toast.success(`Successfully disbursed funds to ${drafts.length} personnel`);
      fetchFinancialData();
    } catch (err) {
      toast.error('Bulk Processing Failure');
    } finally {
      setLoading(false);
    }
  };

  const totalPayroll = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalEmployees = employees.length;
  const processedCount = payrolls.length;
  const pendingCount = employees.filter(e => !payrolls.some(p => p.employeeId?._id === e._id)).length;

  return (
    <div className="max-w-[1400px] mx-auto px-6 space-y-10 animate-in fade-in duration-700 font-sans pb-20 overflow-x-hidden">
      
      {/* --- FISCAL HEADER & KPI SUMMARY --- */}
      <div className="bg-gradient-to-br from-slate-100 to-indigo-50 p-10 rounded-[3rem] border border-slate-200/60 shadow-inner">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 px-8 py-5 rounded-[2rem] shadow-xl shadow-indigo-500/5 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Briefcase size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-slate-900">Payroll Engine</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control_Node_v4.2</p>
            </div>
          </div>

          <div className="flex bg-gray-100 rounded-[2rem] p-1.5 shadow-inner border border-gray-200/50">
            {[selectedMonth - 1, selectedMonth, selectedMonth + 1].map(m => {
              const displayM = m < 1 ? 12 : m > 12 ? 1 : m;
              const isActive = displayM === selectedMonth;
              return (
                <button 
                  key={m} 
                  onClick={() => setSelectedMonth(displayM)}
                  className={`px-8 py-3.5 text-[10px] font-black uppercase rounded-[1.5rem] transition-all duration-500 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'}`}
                >
                  Period_{displayM.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>

          {isAuthorized && (
            <button 
                onClick={bulkDisbursement}
                className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-[2rem] hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500 active:scale-95 group"
            >
                <TrendingUp size={16} className="group-hover:translate-y-[-2px] transition-transform" /> Bulk Disbursement
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Employees', value: totalEmployees.toString().padStart(2, '0'), icon: Briefcase, color: 'text-indigo-600', bg: 'bg-white' },
            { label: 'Total Payroll Amount', value: `₹${totalPayroll.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-white' },
            { label: 'Pending Calculations', value: pendingCount.toString().padStart(2, '0'), icon: Clock, color: 'text-amber-600', bg: 'bg-white' },
            { label: 'Processed Payroll', value: processedCount.toString().padStart(2, '0'), icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-white' },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={20} />
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Stat</div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter mb-1">{stat.value}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- UNIFIED PERSONNEL LEDGER --- */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-4">
           <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">Integrated Workforce Matrix</h3>
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              Live Sync Active
           </div>
        </div>

        <div className="overflow-x-auto pb-4 no-scrollbar">
          <table className="w-full border-separate border-spacing-y-4 min-w-[1200px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                <th className="px-8 py-2 text-left">Personnel Identity</th>
                <th className="px-8 py-2 text-left">Organization Node</th>
                <th className="px-8 py-2 text-left">Base Magnitude</th>
                <th className="px-8 py-2 text-left">Monthly Metrics</th>
                <th className="px-8 py-2 text-center">Verification Status</th>
                <th className="px-8 py-2 text-right">Directives</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const payroll = payrolls.find(p => p.employeeId?._id === emp._id);
                const isCalculated = !!payroll;

                return (
                  <tr key={emp._id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
                    <td className="px-8 py-6 rounded-l-3xl border-l border-t border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black italic shadow-lg group-hover:bg-indigo-600 transition-colors">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-[15px] font-black text-slate-900 tracking-tighter uppercase italic">{emp.name}</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-t border-b border-slate-100">
                      <div className="space-y-1.5">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                          {emp.designation}
                        </span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{emp.department}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-t border-b border-slate-100">
                      <span className="text-sm font-black font-mono text-slate-700 tracking-tight italic">
                         ₹{(emp.salary?.basic || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-t border-b border-slate-100">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-[11px] font-black text-slate-900">{isCalculated ? payroll.presentDays : '—'}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Present</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black text-rose-500">{isCalculated ? payroll.lopDays : '—'}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">L.O.P</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black text-indigo-500">{isCalculated ? (payroll.paidLeaveDays || 0) : '—'}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Leaves</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-t border-b border-slate-100 text-center">
                       <span className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                         isCalculated 
                          ? (payroll.status === 'Paid' 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                              : 'bg-green-100 text-green-700 border border-green-200') 
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                       }`}>
                         {isCalculated && payroll.status === 'Paid' && <CheckCircle2 size={11} />}
                         {isCalculated ? (payroll.status === 'Paid' ? 'Payment Done' : 'Calculated') : 'Pending'}
                       </span>
                    </td>
                    <td className="px-8 py-6 rounded-r-3xl border-r border-t border-b border-slate-100 text-right">
                      {isCalculated ? (
                        payroll.status === 'Paid' ? (
                          <button
                            onClick={() => { setSelectedPayroll(payroll); setIsPayslipOpen(true); }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200"
                          >
                            <Printer size={14} /> View Slip
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedPayroll(payroll); setIsPayslipOpen(true); }}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                            >
                              <Printer size={14} /> View
                            </button>
                            {isAuthorized && (
                              <button
                                onClick={() => directPay(emp._id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:scale-105 transition-all shadow-md shadow-emerald-500/25"
                              >
                                <CheckCircle2 size={14} /> Pay Now
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <button 
                          onClick={() => viewDraft(emp._id)}
                          className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-indigo-500/20 ${!isAuthorized ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 hover:shadow-xl'}`}
                          disabled={!isAuthorized}
                        >
                           <Eye size={16} /> {isAuthorized ? 'Calculate Vector' : 'Pending Calculation'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
         <div className="p-20 text-center animate-pulse">
            <h4 className="text-lg font-black text-slate-300 uppercase italic tracking-[0.5em]">Syncing Capital Flow...</h4>
         </div>
      )}

      {/* Calculation Modal */}
      {isPreviewModalOpen && draftData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-500 scale-100">
              <div className="flex flex-col md:flex-row h-full">
                 <div className="w-full md:w-[350px] bg-slate-900 p-10 text-white flex flex-col justify-between">
                    <div>
                       <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-8">
                          <DollarSign size={32} />
                       </div>
                       <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Final Magnitude</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-10">Period_{selectedMonth.toString().padStart(2,'0')} Calculation Result</p>
                       
                       <div className="text-6xl font-black tabular-nums tracking-tighter mb-4 italic text-emerald-400">
                          ₹{Math.round(draftData.netSalary).toLocaleString()}
                       </div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Net Disbursement</p>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-white/10">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                          <span>Absence Penalty (LOP)</span>
                          <span className="text-rose-400">-{Math.round(draftData.lopDeduction)}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                          <span>Overtime Bonus</span>
                          <span className="text-emerald-400">+{Math.round(draftData.overtimePay)}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 p-12 bg-slate-50/30 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-center mb-10">
                       <h4 className="text-xl font-black italic uppercase text-slate-900 tracking-tight">Calculation Matrix</h4>
                       <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-300 hover:text-slate-900 font-bold text-2xl">&times;</button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                       <div className="space-y-6">
                          <h6 className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2">Attendance Telemetry</h6>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-2xl font-black text-slate-900 italic leading-none mb-1">{draftData.presentDays}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Days</p>
                             </div>
                             <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-2xl font-black text-rose-500 italic leading-none mb-1">{draftData.lopDays}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">LOP Units</p>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <h6 className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2">Operational Hours</h6>
                          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
                             <p className="text-2xl font-black italic leading-none mb-1">{draftData.workingHours.toFixed(1)}h</p>
                             <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Total Sensor Logs</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 mb-12">
                       <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Capital Breakdown</h5>
                       <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                          <span className="text-xs font-black text-slate-500 uppercase">Fixed Basic Factor</span>
                          <span className="text-sm font-black italic tabular-nums">{Math.round(draftData.baseSalary).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 text-emerald-600">
                          <span className="text-xs font-black uppercase">Aggregate Allowances</span>
                          <span className="text-sm font-black italic tabular-nums">+{(draftData.allowances.food + draftData.allowances.travel).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 text-rose-500">
                          <span className="text-xs font-black uppercase">Late & Absence Penalties</span>
                          <span className="text-sm font-black italic tabular-nums">-{Math.round(draftData.deductions.absent + draftData.deductions.late).toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                       <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all">
                          <Printer size={16} /> Print Ledger
                       </button>
                       {isAuthorized && (
                         <button onClick={finalizePayroll} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all">
                            Finalize Distribution
                         </button>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {isPayslipOpen && selectedPayroll && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="px-12 py-10 bg-slate-900 flex justify-between items-center text-white">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 text-white"><FileText size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black uppercase italic tracking-tight">Digital Salary Slip</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ref Node ID: {selectedPayroll._id?.slice(-12).toUpperCase()}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsPayslipOpen(false)} className="text-white/20 hover:text-white transition-colors font-bold text-3xl">&times;</button>
              </div>

              <div className="p-12 space-y-10">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Personnel Information</p>
                       <h4 className="text-xl font-black text-slate-900 uppercase italic">{selectedPayroll.employeeId?.name}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPayroll.employeeId?.designation} <span className="mx-1 opacity-20">/</span> {selectedPayroll.employeeId?.department}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Cycle Context</p>
                       <h4 className="text-xl font-black text-slate-900 italic">Period_{selectedPayroll.month.toString().padStart(2,'0')}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fiscal Year {selectedPayroll.year}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-50 pb-3">Accumulated Earnings</h5>
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">Core Factor</span>
                          <span className="font-black text-slate-900 tabular-nums">₹{(selectedPayroll.baseSalary || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">Environment Adjust</span>
                          <span className="font-black text-slate-900 tabular-nums">₹{((selectedPayroll.allowances?.food || 0) + (selectedPayroll.allowances?.travel || 0) + (selectedPayroll.allowances?.other || 0)).toLocaleString()}</span>
                       </div>
                       {(selectedPayroll.bonus || 0) > 0 && (
                         <div className="flex justify-between items-center text-xs text-emerald-600">
                            <span className="font-bold uppercase">Service Bonus</span>
                            <span className="font-black tabular-nums">+₹{selectedPayroll.bonus.toLocaleString()}</span>
                         </div>
                       )}
                    </div>
                    <div className="space-y-4">
                       <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-400 border-b border-slate-50 pb-3">Quantum Deductions</h5>
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">Absence Units ({selectedPayroll.lopDays})</span>
                          <span className="font-black text-rose-500 tabular-nums">-₹{(selectedPayroll.deductions?.absent || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">Temporal Precision Fine</span>
                          <span className="font-black text-rose-500 tabular-nums">-₹{(selectedPayroll.deductions?.late || 0).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between items-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="relative z-10">
                       <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Net Disbursed Magnitude</p>
                       <p className="text-4xl font-black tabular-nums tracking-tighter italic">₹{selectedPayroll.netSalary.toLocaleString()}</p>
                    </div>
                    <div className="relative z-10 text-right">
                       <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">Authenticated</div>
                       <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Secured Vector Transfer</p>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all">
                       <Download size={18} /> Persistent Download
                    </button>
                    <button onClick={() => setIsPayslipOpen(false)} className="px-10 py-5 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border border-slate-100 hover:bg-white active:scale-95 transition-all">
                       Dismiss
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PayrollEngine;
