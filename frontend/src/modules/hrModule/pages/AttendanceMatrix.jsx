import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Edit,
  Save,
  Download
} from 'lucide-react';

const AttendanceMatrix = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get(`/api/hr/attendance/date/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to retrieve daily matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleStatusUpdate = async (rec) => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      
      // If it's an 'Absent' user without an attendance record, we might need to handle it differently
      // For now, assume the backend updateAttendance handles upserts or use bulk mark logic
      await axios.put(`/api/hr/attendance/${rec._id}`, { 
        status: editStatus,
        date: selectedDate, // Pass date for potential upsert
        employeeId: rec.employeeId._id // Pass empId for potential upsert
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Matrix overridden successfully');
      setEditingId(null);
      fetchAttendance();
    } catch (err) {
      toast.error('Override Failed');
    }
  };

  const handleSendWarning = async (rec) => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      await axios.post(`/api/hr/attendance/warning`, { 
        employeeId: rec.employeeId._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Warning dispatched to ${rec.employeeId.name}`);
    } catch (err) {
      toast.error('Failed to dispatch warning');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans max-w-[1600px] mx-auto pb-20">
      
      {/* --- REFINED CONTROL CENTER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white border border-slate-200 shadow-sm p-2 rounded-2xl">
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-3.5 rounded-xl border border-slate-200 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:shadow-sm">
               <Calendar size={16} className="text-slate-400" />
               <input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-transparent border-none outline-none font-bold text-slate-700 text-xs uppercase tracking-wider cursor-pointer"
               />
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
               <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">Workforce Map: {records.length} Profiles</span>
            </div>
         </div>

         <div className="flex items-center gap-2 p-1">
            <div className="relative flex-1 sm:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                  type="text" 
                  placeholder="Filter by name/role..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
               />
            </div>
            <button className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white transition-all">
               <Download size={16} />
            </button>
            <button className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10">
               <UserCheck size={14} /> Daily Sync
            </button>
         </div>
      </div>

      {/* --- MATRIX GRID --- */}
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="w-[30%] px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-100">Personnel Identity</th>
                     <th className="w-[18%] px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-100">Check-In</th>
                     <th className="w-[18%] px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-100">Check-Out</th>
                     <th className="w-[18%] px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] border-r border-slate-100">Status Vector</th>
                     <th className="w-[16%] px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-right">Directives</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {records
                    .filter(rec => 
                      rec.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      rec.employeeId?.userId?.role?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-5 border-r border-slate-50">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl ${rec.isAbsent ? 'bg-slate-200' : 'bg-slate-900'} flex items-center justify-center text-white font-black italic shadow-inner border border-white/20 shrink-0`}>
                                {rec.employeeId?.name?.charAt(0) || '?'}
                             </div>
                             <div className="min-w-0">
                                <h4 className="text-sm font-black text-slate-900 tracking-tighter uppercase italic truncate">{rec.employeeId?.name || 'Unknown Node'}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">{rec.employeeId?.userId?.role}</span>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{rec.employeeId?.department}</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5 border-r border-slate-50">
                          <div className={`flex items-center gap-2.5 text-[11px] font-black tabular-nums uppercase ${rec.checkIn ? 'text-slate-600' : 'text-slate-300'}`}>
                             <Clock size={12} className={rec.checkIn ? 'text-indigo-400' : 'text-slate-200'} />
                             {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                       </td>
                       <td className="px-8 py-5 border-r border-slate-50">
                          <div className={`flex items-center gap-2.5 text-[11px] font-black tabular-nums uppercase ${rec.checkOut ? 'text-slate-600' : 'text-slate-300'}`}>
                             <Clock size={12} className={rec.checkOut ? 'text-slate-300' : 'text-slate-200'} />
                             {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                       </td>
                       <td className="px-8 py-5 border-r border-slate-50">
                          {editingId === rec._id ? (
                             <div className="flex items-center gap-1.5">
                                <select 
                                  value={editStatus} 
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="bg-white border-2 border-indigo-100 px-3 py-2 rounded-lg text-[10px] font-black outline-none focus:border-indigo-500 transition-all uppercase"
                                >
                                   <option value="Present">PRESENT</option>
                                   <option value="Late">LATE</option>
                                   <option value="Half-day">HALF-DAY</option>
                                   <option value="Absent">ABSENT</option>
                                   <option value="On-leave">ON-LEAVE</option>
                                </select>
                                <button onClick={() => handleStatusUpdate(rec)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-all">
                                   <Save size={14} />
                                </button>
                             </div>
                          ) : (
                             <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                                rec.status === 'Present' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100' :
                                rec.status === 'Late' ? 'bg-amber-50/50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100' :
                                rec.status === 'Absent' ? 'bg-rose-50/50 text-rose-500 border-rose-100 shadow-sm shadow-rose-100' :
                                'bg-indigo-50/50 text-indigo-600 border-indigo-100'
                             }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  rec.status === 'Present' ? 'bg-emerald-500' : 
                                  rec.status === 'Late' ? 'bg-amber-500' : 
                                  rec.status === 'Absent' ? 'bg-rose-500' : 
                                  'bg-indigo-500'
                                }`}></div>
                                {rec.status}
                             </div>
                          )}
                       </td>
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                           {rec.status === 'Late' && (
                             <button 
                               onClick={() => handleSendWarning(rec)}
                               title="Send Late Warning"
                               className="p-2.5 text-amber-500 hover:text-white hover:bg-amber-500 hover:shadow-sm rounded-xl transition-all border border-amber-100 bg-amber-50/50"
                             >
                                <AlertTriangle size={16} />
                             </button>
                           )}
                           <button 
                             onClick={() => { setEditingId(rec._id); setEditStatus(rec.status); }}
                             className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200"
                           >
                              <Edit size={16} />
                           </button>
                        </td>
                    </tr>
                  ))}

                  {records.length === 0 && !loading && (
                    <tr>
                       <td colSpan="5" className="px-8 py-32 text-center bg-slate-50/30">
                          <div className="flex flex-col items-center gap-4">
                             <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 shadow-sm">
                                <Calendar size={32} />
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Temporal Void Detected</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No operational logs identified for the specified coordinate.</p>
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

export default AttendanceMatrix;
