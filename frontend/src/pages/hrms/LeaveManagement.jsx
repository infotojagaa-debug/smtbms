import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  User,
  Check,
  X,
  Inbox,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [balanceFilter, setBalanceFilter] = useState('');

  const loadLeaves = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get('/api/hr/leaves', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setLeaves(res.data);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleUpdateStatus = async (id, status, reason = '') => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.put(`/api/hr/leaves/${id}/status`, { status, rejectionReason: reason }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`Request ${status} successfully`);
      loadLeaves();
    } catch (err) {
      toast.error('Protocol Failure: ' + err.response.data.message);
    }
  };

  const pendingRequests = leaves.filter(l => l.status === 'Pending');
  const historyRequests = leaves.filter(l => l.status !== 'Pending');

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Leave Authorization Center</h2>
          <p className="text-slate-500 font-medium">Verify absence requests, manage unit availability, and enforce organizational leave policies.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
         <div className="px-10 py-2 border-b border-slate-50 bg-slate-50/50">
            <div className="flex gap-10">
               {['Pending', 'History', 'Calendar'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab} Requests
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex-1 p-10">
            {activeTab === 'Pending' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {pendingRequests.map(req => (
                  <div key={req._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all group flex flex-col h-full border-t-8 border-t-primary-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                           {req.employeeId.employeeId.slice(-2)}
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-900 uppercase leading-none">{req.employeeId.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{req.leaveType} Sequence</p>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 flex-1">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-3 italic">Rationale</p>
                        <p className="text-xs font-bold text-slate-700 italic leading-relaxed">"{req.reason}"</p>
                     </div>

                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Duration</p>
                           <p className="text-[11px] font-black text-slate-900 flex items-center gap-1.5"><CalendarIcon size={12} className="text-primary-400" /> {req.totalDays} Days</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Timeframe</p>
                           <p className="text-[10px] font-black text-slate-900">{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="flex gap-4 pt-6 border-t border-slate-50">
                        <button 
                          onClick={() => handleUpdateStatus(req._id, 'Approved')}
                          className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-black uppercase tracking-tighter text-[10px] rounded-2xl shadow-xl hover:bg-primary-600 transition-all active:scale-95"
                        >
                           <Check size={16} /> Authorize
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-400 font-black uppercase tracking-tighter text-[10px] rounded-2xl border border-slate-100 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
                        >
                           <X size={16} /> Discard
                        </button>
                     </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-20 text-slate-400 italic">
                     <Inbox size={64} strokeWidth={1} />
                     <p className="font-black uppercase tracking-[0.4em] text-xs">No pending leave requests in protocol.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'History' && (
               <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left font-bold text-slate-500">
                     <thead className="bg-slate-50">
                        <tr>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {historyRequests.map(h => (
                          <tr key={h._id} className="hover:bg-slate-50 transition-all">
                             <td className="px-8 py-5">
                                <p className="font-black text-slate-900 text-xs uppercase leading-none">{h.employeeId.name}</p>
                             </td>
                             <td className="px-8 py-5">
                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{h.leaveType}</span>
                             </td>
                             <td className="px-8 py-5">
                                <p className="text-[10px] font-black text-slate-400">{h.totalDays} Days Sequence</p>
                             </td>
                             <td className="px-8 py-5">
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${
                                   h.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                   {h.status}
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
