import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  UserCheck,
  TrendingDown
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [viewMode, setViewMode] = useState('Table'); // Table or Calendar

  const loadAttendance = async () => {
    try {
      const res = await api.get(`/api/hr/attendance/date/${date}`);
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
      toast.error('Could not sync attendance data');
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Present': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Late': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Absent': return 'bg-red-50 text-red-600 border-red-100';
      case 'On-leave': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Attendance Operations Center</h2>
          <p className="text-slate-500 font-medium">Verify workforce availability, audit time logs, and manage organizational attendance cycles.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <input 
             type="date" 
             value={date}
             onChange={(e) => setDate(e.target.value)}
             className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
           />
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
             <Plus size={18} /> Bulk Entry
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
         <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
               <UserCheck size={16} className="text-primary-500" /> Daily Verification Ledger
            </h4>
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
               <button 
                  onClick={() => setViewMode('Table')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
               >
                  Table Index
               </button>
               <button 
                  onClick={() => setViewMode('Calendar')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
               >
                  Heatmap
               </button>
            </div>
         </div>

         {viewMode === 'Table' ? (
           <div className="overflow-x-auto">
              <table className="w-full text-left font-bold text-slate-500">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-In</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-Out</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Hours</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {records.map(rec => (
                      <tr key={rec._id} className="hover:bg-slate-50 transition-all group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                  {rec.employeeId?.employeeId?.slice(-2) || '??'}
                                </div>
                               <div>
                                  <p className="font-black text-slate-900 uppercase text-xs leading-none">{rec.employeeId?.name || 'Unknown'}</p>
                                  <p className="text-[10px] uppercase font-black text-slate-300 tracking-tighter mt-1">{rec.employeeId?.department || 'General'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase">
                               <Clock size={14} className="text-emerald-500" />
                               {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase">
                               <Clock size={14} className="text-primary-500" />
                               {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{rec.workingHours || '0'} hrs</span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit flex items-center gap-1.5 ${getStatusStyle(rec.status)}`}>
                                  {rec.status === 'Present' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                  {rec.status}
                               </div>
                               {rec.isLOP && (
                                 <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[8px] font-black uppercase tracking-widest w-fit">LOP Manual</span>
                               )}
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-3">
                               <button 
                                 onClick={async () => {
                                   try {
                                     await api.patch(`/api/hr/attendance/${rec._id}/lop`);
                                     toast.success('LOP Status Updated');
                                     loadAttendance();
                                   } catch (err) {
                                     toast.error('Failed to update LOP');
                                   }
                                 }}
                                 title="Toggle Loss of Pay"
                                 className={`p-2.5 border rounded-xl transition-all shadow-sm ${rec.isLOP ? 'bg-rose-500 text-white border-rose-600' : 'bg-white border-slate-100 text-slate-300 hover:text-rose-600'}`}
                               >
                                  <TrendingDown size={18} />
                               </button>
                               <button className="p-2.5 text-slate-300 hover:text-slate-600">
                                  <MoreVertical size={20} />
                                </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                         <td colSpan="6" className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-4">
                            <CalendarIcon size={64} className="mx-auto" />
                            <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting log entries for {date}.</p>
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
         ) : (
           <div className="p-20 text-center flex flex-col items-center gap-6 opacity-40">
              <div className="w-96 h-64 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center p-10">
                 <div className="grid grid-cols-7 gap-4 w-full h-full opacity-20">
                    {[...Array(28)].map((_, i) => <div key={i} className="bg-primary-400 rounded-lg"></div>)}
                 </div>
              </div>
              <p className="font-black uppercase tracking-[0.4em] text-xs italic">Temporal Heatmap Logic Initializing...</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
