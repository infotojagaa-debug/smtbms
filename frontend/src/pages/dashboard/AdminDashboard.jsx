import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, Package, TrendingUp, TrendingDown, AlertCircle,
  Briefcase, Target, Ticket, DollarSign, ArrowUpRight,
  Activity, UserCheck, Zap, ShieldCheck, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { fetchAdminStats } from '../../redux/slices/analyticsSlice';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ label, value, icon: Icon, delta, progress = 70, subtext, accentColor = '#6366f1', onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2' : ''}`}
    style={{ 
      backgroundColor: `${accentColor}08`, 
      borderColor: `${accentColor}20`
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: accentColor }}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-0.5" style={{ color: accentColor }}>{label}</p>
        <div className="flex items-center gap-1">
           <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: accentColor }}></div>
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{delta}</span>
        </div>
      </div>
    </div>
    
    <div className="mb-4">
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{value}</h3>
        {subtext && <span className="text-[10px] font-bold text-slate-400">/ {subtext}</span>}
      </div>
    </div>

    <div className="space-y-2.5">
      <div className="flex justify-between items-center mb-0.5">
        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Protocol Utilisation</p>
        <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: accentColor }}>{progress}% ACTIVE</p>
      </div>
      <div className="w-full h-1.5 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminStats, loading } = useSelector((state) => state.analytics);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (!adminStats) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <ShieldCheck size={24} className="text-indigo-600" />
        </div>
        <p className="text-slate-500 font-semibold text-sm">Synchronizing Data...</p>
      </div>
    </div>
  );

  const { materials, hrms, erp, crm, recentActivities } = adminStats;

  const kpis = [
    { label: 'Stock Inventory', value: materials.total, icon: Package, delta: 'Managed Resources', progress: 85, subtext: '100 items', accentColor: '#6366f1' },
    { label: 'Low Stock Alerts', value: materials.lowStock, icon: AlertCircle, delta: 'Critical Deficiency', progress: materials.lowStock > 0 ? Math.min(100, (materials.lowStock / materials.total) * 100) : 0, accentColor: '#ef4444' },
    { label: 'Active Workforce', value: hrms.totalEmployees, icon: Users, delta: 'Staff Availability', progress: hrms.presentPercent, subtext: 'Staff', accentColor: '#0ea5e9' },
    { label: 'Monthly Revenue', value: `₹${(erp.monthlyRevenue / 1000).toFixed(1)}K`, icon: DollarSign, delta: 'Fiscal Target', progress: 65, accentColor: '#10b981' },
    { label: 'Pending Leaves', value: hrms.pendingLeaves, icon: UserCheck, delta: 'HR Protocol', progress: hrms.pendingLeaves > 0 ? 40 : 0, accentColor: '#f59e0b' },
    { label: 'Pipeline Value', value: `₹${(crm.pipelineTotal / 100000).toFixed(1)}L`, icon: Target, delta: 'Sales Velocity', progress: 78, accentColor: '#8b5cf6' },
    { label: 'Open Tickets', value: crm.openTickets, icon: Ticket, delta: 'Service Support', progress: crm.openTickets > 0 ? 25 : 0, accentColor: '#ec4899' },
    { label: 'New Leads', value: crm.newLeads, icon: TrendingUp, delta: 'Market Growth', progress: 92, accentColor: '#06b6d4' },
  ];

  const revenueData = erp.revenueHistory?.length > 0 ? erp.revenueHistory : [
    { name: 'Jan', revenue: 0, expense: 0 },
  ];

  const deptPie = hrms.headcountByDept?.length > 0 ? hrms.headcountByDept : [
    { name: 'General', value: 1 }
  ];

  return (
    <div className="space-y-10 pb-16 min-h-full">
      {/* Top Command Bar - Redesigned for Formal Authority */}
      <div className="flex justify-between items-center bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center gap-2">
               <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-primary-400">All Systems Synchronized</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Executive Command <span className="text-primary-500">Center</span>
          </h2>
          <p className="text-slate-400 text-[11px] font-medium mt-4 tracking-wide max-w-md uppercase opacity-80 italic">
            Cross-vertical operational intelligence hub. Monitoring Material, HRMS, ERP, and CRM protocols.
          </p>
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
           <button 
             onClick={() => navigate('/notifications')}
             className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-2 pl-6 rounded-[2rem] transition-all"
           >
              <span className="text-[10px] font-black uppercase tracking-widest">Protocol Hub</span>
              <div className="w-12 h-12 bg-white text-slate-950 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45">
                 <ArrowUpRight size={20} />
              </div>
           </button>
        </div>
      </div>

      {/* KPI Grid - 4x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          let target = '/';
          const prefix = isAdmin ? '/admin/dashboard' : '';
          switch(kpi.label) {
            case 'Total Inventory': target = isAdmin ? `${prefix}/stock-inventory` : '/inventory'; break;
            case 'Low Stock Alerts': target = isAdmin ? `${prefix}/inventory/alerts` : '/inventory/alerts'; break;
            case 'Active Workforce': target = isAdmin ? `${prefix}/hrms/employees` : '/hr/employees'; break;
            case 'Monthly Revenue': target = isAdmin ? `${prefix}/erp/orders` : '/erp/orders'; break;
            case 'Pending Leaves': target = isAdmin ? `${prefix}/hrms/leave` : '/hr/leave'; break;
            case 'Pipeline Value': target = isAdmin ? `${prefix}/crm/deals` : '/crm/deals'; break;
            case 'Open Tickets': target = isAdmin ? `${prefix}/crm/tickets` : '/crm/tickets'; break;
            case 'New Leads': target = isAdmin ? `${prefix}/crm/leads` : '/crm/leads'; break;
            default: target = '/';
          }
          return (
            <StatCard 
              key={i} 
              {...kpi} 
              onClick={() => navigate(target)} 
            />
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Fiscal Velocity */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity size={20} /></div>
                Fiscal Velocity Trajectory
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-14">Monthly Revenue vs Operating Expense</p>
            </div>
            <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button className="px-5 py-2 rounded-xl bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest shadow-sm border border-slate-100 cursor-pointer">Live Stream</button>
              <button className="px-5 py-2 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">Quarterly</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dx={-10} />
                <Tooltip 
                   cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                   contentStyle={{ borderRadius: '24px', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '20px' }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fill="url(#adminRevGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Donut */}
        <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10 flex flex-col">
          <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 flex items-center gap-3">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Users size={20} /></div>
             Workforce Index
          </h4>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total</p>
               <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Active</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptPie} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={10}>
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
            {deptPie.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity size={20} /></div>
              Interaction Stream
            </h4>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Feedback</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.slice(0, 6).map((log, i) => (
              <div key={i} className="flex gap-4 group p-4 bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-slate-50 rounded-[2rem] transition-all cursor-pointer shadow-sm hover:shadow-lg">
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
                <p className="text-[10px] font-black uppercase tracking-widest">No Recent Telemetry</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Critical Alert */}
        <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] p-10 flex flex-col">
          <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 mb-8">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertCircle size={20} /></div>
            Critical Thresholds
          </h4>
          <div className="space-y-4 flex-1">
            {materials.topLowStock.length > 0 ? materials.topLowStock.map((item, i) => (
              <div key={i} className="group bg-rose-50/30 border-2 border-rose-50 rounded-[2rem] p-5 flex justify-between items-center hover:bg-rose-50 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm"><Package size={18} /></div>
                   <div>
                     <p className="text-sm font-black text-slate-900 uppercase italic">{item.name}</p>
                     <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mt-1">
                       {item.quantity} / {item.minStockLevel} {item.unit} Remaining
                     </p>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <TrendingDown size={20} className="text-rose-500 animate-bounce" />
                  <div className="w-20 h-2 bg-rose-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${Math.min((item.quantity / item.minStockLevel) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 text-slate-300 border-2 border-dashed border-slate-100 rounded-[2.5rem] h-full flex flex-col items-center justify-center">
                <ShieldCheck size={32} className="mx-auto mb-4 opacity-30" />
                <p className="text-[10px] font-black uppercase tracking-widest">All Stock Levels Secure</p>
              </div>
            )}
          </div>
          {/* CRM Quick Stats */}
          <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-6">
            <div className="bg-slate-50/50 border-2 border-slate-50 rounded-[2rem] p-6 text-center hover:bg-white transition-all shadow-sm">
              <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{crm.activeCustomers}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Strategic Clients</p>
            </div>
            <div className="bg-slate-50/50 border-2 border-slate-50 rounded-[2rem] p-6 text-center hover:bg-white transition-all shadow-sm">
              <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{erp.pendingPOs}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Pending PO Protocols</p>
            </div>
          </div>
        </div>

        {/* Intelligence Stream Section */}
        <div className="lg:col-span-1 h-full">
           <div className="bg-white border-2 border-slate-50 shadow-xl rounded-[3rem] h-full flex flex-col overflow-hidden transition-all duration-500">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 italic">Intelligence Protocol</h3>
                 <button onClick={() => navigate('/notifications')} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all">
                    <ArrowUpRight size={18} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[600px] scroller-hide">
                 <RecentNotifications />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Recent Notifications in Dashboard
const RecentNotifications = () => {
  const { notifications } = useSelector((state) => state.notifications);
  const navigate = useNavigate();

  return notifications.length > 0 ? (
    <div className="space-y-4">
      {notifications.slice(0, 6).map((n, idx) => (
        <div 
          key={idx} 
          onClick={() => navigate('/notifications')}
          className="p-6 rounded-[2.5rem] bg-slate-50/50 border-2 border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              n.type === 'danger' ? 'bg-rose-100 text-rose-600' : 
              n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {n.type} Protocol
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(n.createdAt).toLocaleTimeString()}</span>
          </div>
          <p className="text-xs font-black text-slate-900 uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">{n.title}</p>
          <p className="text-[10px] font-bold text-slate-500 line-clamp-1 mt-2 tracking-wide uppercase opacity-70 italic">{n.message}</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20 grayscale">
       <div className="p-8 bg-slate-100 rounded-[3rem] mb-6">
          <Bell size={40} className="text-slate-400" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Protocol Stream Secure</p>
    </div>
  );
};

export default AdminDashboard;
