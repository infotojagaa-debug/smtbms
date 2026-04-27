import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar, Clock, DollarSign, CheckCircle2,
  Coffee, Sun, Sunset, Moon, ArrowRight, Bell, Sparkles,
  AlertCircle, Fingerprint, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: Sun };
  if (h < 17) return { text: 'Good Afternoon', icon: Coffee };
  if (h < 20) return { text: 'Good Evening', icon: Sunset };
  return { text: 'Good Night', icon: Moon };
};

const formatDateLocal = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [punchState, setPunchState] = useState('none');
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [hoursWorked, setHoursWorked] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const greeting = getGreeting();

  const applyPunchState = (att) => {
    if (!att) {
      setPunchState('none'); setPunchInTime(null); setPunchOutTime(null); setHoursWorked(null);
      return;
    }
    if (att.checkOut) {
      setPunchState('out');
      setPunchInTime(new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setPunchOutTime(new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHoursWorked(att.workingHours ? att.workingHours.toFixed(1) : null);
    } else if (att.checkIn) {
      setPunchState('in');
      setPunchInTime(new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setPunchOutTime(null); setHoursWorked(null);
    } else {
      setPunchState('none'); setPunchInTime(null); setPunchOutTime(null); setHoursWorked(null);
    }
  };

  const loadStats = async () => {
    const [analyticsResult, todayResult] = await Promise.allSettled([
      api.get(`/api/analytics/employee?t=${Date.now()}`),
      api.get('/api/hr/attendance/today')
    ]);
    if (analyticsResult.status === 'fulfilled') {
      setStats(analyticsResult.value.data);
    } else {
      setStats(prev => prev || {
        employee: { name: user?.name, department: 'General', designation: 'Employee' },
        todayAttendance: null, myPendingLeaves: 0,
        attendance: { present: 0, absent: 0, late: 0, leave: 0, totalDays: 30, daysLogged: 0 },
        leaveBalance: [], announcements: [], holidays: [], monthLeaves: []
      });
    }
    if (todayResult.status === 'fulfilled') {
      applyPunchState(todayResult.value.data);
    } else if (analyticsResult.status === 'fulfilled') {
      applyPunchState(analyticsResult.value.data?.todayAttendance);
    }
  };

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setPunchState('none'); setPunchInTime(null); setPunchOutTime(null); setHoursWorked(null);
        loadStats();
      }
    }, 60000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') loadStats(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', loadStats);
    return () => {
      clearInterval(timer); clearInterval(midnightCheck);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', loadStats);
    };
  }, [user]);

  const handlePunchAction = () => navigate('/my-attendance');

  if (!stats) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl">
          <Sparkles size={28} className="text-indigo-400" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
      </div>
    </div>
  );

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const firstName = (user?.name || 'User').split(' ')[0];
  const calYear = currentTime.getFullYear();
  const calMonth = currentTime.getMonth();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const todayDate = currentTime.getDate();
  const daysLogged = stats.attendance?.daysLogged ?? stats.attendance?.present ?? 0;
  const daysInMonth = stats.attendance?.totalDays || new Date(calYear, calMonth + 1, 0).getDate();

  const statCards = [
    {
      label: 'Present Days',
      val: stats.attendance?.present || 0, suffix: `/ ${daysInMonth} d`,
      bLeft: 'This Month', bRight: `${Math.round(((stats.attendance?.present || 0) / daysInMonth) * 100) || 0}%`,
      icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-600'
    },
    {
      label: 'Absent Days',
      val: stats.attendance?.absent || 0, suffix: `/ ${daysInMonth} d`,
      bLeft: 'Loss of Pay', bRight: `${Math.round(((stats.attendance?.absent || 0) / daysInMonth) * 100) || 0}%`,
      icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-600'
    },
    {
      label: 'Pending Leave',
      val: stats.attendance?.pendingLeave || 0, suffix: ` days`,
      bLeft: 'Awaiting HR', bRight: `${Math.round(((stats.attendance?.pendingLeave || 0) / daysInMonth) * 100) || 0}%`,
      icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', iconBg: 'bg-sky-500'
    },
    {
      label: 'Approved Leave',
      val: stats.attendance?.approvedLeave || 0, suffix: ` days`,
      bLeft: 'Monthly Quota', bRight: `${Math.round(((stats.attendance?.approvedLeave || 0) / daysInMonth) * 100) || 0}%`,
      icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500'
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-8 font-sans space-y-5">

      {/* â”€â”€ WELCOME BANNER â”€â”€ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f0c29] via-[#1a1a3e] to-[#24243e] p-5 md:p-6 shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-violet-500/8 rounded-full blur-[70px] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 40 L 40 40 40 0' fill='none' stroke='white' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")" }}>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                <span className="text-base font-black text-white">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 border-2 border-[#1a1a3e] flex items-center justify-center shadow-md">
                <greeting.icon size={10} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/35 text-[9px] font-semibold uppercase tracking-widest mb-0.5">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
                {greeting.text}, <span className="text-indigo-300">{firstName}</span> 👋
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-white/10 text-white/65 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/10">
                  {stats.employee?.department || 'General'}
                </span>
                <span className="text-[10px] text-white/25 font-medium uppercase tracking-widest">
                  {stats.employee?.designation || user?.role || 'Employee'}
                </span>
              </div>
            </div>
          </div>

          {/* Right â€” Attendance CTA */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 self-center">
            {punchState === 'none' && (
              <button onClick={handlePunchAction}
                className="group flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 hover:bg-indigo-500/35 hover:border-indigo-400/50 transition-all duration-200 active:scale-95 shadow-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500 text-white group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/40">
                  <Fingerprint size={17} />
                </div>
                Check In
              </button>
            )}
            {punchState === 'in' && (
              <div className="flex flex-col items-end gap-2">
                <button onClick={handlePunchAction}
                  className="group flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all duration-200 active:scale-95 shadow-lg">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500 text-white group-hover:scale-110 transition-transform shadow-md shadow-rose-500/40">
                    <Fingerprint size={17} />
                  </div>
                  Check Out
                </button>
                {punchInTime && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">In @ {punchInTime}</span>
                  </div>
                )}
              </div>
            )}
            {punchState === 'out' && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white flex-shrink-0 shadow-md shadow-emerald-500/30">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">Punched Out At</p>
                    <p className="text-sm font-black text-emerald-400 tabular-nums">{punchOutTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                  <span>In: <span className="text-white/55">{punchInTime}</span></span>
                  <span className="opacity-30">|</span>
                  <span>Out: <span className="text-white/55">{punchOutTime}</span></span>
                  {hoursWorked && <><span className="opacity-30">|</span><span className="text-indigo-300">{hoursWorked}h</span></>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ STAT CARDS â”€â”€ */}
      <div grid-cols-1 sm:grid-cols-2>
        {statCards.map((m, i) => (
          <div 
            key={i} 
            onClick={() => {
              if (m.label === 'Pending Leave' || m.label === 'Approved Leave') {
                navigate('/my-leaves');
              }
            }}
            className={`${m.bg} rounded-[1rem] p-4 border ${m.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2.5 ${(m.label === 'Pending Leave' || m.label === 'Approved Leave') ? 'cursor-pointer hover:border-indigo-400' : 'cursor-default'} group/card`}
          >
            {/* Top row: icon + type */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${m.iconBg} flex items-center justify-center shadow-md group-hover/card:scale-110 transition-transform duration-300 flex-shrink-0`}>
                <m.icon size={15} className="text-white" />
              </div>
              <p className={`text-[10px] font-black ${m.color} uppercase tracking-wider leading-tight`}>{m.label}</p>
            </div>

            {/* Balance */}
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-slate-900 leading-none tabular-nums mt-1">{m.val}</span>
              {m.suffix && <span className="text-xs font-bold text-slate-400"> {m.suffix}</span>}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/70 rounded-full overflow-hidden my-1">
              <div className={`h-full rounded-full ${m.iconBg} transition-all duration-700 opacity-80`} style={{ width: m.bRight ? m.bRight : '0%' }}></div>
            </div>

            {/* Used / remaining */}
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-500">{m.bLeft}</span>
              {m.bRight && <span className={m.color}>{m.bRight} utilised</span>}
            </div>
          </div>
        ))}
      </div>

      {/* â”€â”€ SALARY STRIP â”€â”€ */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl px-6 py-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-800 gap-4 mt-2">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/5"></div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1 leading-none">Estimated Net Pay</p>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-xl font-bold text-slate-400">₹</span>

              <h4 className="text-3xl font-black text-white leading-none tracking-tight tabular-nums">
                {(Math.round(stats.netEarnings || 0) / 1000).toFixed(1)}K
              </h4>
              <span className="text-xs font-semibold text-slate-500 ml-1 hidden sm:inline">This Month</span>
            </div>
          </div>
        </div>
        
        <button onClick={() => navigate('/my-salary')}
          className="relative z-10 w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all border border-white/10 hover:border-emerald-500/30 active:scale-95 flex justify-center items-center gap-1.5 group">
          STATEMENT <ArrowRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* â”€â”€ BOTTOM ROW â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Notifications */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-md border border-slate-200 ring-1 ring-slate-200/60 flex flex-col overflow-hidden min-h-[400px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Notifications & Reminders</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Live Sync Active</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white hover:bg-slate-700 transition-colors shadow">
              <Bell size={14} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {stats.announcements && stats.announcements.length > 0
              ? stats.announcements.map((notif) => (
                <div key={notif._id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 bg-slate-50/60 transition-all cursor-pointer flex gap-3 items-start">
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.priority === 'High' ? 'bg-rose-500' : 'bg-indigo-400'}`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-0.5">
                      <h5 className="font-bold text-slate-800 text-sm truncate">{notif.title}</h5>
                      <span className="text-[9px] font-semibold text-slate-400 flex-shrink-0">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">{notif.desc}</p>
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600">
                          {notif.author?.name?.charAt(0) || 'S'}
                       </div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{notif.author?.name || 'System'}</span>
                       <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${notif.author?.role === 'Admin' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                          {notif.author?.role || 'Authority'}
                       </span>
                    </div>
                  </div>
                </div>
              ))
              : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
                    <Bell size={22} className="text-slate-300" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">No Active Broadcasts</p>
                  <p className="text-[10px] text-slate-300 mt-1">You're all caught up!</p>
                </div>
              )
            }
          </div>

          <div className="px-4 pb-4 flex justify-end">
            <button 
              onClick={() => navigate('/announcements')}
              className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-4">

          {/* Calendar */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 ring-1 ring-slate-200/60">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800">Calendar</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <ArrowRight className="rotate-180" size={13} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-50 mb-3 pb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-[9px] font-black uppercase text-slate-400 tracking-widest py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {/* Row alignment based on Monday start */}
              {Array.from({ length: (firstDayOfWeek + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-[4/5] opacity-0"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dObj = new Date(calYear, calMonth, day);
                const dateStr = formatDateLocal(dObj);
                const isToday = day === todayDate && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();
                const isFuture = dObj > new Date();

                const attendanceMatch = stats.monthlyHistory?.find(h => formatDateLocal(h.date) === dateStr);
                const holidayMatch = stats.holidays?.find(h => formatDateLocal(h.date) === dateStr);
                const leaveMatch = stats.monthLeaves?.find(l => {
                  const s = formatDateLocal(l.fromDate);
                  const e = formatDateLocal(l.toDate);
                  return dateStr >= s && dateStr <= e;
                });

                const isSunday = dObj.getDay() === 0;
                let statusLabel = isFuture ? 'FUT' : 'OPN';
                let cardTheme = 'bg-slate-50/50 text-slate-300 border-slate-100';

                // Priority Logic
                if (holidayMatch || isSunday) {
                   statusLabel = 'HOL';
                   cardTheme = 'bg-rose-50 text-rose-500 border-rose-200 shadow-sm shadow-rose-100/50 cursor-pointer';
                } else if (leaveMatch) {
                   if (leaveMatch.status === 'Approved') {
                      statusLabel = 'APP';
                      cardTheme = 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100/50';
                   } else {
                      statusLabel = 'PEN';
                      cardTheme = 'bg-sky-50 text-sky-600 border-2 border-sky-200 border-dashed animate-pulse';
                   }
                } else if (attendanceMatch) {
                   if (['Present', 'Late', 'Half-day'].includes(attendanceMatch.status)) {
                      statusLabel = 'PRE';
                      cardTheme = 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100/60';
                   } else {
                      statusLabel = 'ABS';
                      cardTheme = 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-100/60';
                   }
                } else if (!isFuture && day < todayDate) {
                   statusLabel = 'ABS';
                   cardTheme = 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-100/60';
                }

                if (isToday) {
                   cardTheme = `bg-[#4F46E5] text-white border-[#4F46E5] shadow-xl shadow-indigo-500/40 ring-4 ring-indigo-500/10 scale-[1.12] z-20`;
                }


                return (
                  <div key={day}
                    title={leaveMatch ? `${leaveMatch.leaveType} (${leaveMatch.status})` : holidayMatch ? holidayMatch.name : ''}
                    className={`aspect-[4/5.5] flex flex-col items-center justify-center rounded-xl md:rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer ${cardTheme}`}>
                    <span className={`text-[12px] md:text-[14px] font-black leading-none mb-0.5 ${isToday ? 'text-white' : 'text-slate-800 tracking-tighter'}`}>{day < 10 ? `0${day}` : day}</span>
                    <span className={`text-[6px] md:text-[7px] font-black uppercase tracking-widest ${isToday ? 'text-indigo-100' : 'opacity-80'}`}>{statusLabel}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 pt-5 border-t border-slate-50">
              {[
                { bg: 'bg-[#4F46E5]', label: 'Today' },
                { bg: 'bg-emerald-500', label: 'Present' },
                { bg: 'bg-rose-500', label: 'Absent/Holiday' },
                { bg: 'bg-amber-500', label: 'Approved Leave' },
                { bg: 'bg-sky-400', label: 'Pending' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${item.bg}`}></div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Meta */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#1a1a3e] rounded-xl p-5 text-white border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-violet-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Zap size={14} className="text-indigo-400" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 italic">Sector Intelligence</h3>
                </div>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[8px] rounded-lg border border-white/10 transition-all flex items-center gap-2"
                >
                   Protocol Hub
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-black text-white leading-tight uppercase italic tracking-tighter mb-1">Workforce Intelligence & Sector Comms</h2>
                <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
              </div>
                <div grid-cols-1 sm:grid-cols-2>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Tasks Active</p>
                  <p className="text-xl font-black text-white tabular-nums">12</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Sync</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-xs font-black text-emerald-400">Optimal</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                All workspace nodes are active and synced in real-time.
              </p>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {['bg-indigo-400','bg-rose-400','bg-amber-400','bg-emerald-400'].map((c, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 border-slate-900 ${c}`}></div>
                  ))}
                </div>
                <span className="text-[9px] text-slate-500 font-semibold tracking-widest">+14 online</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;


