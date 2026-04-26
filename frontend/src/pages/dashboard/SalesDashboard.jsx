import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Target, Briefcase, TrendingUp, Trophy, CheckCircle2,
  Zap, ArrowRight, Activity, AlertCircle, Star, Flame,
  Users, DollarSign, UserCheck, Ticket, Package, ShieldCheck,
  ArrowUpRight, Bell, Calendar, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { fetchSalesStats } from '../../redux/slices/analyticsSlice';
import { fetchNotifications } from '../../redux/slices/notificationSlice';

const StatCard = ({ label, value, icon: Icon, delta, progress = 70, subtext, accentColor = '#6366f1', onClick }) => (
  <div 
    onClick={onClick}
    className={`p-10 rounded-[3rem] border-2 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[320px] shadow-sm ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2' : ''}`}
    style={{ 
      backgroundColor: `${accentColor}08`, 
      borderColor: `${accentColor}20`
    }}
  >
    <div className="flex items-center gap-5 mb-8">
      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]" style={{ backgroundColor: accentColor }}>
        <Icon size={28} strokeWidth={3} />
      </div>
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: accentColor }}>{label}</p>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: accentColor }}></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{delta}</span>
        </div>
      </div>
    </div>
    
    <div className="mb-10">
      <div className="flex items-baseline gap-3">
        <h3 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{value}</h3>
        {subtext && <span className="text-lg font-bold text-slate-400">/ {subtext}</span>}
      </div>
    </div>

    <div className="space-y-5">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Utilisation</p>
        <p className="text-[11px] font-black uppercase tracking-tighter" style={{ color: accentColor }}>{progress}% ACTIVE</p>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
          style={{ 
            backgroundColor: accentColor, 
            width: `${progress}%` 
          }} 
        />
      </div>
    </div>
  </div>
);

const SalesDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { salesStats, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchSalesStats());
    dispatch(fetchNotifications({ module: 'CRM' }));
  }, [dispatch]);

  if (!salesStats) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Flame size={32} className="text-amber-500" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Auditing Sales Velocity Hub...</p>
      </div>
    </div>
  );

  const { 
    myLeadsCount = 0, 
    myPipeline = [], 
    wonThisMonth = 0, 
    wonDealsCount = 0, 
    totalPipelineValue = 0, 
    recentActivities = [],
    activeStrategicClients = 0,
    openTickets = 0
  } = salesStats;

  const pipelineData = (myPipeline || []).map(p => ({
    name: p._id?.replace(/-/g, ' ').toUpperCase() || 'Stage',
    count: p.count,
    value: p.total
  }));

  const achievementTarget = 600000;
  const achievementPct = Math.min(((wonThisMonth || 0) / achievementTarget) * 100, 100);

  const weeklyTrend = [
    { day: 'Mon', calls: 12, meets: 3 },
    { day: 'Tue', calls: 18, meets: 5 },
    { day: 'Wed', calls: 9, meets: 2 },
    { day: 'Thu', calls: 22, meets: 7 },
    { day: 'Fri', calls: 16, meets: 4 },
    { day: 'Sat', calls: 8, meets: 1 },
  ];

  return (
    <div className="space-y-10 pb-16 min-h-full">
      {/* Top Command Bar */}
      <div className="flex justify-between items-center bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center gap-2">
               <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Sales Velocity Synchronized</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Revenue <span className="text-amber-500">Cockpit</span>
          </h2>
          <p className="text-slate-400 text-[11px] font-medium mt-4 tracking-wide max-w-md uppercase opacity-80 italic">
            Pipeline velocity, target tracking, and conversion analytics. Strategic sales management protocols.
          </p>

          {/* Achievement Progress */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-[2rem] p-6 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Monthly Quota Velocity</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-2xl font-black text-white italic uppercase">₹{((wonThisMonth || 0) / 1000).toFixed(0)}K</p>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">/ ₹600K Objective</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-amber-500 italic uppercase leading-none">{achievementPct.toFixed(0)}%</p>
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Completion</p>
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${achievementPct}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 relative z-10 self-start">
           <button 
             onClick={() => navigate('/crm/kanban')}
             className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-2 pl-6 rounded-[2rem] transition-all"
           >
              <span className="text-[10px] font-black uppercase tracking-widest">Kanban Ops</span>
              <div className="w-12 h-12 bg-white text-slate-950 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45">
                 <ArrowUpRight size={20} />
              </div>
           </button>
        </div>
      </div>

      {/* KPI Grid — 3x2 Configuration for CRM Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {[
          { label: 'My Leads', value: myLeadsCount, icon: Target, delta: 'Total Prospect Hub', progress: 85, subtext: 'Target 50', accentColor: '#f59e0b' },
          { label: 'Pipeline Value', value: `₹${((totalPipelineValue || 0) / 1000).toFixed(0)}K`, icon: Briefcase, delta: 'Estimated Revenue', progress: 65, accentColor: '#f97316' },
          { label: 'Won This Month', value: `₹${((wonThisMonth || 0) / 1000).toFixed(0)}K`, icon: Trophy, delta: 'Closed Revenue', progress: achievementPct.toFixed(0), accentColor: '#10b981' },
          { label: 'Deals Closed', value: wonDealsCount || 0, icon: Star, delta: 'Conversion Count', progress: 45, accentColor: '#ef4444' },
          { label: 'Open Tickets', value: openTickets, icon: Ticket, delta: 'Support Queue', progress: openTickets > 0 ? 60 : 0, accentColor: '#ec4899' },
          { label: 'Strategic Clients', value: activeStrategicClients, icon: UserCheck, delta: 'Active Accounts', progress: 100, accentColor: '#6366f1' },
        ].map((card, i) => (
          <StatCard 
            key={i} 
            {...card} 
            onClick={() => {
              if (card.label === 'My Leads') navigate('/crm/leads');
              else if (card.label === 'Open Tickets') navigate('/crm/tickets');
              else if (card.label === 'Strategic Clients') navigate('/crm/customers');
              else navigate('/crm/deals');
            }} 
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col - Charts */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><TrendingUp size={20} /></div>
                Pipeline Stage Distribution
              </h4>
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Velocity</span>
              </div>
            </div>
            {pipelineData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dx={-10} />
                    <Tooltip 
                       cursor={{ fill: '#f59e0b10' }}
                       contentStyle={{ borderRadius: '24px', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '20px' }} 
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={48} name="Pipeline Value (₹)">
                      {pipelineData.map((_, idx) => (
                        <Cell key={idx} fill={['#f59e0b', '#f97316', '#ef4444', '#8b5cf6'][idx % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-slate-300 grayscale opacity-30">
                <div className="p-8 bg-slate-100 rounded-[3rem] mb-6">
                   <Briefcase size={40} className="text-slate-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Stream Secure</p>
              </div>
            )}
          </div>

          {/* Interaction Stream (Activity Feed) - Synced from Admin */}
          <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity size={20} /></div>
                Interaction Stream
              </h4>
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sales Telemetry</span>
              </div>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.slice(0, 5).map((log, i) => (
                <div key={i} className="flex gap-4 group p-5 bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-slate-100 rounded-[2rem] transition-all cursor-pointer shadow-sm hover:shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:rotate-12">
                    <Zap size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-black text-slate-900 uppercase italic leading-tight truncate group-hover:text-indigo-600 transition-colors">{log.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{log.module}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 text-slate-300">
                  <Activity size={32} className="mx-auto mb-4 opacity-30 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Recent Sales Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col - Intelligence & Quick Stats */}
        <div className="space-y-10">
          {/* Intelligence Protocol (Notifications) - Synced from Admin */}
          <div className="bg-slate-950 border-2 border-slate-900 shadow-2xl rounded-[3rem] h-[500px] flex flex-col overflow-hidden">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Intelligence Protocol</h3>
                <Bell size={18} className="text-amber-500 animate-bounce" />
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4 scroller-hide">
                <RecentNotifications />
             </div>
          </div>

          {/* CRM Quick Stats - Synced from Admin */}
          <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10">
             <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-8 italic">Strategic Metrics</h4>
             <div className="space-y-6">
                <div className="bg-slate-50/50 border-2 border-slate-50 rounded-[2.5rem] p-8 text-center hover:bg-white transition-all shadow-sm hover:shadow-lg group">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform"><UserCheck size={24} /></div>
                   <p className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{activeStrategicClients || 0}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">Active Strategic Clients</p>
                </div>
                
                <div className="bg-slate-50/50 border-2 border-slate-50 rounded-[2.5rem] p-8 text-center hover:bg-white transition-all shadow-sm hover:shadow-lg group">
                   <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                   <p className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{wonDealsCount || 0}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">Successful Conversions</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentNotifications = () => {
  const { notifications } = useSelector((state) => state.notifications);
  const navigate = useNavigate();

  return notifications.length > 0 ? (
    <div className="space-y-4">
      {notifications.slice(0, 5).map((n, idx) => (
        <div 
          key={idx} 
          onClick={() => navigate('/notifications')}
          className="p-6 rounded-[2.5rem] bg-white/5 border-2 border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              n.type === 'danger' ? 'bg-rose-500/20 text-rose-400' : 
              n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {n.type || 'PROTOCOL'} ALERT
            </span>
            <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-all" />
          </div>
          <p className="text-[11px] font-black text-white/90 uppercase italic leading-relaxed leading-tight">{n.message}</p>
          <p className="text-[9px] text-white/40 font-bold mt-3 uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-20 text-white/20">
      <ShieldCheck size={32} className="mx-auto mb-4 opacity-10" />
      <p className="text-[10px] font-black uppercase tracking-widest">Protocol Stream Secure</p>
    </div>
  );
};

export default SalesDashboard;
