import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag,
  AlertCircle, Package, Clock, ArrowUpRight, Zap
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../utils/api';

const ERPDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Only Admin/Manager has access to financial summary endpoint
      if (!['Admin', 'Manager'].includes(user?.role)) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/erp/budgets/summary');
        setSummary(res.data);
      } catch (err) {
        console.warn('ERP summary unavailable:', err.response?.data?.message || err.message);
        // Graceful fallback — show zeroed stats
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const lineData = [
    { name: 'Jan', revenue: 4200, expense: 2400 },
    { name: 'Feb', revenue: 5800, expense: 3100 },
    { name: 'Mar', revenue: 4900, expense: 3800 },
    { name: 'Apr', revenue: 7200, expense: 4100 },
    { name: 'May', revenue: 6100, expense: 3900 },
    { name: 'Jun', revenue: 8400, expense: 4600 },
  ];

  const deptBudget = [
    { name: 'Operations', allocated: 500000, spent: 340000 },
    { name: 'Marketing', allocated: 200000, spent: 180000 },
    { name: 'IT', allocated: 300000, spent: 220000 },
    { name: 'HR', allocated: 150000, spent: 90000 },
  ];

  const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${(summary.totalRevenue / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      trend: '+12.4%',
      up: true,
      bg: 'from-indigo-500 to-purple-600',
      light: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Total Expenses',
      value: `₹${(summary.totalExpenses / 1000).toFixed(1)}K`,
      icon: TrendingDown,
      trend: '+3.1%',
      up: false,
      bg: 'from-rose-500 to-pink-600',
      light: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Net Profit',
      value: `₹${(summary.profit / 1000).toFixed(1)}K`,
      icon: DollarSign,
      trend: summary.profit >= 0 ? '+Positive' : '-Negative',
      up: summary.profit >= 0,
      bg: summary.profit >= 0 ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-red-600',
      light: summary.profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Active Vendors',
      value: '42',
      icon: Users,
      trend: '+2 this month',
      up: true,
      bg: 'from-amber-500 to-orange-600',
      light: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="min-h-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-10 mb-10 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex justify-between items-center flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center">
                <Zap size={20} className="text-indigo-300" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300">ERP Console</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-none">
              Fiscal Intelligence Hub
            </h2>
            <p className="text-indigo-300/80 font-medium mt-3 text-sm">
              Real-time revenue monitoring, procurement velocity, and budget utilization.
            </p>
          </div>
          {!hasAccess && (
            <div className="bg-amber-500/20 border border-amber-400/30 px-6 py-3 rounded-2xl">
              <p className="text-amber-300 text-xs font-black uppercase tracking-widest">
                ⚠ Limited View — Financial Reports Require Manager Access
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate('/admin/dashboard/erp/finance')} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer">
            <div className={`h-1.5 w-full bg-gradient-to-r ${stat.bg}`} />
            <div className="p-7">
              <div className="flex justify-between items-start mb-5">
                <div className={`p-3 rounded-2xl ${stat.light} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2.5 py-1 rounded-full`}>
                  <ArrowUpRight size={11} className={stat.up ? '' : 'rotate-180'} />
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue vs Expense Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Revenue vs Expense Trend</h4>
              <p className="text-xs text-slate-400 font-medium mt-1">6-month fiscal performance</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Expense</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={3} dot={{ r: 5, fill: '#fb7185', strokeWidth: 0 }} activeDot={{ r: 8 }} strokeDasharray="6 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />
          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6 relative z-10">Critical Alerts</h4>
          <div className="space-y-4 relative z-10">
            {[
              { icon: AlertCircle, color: 'text-rose-400 bg-rose-500/20', title: 'Overdue Invoices', desc: '5 high-priority settlements pending', path: '/admin/dashboard/erp/finance' },
              { icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/20', title: 'Pending POs', desc: '12 purchase orders awaiting approval', path: '/admin/dashboard/erp/orders' },
              { icon: Package, color: 'text-cyan-400 bg-cyan-500/20', title: 'Low Stock Alert', desc: '8 materials below minimum level', path: '/admin/dashboard/inventory/alerts' },
            ].map((alert, i) => (
              <div key={i} onClick={() => navigate(alert.path)} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl ${alert.color} flex items-center justify-center flex-shrink-0`}>
                  <alert.icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase">{alert.title}</p>
                  <p className="text-[10px] text-white/50 font-medium mt-0.5">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 relative z-10">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Recent Procurement</h5>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[9px] font-black text-indigo-300">PO</div>
                    <div>
                      <p className="text-[10px] font-black">PO-2026-00{i}</p>
                      <p className="text-[9px] text-white/40">Global Steel Corp • ₹1.2L</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black bg-indigo-600/40 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Sent</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department Budget Utilization */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h4 className="font-black text-slate-900 text-sm mb-6">Department Budget Utilization</h4>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptBudget} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} width={90} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
              <Bar dataKey="allocated" fill="#e0e7ff" radius={[0, 6, 6, 0]} barSize={12} name="Allocated" />
              <Bar dataKey="spent" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={12} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ERPDashboard;
