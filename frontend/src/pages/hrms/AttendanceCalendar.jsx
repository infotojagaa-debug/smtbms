import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAttendance, checkIn, checkOut, reset } from '../../redux/slices/hrmsSlice';
import { 
  Clock, 
  MapPin, 
  LogIn, 
  LogOut, 
  Calendar as CalendarIcon, 
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceCalendar = () => {
  const dispatch = useDispatch();
  const { attendance, isLoading, isError, message } = useSelector((state) => state.hrms);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchMyAttendance());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      dispatch(reset());
    };
  }, [dispatch]);

  const todayRecord = attendance.find(a => {
    const d = new Date(a.date);
    const now = new Date();
    return d.getDate() === now.getDate() && 
           d.getMonth() === now.getMonth() && 
           d.getFullYear() === now.getFullYear();
  });

  const handleCheckIn = () => {
    dispatch(checkIn());
    toast.success('Check-in record committed');
  };

  const handleCheckOut = () => {
    dispatch(checkOut());
    toast.success('Shift completed successfully');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Daily Performance Terminal</h2>
          <p className="text-slate-500 font-medium">Capture your shift metrics and verify active duty status.</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-6">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Local Server Time</p>
              <h4 className="text-2xl font-black text-slate-900 font-mono italic">{currentTime.toLocaleTimeString()}</h4>
           </div>
           <div className="w-[1px] h-10 bg-slate-100"></div>
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 font-black text-emerald-500 uppercase text-xs">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Secure Connection
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Terminal Controls */}
        <div className="lg:col-span-2 space-y-10">
           <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border-8 border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-20 blur-[100px]"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                 <div className="shrink-0 space-y-4 text-center md:text-left">
                    <div className="w-32 h-32 rounded-[2.5rem] border-4 border-slate-700 p-2 flex items-center justify-center bg-slate-800 shadow-inner">
                       <Clock size={48} className="text-primary-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Terminal Active</p>
                 </div>

                 <div className="flex-1 space-y-8 text-center md:text-left">
                    <div>
                       <h3 className="text-4xl font-black tracking-tight mb-2">Shift Sequence</h3>
                       <p className="text-slate-400 font-medium">Commence or finalize your daily operational duty log.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                       {!todayRecord?.checkIn ? (
                         <button 
                           onClick={handleCheckIn}
                           disabled={isLoading}
                           className="flex items-center gap-3 px-10 py-5 bg-primary-600 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary-500/20 hover:bg-primary-500 transition-all active:scale-95 disabled:opacity-50"
                         >
                            <LogIn size={20} /> Start Duty
                         </button>
                       ) : !todayRecord?.checkOut ? (
                         <button 
                           onClick={handleCheckOut}
                           disabled={isLoading}
                           className="flex items-center gap-3 px-10 py-5 bg-emerald-600 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                         >
                            <LogOut size={20} /> End Duty
                         </button>
                       ) : (
                         <div className="flex items-center gap-3 px-10 py-5 bg-slate-800 rounded-3xl font-black uppercase tracking-widest text-[11px] border border-slate-700 text-slate-400">
                            <CheckCircle2 size={20} className="text-emerald-500" /> Session Finalized
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {todayRecord?.checkIn && (
                <div className="mt-12 pt-10 border-t border-slate-800 flex flex-wrap gap-12">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Commenced at</p>
                      <p className="text-lg font-black font-mono">{new Date(todayRecord.checkIn).toLocaleTimeString()}</p>
                   </div>
                   {todayRecord.checkOut && (
                     <>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Finalized at</p>
                           <p className="text-lg font-black font-mono">{new Date(todayRecord.checkOut).toLocaleTimeString()}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Total Duration</p>
                           <p className="text-lg font-black font-mono text-emerald-400">{todayRecord.totalHours} hrs</p>
                        </div>
                     </>
                   )}
                </div>
              )}
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Efficiency Rate</p>
                 <h4 className="text-2xl font-black text-slate-900">94%</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Pulse</p>
                 <h4 className="text-2xl font-black text-slate-900">8.2 hrs</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2 hidden md:block">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lateness index</p>
                 <h4 className="text-2xl font-black text-emerald-600">0.02</h4>
              </div>
           </div>
        </div>

        {/* History Feed */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                 <History size={16} className="text-primary-500" />
                 Shift Journal
              </h4>
           </div>
           <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {attendance.map((record) => (
                <div key={record._id} className="relative pl-8 border-l-2 border-slate-100 pb-2">
                   <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                     record.status === 'Present' ? 'bg-emerald-500' : 'bg-amber-400'
                   }`}></div>
                   <div className="flex justify-between items-start mb-1">
                      <p className="font-black text-slate-900 text-xs italic">{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{record.totalHours || '0'}h</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                     {new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} — 
                     {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'ACTIVE'}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
