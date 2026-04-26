import { useState, useEffect } from 'react';
import { Calendar, Plus, Activity, CheckCircle2, XCircle, Clock, X, ChevronDown, Stethoscope, Award, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaves, applyLeave, fetchMyBalance } from '../../redux/slices/hrSlice';

const MyLeaves = () => {
  const dispatch = useDispatch();
  const { leaves, leaveBalance, loading } = useSelector((state) => state.hr);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'Casual', start: '', end: '', reason: '' });

  useEffect(() => {
    dispatch(fetchLeaves());
    dispatch(fetchMyBalance());
  }, [dispatch]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    const data = {
      leaveType: formData.type,
      fromDate: formData.start,
      toDate: formData.end,
      reason: formData.reason,
    };
    await dispatch(applyLeave(data));
    dispatch(fetchMyBalance()); // Refresh balance after application
    setShowModal(false);
    setFormData({ type: 'Casual', start: '', end: '', reason: '' });
  };

  // Helper to map backend balance to UI cards
  const getBalanceCards = () => {
    const casual = leaveBalance?.casual || { remaining: 12, total: 12 };
    const sick = leaveBalance?.sick || { remaining: 10, total: 10 };
    const earned = leaveBalance?.earned || { remaining: 15, total: 15 };
    const compOff = leaveBalance?.compOff || { remaining: 5, total: 5 };

    return [
      { 
        type: 'Casual Leave', 
        remaining: casual.remaining, 
        total: casual.total, 
        color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', iconBg: 'bg-violet-600', icon: Calendar 
      },
      { 
        type: 'Sick Leave', 
        remaining: sick.remaining, 
        total: sick.total, 
        color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-600', icon: Stethoscope 
      },
      { 
        type: 'Earned Leave', 
        remaining: earned.remaining, 
        total: earned.total, 
        color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500', icon: Award 
      },
      { 
        type: 'Comp Off', 
        remaining: compOff.remaining, 
        total: compOff.total, 
        color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', iconBg: 'bg-sky-600', icon: RotateCcw 
      }
    ];
  };

  const balanceCards = getBalanceCards();

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-16 fade-up px-4 md:px-8">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-7 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-8 border-slate-800 group">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-4 py-1.5 bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border border-rose-500/20 flex items-center gap-2">
                <Activity size={12} className="animate-pulse" /> Personnel Hub
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white italic uppercase">
              Leave <span className="text-rose-500">Analytics</span>
            </h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 bg-rose-500 hover:bg-rose-400 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-rose-500/20 transition-all active:scale-95 text-xs"
          >
            <Plus size={18} /> Request Time-Off
          </button>
        </div>
      </div>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100"></div>)
        ) : (
          balanceCards.map((b, i) => {
            const used = b.total - b.remaining;
            const percent = Math.round((used / b.total) * 100) || 0;
            return (
              <div key={i} className={`${b.bg} rounded-[2rem] p-6 border ${b.border} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-4 cursor-default group/card overflow-hidden relative`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -mr-10 -mt-10 blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${b.iconBg} flex items-center justify-center shadow-lg group-hover/card:rotate-12 transition-transform duration-500`}>
                    <b.icon size={22} className="text-white" />
                  </div>
                  <p className={`text-[11px] font-black ${b.color} uppercase tracking-[0.2em]`}>{b.type}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 tabular-nums">{b.remaining}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Days Left</span>
                </div>
                <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden border border-white/20 p-0.5 mt-2">
                  <div className={`h-full rounded-full ${b.color.replace('text-', 'bg-')} transition-all duration-1000 bg-opacity-80`} style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mt-1">
                  <span className="text-slate-400">{used} consumed</span>
                  <span className={b.color}>{percent}% utilized</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LEAVE HISTORY TABLE */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col w-full">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Sequence Log</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Audit trail for all institutional requests</p>
          </div>
        </div>

        <div className="p-8 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Leave Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Span</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Justification</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves && leaves.length > 0 ? leaves.map((r, i) => {
                const durationStr = `${new Date(r.fromDate).toLocaleString('en-US', { month: 'short' })} ${new Date(r.fromDate).getDate()} — ${new Date(r.toDate).toLocaleString('en-US', { month: 'short' })} ${new Date(r.toDate).getDate()}`;
                const leaveLabel = r.leaveType === 'Unpaid' ? 'Work From Home' : `${r.leaveType} Leave`;

                return (
                  <tr key={r._id || i} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-6 py-6 bg-slate-50/50 group-hover:bg-white rounded-l-3xl border-y border-l border-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                        <span className="font-black text-xs text-slate-900 uppercase tracking-wider italic">{leaveLabel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y border-slate-100 bg-slate-50/50 group-hover:bg-white transition-colors">
                      <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 uppercase tracking-widest">
                        {durationStr}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-y border-slate-100 bg-slate-50/50 group-hover:bg-white transition-colors">
                      <span className="text-xs font-medium text-slate-500 italic">"{r.reason}"</span>
                    </td>
                    <td className="px-6 py-6 rounded-r-3xl border-y border-r border-slate-100 bg-slate-50/50 group-hover:bg-white transition-colors text-center">
                      <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        r.status === 'Pending'  ? 'bg-sky-50   text-sky-600   border-sky-200 border-dashed animate-pulse' :
                        r.status === 'Rejected' ? 'bg-rose-50  text-rose-600  border-rose-200 shadow-sm shadow-rose-100/50' :
                                                  'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100/50'
                      }`}>
                        {r.status === 'Pending'  ? <Clock size={12} />        :
                         r.status === 'Rejected' ? <XCircle size={12} />      :
                                                   <CheckCircle2 size={12} />}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                   <td colSpan={4} className="py-24 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                         <Calendar size={40} />
                      </div>
                      <h4 className="text-xl font-black text-slate-400 italic">SYSTEM_AWAITING_INPUT</h4>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-10 border border-slate-100 scale-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 italic uppercase">Temporal Request</h3>
                <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Initiating Protocol Status Update</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-2xl transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Protocol Type</label>
                <div className="relative group">
                  <select
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-800 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Select Protocol</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Earned">Earned Leave</option>
                    <option value="Unpaid">WFH / Remote Duty</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-rose-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Start Sequence</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none"
                    value={formData.start}
                    onChange={(e) => setFormData({...formData, start: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">End Sequence</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none"
                    value={formData.end}
                    onChange={(e) => setFormData({...formData, end: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Justification</label>
                <textarea
                  required
                  rows="3"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-slate-800 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none resize-none italic"
                  placeholder="Operational reason for request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-slate-900/20 transition-all active:scale-[0.98] text-[11px] uppercase tracking-[0.3em] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Authorize Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
