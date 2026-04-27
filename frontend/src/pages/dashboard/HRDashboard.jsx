import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, Calendar, Clock, Heart, DollarSign,
  CheckCircle2, TrendingUp, Award, ChevronRight,
  UserPlus, AlertTriangle, Smile
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchHRStats } from '../../redux/slices/analyticsSlice';

const DEPT_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857'];

const StatCard = ({ label, value, icon: Icon, subValue, progress, progressLabel, color = 'text-emerald-600', bg = 'bg-emerald-50', border = 'border-emerald-200', iconBg = 'bg-emerald-600', onClick }) => (
  <div 
    onClick={onClick}
    className={`${bg} rounded-[1rem] p-5 border ${border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 group/card ${onClick ? 'cursor-pointer hover:border-emerald-400' : 'cursor-default'}`}
  >
    {/* Top row: icon + type */}
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-md group-hover/card:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className={`text-[10px] font-black ${color} uppercase tracking-wider leading-tight`}>{label}</p>
    </div>

    {/* Balance */}
    <div className="flex items-baseline gap-1 mt-0.5">
      <span className="text-3xl font-black text-slate-900 leading-none tabular-nums mt-1">{value}</span>
      {subValue && <span className="text-xs font-bold text-slate-400"> / {subValue}</span>}
    </div>

    {/* Progress bar */}
    <div className="w-full h-1.5 bg-white/70 rounded-full overflow-hidden my-1">
      <div 
        className={`h-full rounded-full ${iconBg} transition-all duration-1000 ease-out opacity-80`} 
        style={{ width: `${progress}%` }}
      />
    </div>

    {/* Used / remaining */}
    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
      <span className="text-slate-400">{progressLabel}</span>
      <span className={color}>{progress}% Utilised</span>
    </div>
  </div>
);

const HRDashboard = () => {
  const dispatch = useDispatch();
  const { hrStats, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchHRStats());
  }, [dispatch]);

  if (!hrStats) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Users size={32} className="text-emerald-600" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Processing Workforce Analytics...</p>
      </div>
    </div>
  );

  const { 
    headcountByDept = [], 
    attendanceSummary = [], 
    upcomingBirthdays = [], 
    pendingLeaves = 0, 
    totalEmployees = 0, 
    recentLeaves = [],
    activeEmployees = 0 // Combined Present + Late from backend
  } = hrStats;

  const deptData = headcountByDept.map(d => ({ name: d._id || 'Unknown', value: d.count }));
  const attendData = attendanceSummary.map(a => ({ name: a._id, value: a.count }));
  const presentPct = totalEmployees ? ((activeEmployees / totalEmployees) * 100).toFixed(0) : 0;

  const kpiCards = [
    {
      label: 'Total Employees',
      value: totalEmployees,
      subValue: 'Active',
      icon: Users,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-600',
      progress: 100,
      progressLabel: 'Workforce Stats'
    },
    {
      label: 'Present Today',
      value: activeEmployees,
      subValue: totalEmployees,
      icon: CheckCircle2,
      bg: 'bg-teal-50',
      color: 'text-teal-600',
      border: 'border-teal-200',
      iconBg: 'bg-teal-500',
      progress: presentPct,
      progressLabel: 'Attendance Rate'
    },
    {
      label: 'Pending Leaves',
      value: pendingLeaves,
      subValue: 'Queue',
      icon: Calendar,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500',
      progress: pendingLeaves > 0 ? 35 : 0,
      progressLabel: 'Review Protocol'
    },
    {
      label: 'Monthly Payroll',
      value: '₹1.2M',
      subValue: 'Staff',
      icon: DollarSign,
      bg: 'bg-indigo-50',
      color: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-600',
      progress: 95,
      progressLabel: 'Fiscal Status'
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header — Warm Green Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-10 shadow-xl shadow-emerald-200">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Workforce Hub</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
              People Intelligence
            </h2>
            <p className="text-emerald-100/80 font-medium mt-3 text-sm max-w-xl">
              Comprehensive workforce analytics — attendance velocity, headcount distribution, and leave management.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/20 transition-all backdrop-blur-sm">
            <DollarSign size={16} /> Generate Payroll
          </button>
        </div>
      </div>

      {/* KPI Row — Restored to Employee Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount — Horizontal Bars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" /> Department Headcount
              </h4>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border">Live</span>
            </div>
            {deptData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1faf5" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} width={80} />
                    <Tooltip cursor={{ fill: '#f0fdf4' }} contentStyle={{ borderRadius: '12px', border: '1px solid #d1fae5', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20} name="Employees">
                      {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-300 flex-col gap-3">
                <Users size={40} />
                <p className="text-xs font-black uppercase tracking-widest">No Employee Data Yet</p>
              </div>
            )}
          </div>

          {/* Attendance Pie */}
          <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-200 mb-6">Today's Attendance Overview</h4>
              {attendData.length > 0 ? (
                <div className="flex items-center gap-8">
                  <div className="w-36 h-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={attendData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                          {attendData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {attendData.map((a, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[i] }} />
                          <span className="text-xs font-black text-white/70 uppercase tracking-wide">{a.name}</span>
                        </div>
                        <span className="text-sm font-black text-white">{a.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-white/40">
                  <Clock size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">No Attendance Marked Today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Birthdays & Leave Queue */}
        <div className="space-y-6">
          {/* Upcoming Birthdays */}
          <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm p-7">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-5">
              <Heart size={16} className="text-rose-500 fill-rose-500" /> Upcoming Celebrations
            </h4>
            <div className="space-y-3">
              {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((emp, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100/50 hover:bg-rose-50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 font-black text-sm overflow-hidden flex-shrink-0">
                    {emp.photo ? <img src={emp.photo} className="w-full h-full object-cover" /> : <Smile size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 uppercase truncate">{emp.name}</p>
                    <p className="text-[9px] font-bold text-rose-400 mt-0.5 uppercase tracking-wider">{emp.department}</p>
                  </div>
                  <Award size={14} className="text-rose-400 flex-shrink-0" />
                </div>
              )) : (
                <div className="py-6 text-center text-slate-300 flex flex-col items-center gap-2">
                  <Heart size={28} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Upcoming Birthdays</p>
                </div>
              )}
            </div>
          </div>

          {/* Leave Approval Queue */}
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-7">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Pending Approvals
              </h4>
              {(pendingLeaves || 0) > 0 && (
                <span className="text-[9px] font-black bg-amber-500 text-white rounded-full px-2 py-0.5">{pendingLeaves}</span>
              )}
            </div>
            <div className="space-y-3">
              {recentLeaves && recentLeaves.length > 0 ? recentLeaves.slice(0, 4).map((leave, i) => (
                <div key={i} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 hover:bg-amber-100/70 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-black text-amber-900 uppercase">{leave.employee?.name || 'Unknown Employee'}</p>
                      <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase tracking-wide">{leave.leaveType || 'Leave'} • {leave.days || '?'} Days</p>
                    </div>
                    <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform mt-1" />
                  </div>
                </div>
              )) : (
                /* Fallback mock items */
                [1, 2].map(i => (
                  <div key={i} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center group cursor-pointer hover:bg-amber-100 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-amber-900 uppercase">Casual Leave</p>
                      <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase tracking-wider">2 Days • Team Member</p>
                    </div>
                    <ChevronRight size={14} className="text-amber-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Joinees */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-4">Recent Joinings</h4>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-white/10 p-2.5 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-black text-xs group-hover:bg-white/25 transition-all">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">New Employee</p>
                      <p className="text-[9px] text-emerald-200 uppercase tracking-wide mt-0.5">Full-time • IT</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
