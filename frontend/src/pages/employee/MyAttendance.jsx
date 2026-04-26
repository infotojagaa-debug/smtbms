import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckCircle2, Timer, Coffee, Fingerprint, Calendar as CalendarIcon, ArrowRight, Zap, Activity, Clock } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MyAttendance = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  
  const [punchState, setPunchState] = useState('none');
  const [stampIn, setStampIn] = useState(null);
  const [stampOut, setStampOut] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('0.0');
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [monthLeaves, setMonthLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, totalDays: 30 });
  const [joiningDate, setJoiningDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const ledgerRef = useRef(null);

  // Helper to change month
  const changeMonth = (offset) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };


  // Resilient ISO Date Helper (UTC-safe)
  const toISODate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // If it's a date-only string from DB, it's often UTC. 
    // To get the correct YYYY-MM-DD regardless of local time shifted by hours:
    return d.toISOString().split('T')[0];
  };

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/api/hr/attendance/today');
      if (res.data) {
        setStampIn(new Date(res.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (res.data.checkOut) {
          setStampOut(new Date(res.data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setPunchState('out');
          setHoursWorked(res.data.workingHours.toFixed(1));
        } else {
          setPunchState('in');
        }
      } else {
        setPunchState('none');
        setStampIn(null);
        setStampOut(null);
      }
    } catch (err) {
      console.error('Failed to sync today status:', err);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setIsLoading(true);
      const m = viewDate.getMonth() + 1;
      const y = viewDate.getFullYear();
      const res = await api.get(`/api/hr/attendance/my/monthly?month=${m}&year=${y}`);
      if (res.data) {
        setMonthlyHistory(res.data.history);
        setMonthLeaves(res.data.monthLeaves || []);
        setHolidays(res.data.holidays || []);
        setJoiningDate(res.data.joiningDate);
        setStats({
          present: res.data.statistics.daysPresent,
          absent: res.data.statistics.daysAbsent,
          totalDays: res.data.statistics.totalDaysInMonth
        });
      }
    } catch (err) {
      console.error('Failed to sync monthly attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const midnightCheck = setInterval(() => {
       const now = new Date();
       if (now.getHours() === 0 && now.getMinutes() === 0) {
          fetchTodayStatus();
          fetchMonthlyData();
       }
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(midnightCheck);
    };
  }, []);

  useEffect(() => {
     fetchMonthlyData();
  }, [viewDate]);


  const fullLog = useMemo(() => {
    const historyLogs = monthlyHistory.map(rec => ({
      date: new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      in: new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      out: rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:-- --',
      hours: rec.workingHours ? rec.workingHours.toFixed(1) + 'h' : '--',
      status: rec.status,
      isCurrent: new Date(rec.date).toDateString() === new Date().toDateString()
    })).reverse();

    return historyLogs;
  }, [monthlyHistory]);

  const handlePunchIn = async () => {
    try {
      const res = await api.post('/api/hr/attendance/checkin');
      setStampIn(new Date(res.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setPunchState('in');
      toast.success('Check-in successful');
      fetchMonthlyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handlePunchOut = async () => {
    try {
      const res = await api.post('/api/hr/attendance/checkout');
      setStampOut(new Date(res.data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHoursWorked(res.data.workingHours.toFixed(1));
      setPunchState('out');
      toast.success('Check-out successful');
      fetchMonthlyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-8 fade-up font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-1 shadow-2xl group border border-rose-500/10 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900"></div>
        <div className="relative rounded-[2.3rem] bg-white/[0.01] backdrop-blur-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border border-rose-500/20 flex items-center gap-2 animate-pulse">
                  <Activity size={14} /> Global Presence Node
                </span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white italic uppercase leading-none mb-4">
                Attendance <span className="text-rose-500">Core</span>
             </h2>
             <p className="text-slate-400 font-bold text-xs max-w-sm tracking-tight leading-relaxed opacity-60">
                Synchronizing bio-metrics with enterprise logic. Real-time observability for high-output environments.
             </p>
          </div>

          <div className="flex gap-6">
             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md text-center min-w-[130px] shadow-xl">
                <span className="block text-4xl font-black text-emerald-400 leading-none mb-2 tabular-nums">{stats.present}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Active</p>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md text-center min-w-[130px] shadow-xl">
                <span className="block text-4xl font-black text-rose-400 leading-none mb-2 tabular-nums">{stats.absent}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Absent</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* TIME & BUTTON */}
        <div className="lg:col-span-4 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center relative overflow-hidden group min-h-[500px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
          
          <div className="relative mb-12">
             <div className="w-48 h-48 rounded-full p-2 bg-gradient-to-tr from-slate-100 to-rose-50 shadow-inner flex items-center justify-center relative">
                <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent"></div>
                   <h1 className="text-5xl font-black text-white tabular-nums drop-shadow-2xl">
                     {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                   </h1>
                   <div className="flex items-center gap-2 mt-4">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.5em] tabular-nums">
                        {currentTime.getSeconds().toString().padStart(2, '0')}
                      </p>
                   </div>
                </div>
             </div>
             <div className="absolute -inset-6 border border-rose-100 rounded-full animate-spin-slow opacity-40 border-dashed"></div>
          </div>

          <div className="w-full max-w-xs space-y-6">
             {punchState === 'none' && (
                <button onClick={handlePunchIn} className="w-full group shadow-2xl relative overflow-hidden bg-slate-900 text-white rounded-[2rem] py-6 transition-all hover:scale-[1.03] active:scale-95 border-b-4 border-slate-950">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 opacity-20"></div>
                  <div className="relative flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-xs">
                    <Fingerprint size={24} className="text-rose-500" /> Mark Presence
                  </div>
                </button>
             )}

             {punchState === 'in' && (
                <>
                  <button onClick={handlePunchOut} className="w-full group shadow-2xl relative overflow-hidden bg-rose-500 text-white rounded-[2rem] py-6 transition-all hover:scale-[1.03] active:scale-95 border-b-4 border-rose-700">
                    <div className="relative flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-xs">
                      <Clock size={24} className="animate-spin-slow" /> Sign Off
                    </div>
                  </button>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Interval</span>
                     <span className="text-3xl font-black text-slate-800 tabular-nums">{hoursWorked}h</span>
                  </div>
                </>
             )}

             {punchState === 'out' && (
                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-center shadow-xl">
                   <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 text-white">
                      <CheckCircle2 size={32} />
                   </div>
                   <h4 className="text-xl font-black text-emerald-800 uppercase italic mb-1">Cycle Finalized</h4>
                   <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">{hoursWorked} Hours Transferred</p>
                </div>
             )}
          </div>
        </div>

        {/* CALENDAR MATRIX */}
        <div className="lg:col-span-8 bg-white rounded-[4rem] p-10 border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] flex flex-col">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
               <div className="text-center md:text-left">
                  <div className="flex items-center gap-4 mb-2">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
                        Monthly Matrix <Zap size={24} className="text-rose-500 fill-rose-500" />
                     </h3>
                     <div className="flex gap-2">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                           <ArrowRight className="rotate-180" size={14} />
                        </button>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                           <ArrowRight size={14} />
                        </button>
                     </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">
                    {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
               </div>
              
              <div className="flex flex-wrap justify-center gap-4 px-6 py-3 bg-slate-50 rounded-3xl border border-slate-100">
                 {[
                    { label: 'PRESENT', color: 'bg-emerald-500' },
                    { label: 'ABSENT', color: 'bg-rose-500' },
                    { label: 'LEAVE', color: 'bg-amber-500' },
                    { label: 'HOLIDAY', color: 'bg-slate-900' },
                    { label: 'NULL', color: 'bg-slate-200' }
                 ].map(item => (
                   <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-7 gap-3 md:gap-4 flex-1">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="h-10 flex items-center justify-center opacity-30">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{day}</span>
                </div>
              ))}

              {(() => {
                const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
                const paddingCount = (firstDay + 6) % 7;
                return Array.from({ length: paddingCount }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-16 md:h-20 rounded-[1.5rem] bg-slate-50/20 border-2 border-dashed border-slate-50/50"></div>
                ));
              })()}

              {Array.from({ length: stats.totalDays || 30 }).map((_, i) => {
                const dayNum = i + 1;
                const dObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum, 12, 0, 0);
                const dateStr = toISODate(dObj);
                
                // DATA MAPPING
                const attRec = monthlyHistory.find(r => toISODate(r.date) === dateStr);
                const hRec = holidays.find(h => toISODate(h.date) === dateStr);
                const leaveRec = monthLeaves.find(l => {
                   const s = toISODate(l.fromDate);
                   const e = toISODate(l.toDate);
                   return dateStr >= s && dateStr <= e;
                });

                const today = new Date();
                const isToday = dayNum === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
                const isPast = dObj < new Date(today.setHours(0,0,0,0));
                const isFuture = dObj > new Date(today.setHours(23,59,59,999));
                const isSunday = dObj.getDay() === 0;

                // Priority Logic
                let status = 'OPN';
                const joinStr = joiningDate ? toISODate(joiningDate) : '1970-01-01';
                const isPreInduction = dateStr < joinStr;

                if (isPreInduction) {
                  status = 'OPN';
                } else if (leaveRec && leaveRec.status === 'Approved') {
                  status = 'APP';
                } else if (hRec || isSunday) {
                  status = 'HOL';
                } else if (leaveRec && leaveRec.status === 'Pending') {
                  status = 'PEN';
                } else if (attRec) {
                  status = 'PRE';
                } else if (isFuture) {
                  status = 'FUT';
                } else if (isPast) {
                  status = 'ABS';
                }


                const theme = {

                   'PRE': 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-500/10',
                   'ABS': 'bg-rose-50 text-rose-500 border-rose-200 shadow-rose-500/10',
                   'APP': 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-500/10',
                   'PEN': 'bg-sky-50 text-sky-500 border-sky-200 border-dashed animate-pulse shadow-sky-500/10',
                   'HOL': 'bg-slate-900 text-white border-slate-800 shadow-xl',
                   'OPN': 'bg-white text-slate-300 border-slate-100 shadow-sm',
                   'FUT': 'bg-slate-50/50 text-slate-300 border-slate-100'
                }[status];


                if (isToday && status === 'OPN') {
                   // Special "Not yet signed in" pulse
                   return (
                      <div key={dayNum} className="h-16 md:h-20 rounded-[1.8rem] bg-indigo-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-indigo-500/40 relative transform scale-110 z-10 animate-pulse">
                         <span className="text-xl font-black">{dayNum.toString().padStart(2, '0')}</span>
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1">Ready</span>
                      </div>
                   );
                }

                return (
                  <div key={dayNum} className={`h-16 md:h-20 rounded-[1.8rem] border-2 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 cursor-default relative overflow-hidden group ${theme}`}>
                    <span className="text-xl font-black drop-shadow-sm">{dayNum.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] font-black uppercase mt-1 tracking-widest opacity-80">{status}</span>
                    {status === 'HOL' && <div className="absolute top-1 right-3 text-[7px] text-rose-400 font-bold italic rotate-12">EXIT</div>}
                    {status === 'ABS' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/my-leaves');
                        }}
                        className="absolute inset-0 bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <Zap size={14} />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Apply Leave</span>
                      </button>
                    )}
                  </div>
                );


              })}
           </div>
        </div>

        {/* LEDGER */}
        <div ref={ledgerRef} className="lg:col-span-12 bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
          <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
                   Protocol Ledger <Activity size={24} className="text-emerald-500" />
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Historical data retrieval node</p>
             </div>
             <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-inner flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">LIVE_SYNC_READY</span>
             </div>
          </div>
          
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr>
                  <th className="px-8 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Point</th>
                  <th className="px-8 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Session Bounds</th>
                  <th className="px-8 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Magnitude</th>
                  <th className="px-8 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Validation</th>
                </tr>
              </thead>
              <tbody>
                 {fullLog.map((h, i) => (
                   <tr key={i} className="group hover:-translate-y-1 transition-all duration-300">
                     <td className="px-8 py-6 rounded-l-[2rem] bg-slate-50/50 group-hover:bg-slate-900 group-hover:text-white transition-all border-y border-l border-slate-100 group-hover:border-slate-900">
                        <span className="text-sm font-black italic">{h.date}</span>
                     </td>
                     <td className="px-8 py-6 bg-slate-50/50 group-hover:bg-slate-900 group-hover:text-white transition-all border-y border-slate-100 group-hover:border-slate-900 text-xs font-mono font-bold tracking-tight">
                        {h.in} <span className="mx-2 opacity-30 group-hover:text-rose-500">{" >> "}</span> {h.out}
                     </td>
                     <td className="px-8 py-6 bg-slate-50/50 group-hover:bg-slate-900 group-hover:text-white transition-all border-y border-slate-100 group-hover:border-slate-900 text-right font-black text-base tabular-nums">
                        {h.hours}
                     </td>
                     <td className="px-8 py-6 rounded-r-[2rem] bg-slate-50/50 group-hover:bg-slate-900 group-hover:text-white transition-all border-y border-r border-slate-100 group-hover:border-slate-900 text-center">
                        <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          h.status === 'On Duty' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400'
                        }`}>
                          {h.status}
                        </span>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
