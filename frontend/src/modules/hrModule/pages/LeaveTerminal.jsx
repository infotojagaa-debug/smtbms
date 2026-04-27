import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Calendar,
  AlertCircle,
  TrendingUp,
  User,
  ExternalLink
} from 'lucide-react';

const LeaveTerminal = () => {
  const { user } = useSelector((state) => state.auth);
  const isAuthorized = ['Admin', 'HR'].includes(user?.role);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Pending');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get('/api/hr/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error('Leave requests protocol sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      await axios.put(`/api/hr/leaves/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Request ${status === 'Approved' ? 'Authorized' : 'Rejected'}`);
      fetchLeaves();
    } catch (err) {
      toast.error('Authorization Override Failed');
    }
  };

  const filteredLeaves = leaves.filter(l => l.status === filterStatus || filterStatus === 'All');

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans max-w-[1600px] mx-auto pb-20">
      
      {/* --- FORMAL METRICS RIBBON --- */}
      <div grid-cols-1 sm:grid-cols-2>
        {[
          { label: 'Pending Terminal', value: leaves.filter(l => l.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100' },
          { label: 'Authorized Logs', value: leaves.filter(l => l.status === 'Approved').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
          { label: 'Redacted Sequences', value: leaves.filter(l => l.status === 'Rejected').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-100' },
          { label: 'Global Registry', value: leaves.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} flex items-center justify-between group transition-all hover:shadow-sm`}>
             <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{stat.label}</p>
                <h4 className="text-2xl font-black text-slate-900 tabular-nums italic tracking-tighter">{stat.value.toString().padStart(2, '0')}</h4>
             </div>
             <div className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                <stat.icon size={24} />
             </div>
          </div>
        ))}
      </div>

      {/* --- CONTROL & MATRIX CENTER --- */}
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden flex flex-col">
         <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <h3 className="text-xs font-black tracking-[0.3em] flex items-center gap-3 uppercase text-slate-400">
               <TrendingUp size={14} className="text-indigo-600" /> Organizational Leave Matrix
            </h3>
            <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
               {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
                 <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    filterStatus === s ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                 >
                   {s}
                 </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
               <thead>
                  <tr className="bg-white border-b border-slate-100">
                     <th className="w-[28%] px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-50">Personnel</th>
                     <th className="w-[15%] px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-50">Variant</th>
                     <th className="w-[22%] px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-50">Temporal Span</th>
                     <th className="w-[20%] px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-50">Status Vector</th>
                     <th className="w-[15%] px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-right">Directives</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-5 border-r border-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black italic shadow-inner border border-white/10 shrink-0">
                                {leave.employeeId?.name?.charAt(0) || '?'}
                             </div>
                             <div className="min-w-0">
                                <h4 className="text-sm font-black text-slate-900 tracking-tighter uppercase italic truncate">{leave.employeeId?.name || 'Unknown Node'}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{leave.employeeId?.department || 'Sector Null'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5 border-r border-slate-50">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                             {leave.leaveType}
                          </span>
                       </td>
                       <td className="px-8 py-5 border-r border-slate-50">
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 tabular-nums uppercase">
                                <Calendar size={12} className="text-slate-300" />
                                {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 truncate italic">"{leave.reason}"</p>
                          </div>
                       </td>
                       <td className="px-8 py-5 border-r border-slate-50">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                             leave.status === 'Pending' ? 'bg-amber-50/50 text-amber-600 border-amber-100 animate-pulse' :
                             leave.status === 'Approved' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100' :
                             'bg-rose-50/50 text-rose-500 border-rose-100'
                          }`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${leave.status === 'Pending' ? 'bg-amber-500' : leave.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                             {leave.status}
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right">
                          {leave.status === 'Pending' ? (
                             isAuthorized ? (
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                    className="p-2.5 bg-white text-rose-500 border border-slate-200 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                                    title="Reject Request"
                                  >
                                     <XCircle size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                    className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10"
                                    title="Authorize Request"
                                  >
                                     <CheckCircle size={16} />
                                  </button>
                               </div>
                             ) : (
                               <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest italic">Awaiting Auth</span>
                             )
                          ) : (
                             <button className={`p-2.5 text-slate-300 ${!isAuthorized ? 'cursor-default' : 'cursor-not-allowed'}`}>
                                <ExternalLink size={16} />
                             </button>
                          )}
                       </td>
                    </tr>
                  ))}

                  {filteredLeaves.length === 0 && !loading && (
                    <tr>
                       <td colSpan="5" className="px-8 py-32 text-center bg-slate-50/30">
                          <div className="flex flex-col items-center gap-4">
                             <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 shadow-sm">
                                <AlertCircle size={32} />
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Registry Empty</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No leave sequences identified for the current status vector.</p>
                             </div>
                          </div>
                       </td>
                    </tr>
                   )}
               </tbody>
            </table>
         </div>

         {loading && (
            <div className="flex-1 flex items-center justify-center p-20">
               <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Syncing Matrix...</span>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default LeaveTerminal;
