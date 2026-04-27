import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  Calendar, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  PieChart as PieIcon,
  DollarSign,
  Download,
  Filter,
  Search,
  ChevronRight,
  BarChart3,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    pendingLeaves: 0,
    attendanceTrend: [],
    payrollTrend: [],
    leaveDistribution: [],
    retentionStats: { retentionRate: 0, attritionRate: 0 },
    productivityStats: { avgHours: 0, totalOvertime: 0 },
    deptData: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userStr = sessionStorage.getItem('user');
      if (!userStr) return;
      const { token } = JSON.parse(userStr);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get('/api/analytics/hr', config);
      setStats({
        ...res.data,
        deptData: res.data.headcountByDept.map(d => ({ name: d._id, value: d.count })),
        recentActivity: res.data.recentLeaves.map(l => ({
           action: l.status === 'Approved' ? 'Leave Approved' : 'Request: ' + l.leaveType,
           stakeholder: l.employeeId?.name || 'Personnel',
           role: l.employeeId?.department || 'Staff',
           time: new Date(l.updatedAt).toLocaleDateString(),
           id: l._id
        }))
      });
    } catch (err) {
      console.error('HR Data Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Workforce,${stats.totalEmployees}\n`
      + `Retention Rate,${stats.retentionStats.retentionRate}%\n`
      + `Avg Working Hours,${stats.productivityStats.avgHours}h`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HR_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
       <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
       <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Workforce Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* --- MISSION CONTROL HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">
             HR Dashboard <span className="text-indigo-600 font-normal">v2.0</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Real-time Personnel Analytics & Logistics</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* Search Bar */}
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="PROBE EMPLOYEE..." 
                className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-indigo-500 transition-all outline-none w-[220px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           {/* Dept Filter */}
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                 <option value="All">All Sectors</option>
                 {stats.deptData.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
           </div>

            <button 
              onClick={() => navigate('/my-attendance')}
              className="flex items-center gap-2.5 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
            >
               <Clock size={14} /> Daily Punch
            </button>

            <button 
              onClick={exportReport}
              className="flex items-center gap-2.5 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
            >
               <Download size={14} /> Export Intel
            </button>
        </div>
      </div>

      {/* --- KPI RIBBONS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Workforce Total', value: stats.totalEmployees, icon: Users, color: 'text-indigo-600', bg: 'from-indigo-50 to-white', trend: '+4.2%' },
          { label: 'Operational Nodes', value: stats.activeEmployees, icon: UserCheck, color: 'text-emerald-600', bg: 'from-emerald-50 to-white', trend: 'STABLE' },
          { label: 'Leave Instances', value: stats.onLeaveToday, icon: UserMinus, color: 'text-rose-600', bg: 'from-rose-50 to-white', trend: '-2%' },
          { label: 'Pending Approvals', value: stats.pendingLeaves, icon: Clock, color: 'text-amber-600', bg: 'from-amber-50 to-white', trend: 'PRIORITY' },
        ].map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            onClick={() => {
              if (kpi.label === 'Leave Instances' || kpi.label === 'Pending Approvals') {
                navigate('/hr/leave');
              }
            }}
            className={`bg-gradient-to-br ${kpi.bg} p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group ${ (kpi.label === 'Leave Instances' || kpi.label === 'Pending Approvals') ? 'cursor-pointer hover:border-indigo-400' : ''}`}
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <kpi.icon size={120} />
            </div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className={`p-4 bg-white rounded-2xl shadow-sm ${kpi.color}`}>
                <kpi.icon size={22} />
              </div>
              <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg bg-white/50 border border-current opacity-40 tracking-widest ${kpi.color}`}>
                {kpi.trend}
              </span>
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[.25em] mb-2">{kpi.label}</h3>
            <p className="text-4xl font-black text-slate-900 tabular-nums italic tracking-tighter">
              {(kpi.value ?? 0).toString().padStart(2, '0')}
            </p>
          </motion.div>
        ))}
      </div>

      {/* --- ANALYTICS LAYER 01 --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Attendance Trends */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="font-black italic uppercase text-slate-900 tracking-tight text-base flex items-center gap-2">
                   Attendance Matrix <BarChart3 className="text-indigo-600" size={18} />
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Statistical Node Presence - 7 Days</p>
              </div>
           </div>
           <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Present" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={20} />
                    <Bar dataKey="Leave" fill="#94a3b8" radius={[10, 10, 0, 0]} barSize={20} />
                    <Bar dataKey="Absent" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Workforce Matrix */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center">
           <h3 className="font-black italic uppercase text-slate-900 tracking-tight text-base mb-10 self-start">Personnel Sectors</h3>
           <div className="flex-1 w-full min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={stats.deptData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={110}
                       paddingAngle={10}
                       dataKey="value"
                    >
                       {stats.deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Nodes</p>
                 <p className="text-3xl font-black text-slate-900 italic">{stats.totalEmployees}</p>
              </div>
           </div>
           <div grid-cols-1 sm:grid-cols-2>
              {stats.deptData.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{d.name}</p>
                      <p className="text-xs font-black text-slate-900">{d.value}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- ANALYTICS LAYER 02 --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Live Activity Log */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="font-black italic uppercase text-slate-900 tracking-tight text-base">Personnel Telemetry</h3>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Live workforce action stream</p>
              </div>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] hover:opacity-70">Archive Access</button>
           </div>
           <div className="grid gap-4">
              {stats.recentActivity.map((log, idx) => (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   key={log.id || idx} 
                   className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-200 hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all group"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <Activity size={22} className="text-indigo-500" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 uppercase italic leading-none mb-1.5">{log.action}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             {log.stakeholder} <span className="opacity-20">|</span> <Zap size={10} className="text-amber-500" /> {log.role}
                          </p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">{log.time}</span>
                 </motion.div>
              ))}
           </div>
        </div>

        {/* High Intensity Insights */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
           <div grid-cols-1 sm:grid-cols-2>
              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/30">
                 <div className="absolute right-[-10%] top-[-10%] p-4 opacity-10 group-hover:scale-125 transition-transform"><TrendingUp size={100} /></div>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-indigo-400">Retention Ops</p>
                 <h4 className="text-4xl font-black italic mb-2 leading-none">{stats.retentionStats.retentionRate}%</h4>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest tracking-tighter">Optimal Performance</p>
                 </div>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/30">
                 <div className="absolute right-[-10%] top-[-10%] p-4 opacity-10 group-hover:scale-125 transition-transform"><Briefcase size={100} /></div>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-indigo-200">Attrition Delta</p>
                 <h4 className="text-4xl font-black italic mb-2 leading-none">{stats.retentionStats.attritionRate}%</h4>
                 <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest tracking-tighter italic">Sector Standard: 15%</p>
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
              <h3 className="font-black italic uppercase text-slate-900 tracking-tight text-[12px] mb-8">Fiscal Disbursement <span className="text-emerald-500">Log</span></h3>
              <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.payrollTrend}>
                       <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Tooltip />
                       <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-6 flex justify-between items-center px-4 py-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Current Cycle Net</p>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums leading-none">₹{(stats.payroll?.totalDisbursed || 0).toLocaleString()}</p>
                 </div>
                 <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                    <DollarSign size={20} />
                 </div>
              </div>
           </div>
        </div>
      </div>

       {/* --- SECONDARY METRICS --- */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center justify-between group hover:border-indigo-500 transition-colors">
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Avg Working Hours</p>
                 <p className="text-2xl font-black text-slate-900 italic leading-none">{stats.productivityStats.avgHours}h</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all"><Clock size={20} /></div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center justify-between group hover:border-rose-500 transition-colors">
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Overtime Accumulation</p>
                 <p className="text-2xl font-black text-slate-900 italic leading-none">{stats.productivityStats.totalOvertime}h</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><Zap size={20} /></div>
          </div>
          <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-indigo-900 p-8 rounded-[2.5rem] flex items-center justify-between relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
              <div className="relative z-10 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                    <PieIcon size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[.4em] mb-1">Fiscal Dispersion Ratio</p>
                    <p className="text-xl font-black text-white italic">Operational Overhead Optimal</p>
                 </div>
              </div>
              <button className="relative z-10 w-12 h-12 bg-white rounded-2xl text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><ChevronRight size={20} /></button>
          </div>
       </div>
    </div>
  );
};

export default HRDashboard;
