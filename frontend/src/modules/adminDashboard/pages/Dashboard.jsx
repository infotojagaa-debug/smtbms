import React, { useEffect, useState } from 'react';
import { 
  Package, AlertCircle, Users, DollarSign, 
  UserCheck, Target, Ticket, TrendingUp,
  Activity, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { 
  RevenueExpenseChart, 
  MaterialUsageChart, 
  StockInOutChart, 
  DistributionPie 
} from '../charts/ChartLibrary';
import LowStockTable from '../tables/LowStockTable';
import ActivityTable from '../tables/ActivityTable';
import api from '../../../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    kpis: null,
    analytics: null,
    distributions: null,
    tables: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [kpiRes, analyticsRes, distRes, tableRes] = await Promise.all([
        api.get('/api/admin-dash/kpi-stats'),
        api.get('/api/admin-dash/analytics-charts'),
        api.get('/api/admin-dash/distribution-pies'),
        api.get('/api/admin-dash/data-tables')
      ]);

      setData({
        kpis: kpiRes.data,
        analytics: analyticsRes.data,
        distributions: distRes.data,
        tables: tableRes.data
      });
    } catch (err) {
      console.error("Critical: Admin Data Sync Failed", err);
      setError(err.response?.status === 403 ? "UNAUTHORIZED: Admin Clearance Required." : "Failed to synchronize operational data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !data.kpis) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
         <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Matrix...</p>
      </div>
    );
  }

  if (error && !data.kpis) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
         <AlertCircle size={48} className="text-rose-500 mb-4" />
         <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Sync Failure</h2>
         <p className="mt-2 text-slate-500 font-bold tracking-widest text-xs uppercase">{error}</p>
         <button onClick={fetchData} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Retry Link</button>
      </div>
    );
  }

  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Info */}
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
            <p className="text-slate-500 font-medium mt-1">Cross-vertical operational intelligence hub.</p>
         </div>
         <div className="flex gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
               {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <button 
              onClick={() => setLoading(true) || fetchData()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
               <Activity size={16} />
               Refresh
            </button>
         </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Inventory" value={data.kpis.totalInventory.value} trend={data.kpis.totalInventory.trend} positive={data.kpis.totalInventory.positive} icon={Package} onClick={() => navigate('/admin/dashboard/inventory/list')} />
        <StatCard title="Low Stock Alerts" value={data.kpis.lowStockAlerts.value} trend={data.kpis.lowStockAlerts.trend} positive={data.kpis.lowStockAlerts.positive} icon={AlertCircle} iconColorClass="text-rose-600" iconBgClass="bg-rose-50" onClick={() => navigate('/admin/dashboard/inventory/alerts')} />
        <StatCard title="Active Workforce" value={data.kpis.activeEmployees.value} trend={data.kpis.activeEmployees.trend} positive={data.kpis.activeEmployees.positive} icon={Users} iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50" onClick={() => navigate('/admin/dashboard/hrms/employees')} />
        <StatCard title="Monthly Revenue" value={data.kpis.monthlyRevenue.value} trend={data.kpis.monthlyRevenue.trend} positive={data.kpis.monthlyRevenue.positive} icon={DollarSign} iconColorClass="text-amber-600" iconBgClass="bg-amber-50" onClick={() => navigate('/admin/dashboard/erp/finance')} />
        
        <StatCard title="Pending Leaves" value={data.kpis.pendingLeaves.value} trend={data.kpis.pendingLeaves.trend} positive={data.kpis.pendingLeaves.positive} icon={UserCheck} iconColorClass="text-indigo-600" iconBgClass="bg-indigo-50" onClick={() => navigate('/admin/dashboard/hrms/leave')} />
        <StatCard title="Active Deals" value={data.kpis.activeDeals.value} trend={data.kpis.activeDeals.trend} positive={data.kpis.activeDeals.positive} icon={Target} iconColorClass="text-purple-600" iconBgClass="bg-purple-50" onClick={() => navigate('/admin/dashboard/crm/deals')} />
        <StatCard title="Open Tickets" value={data.kpis.openTickets.value} trend={data.kpis.openTickets.trend} positive={data.kpis.openTickets.positive} icon={Ticket} iconColorClass="text-pink-600" iconBgClass="bg-pink-50" onClick={() => navigate('/admin/dashboard/crm/tickets')} />
        <StatCard title="New Leads" value={data.kpis.newLeads.value} trend={data.kpis.newLeads.trend} positive={data.kpis.newLeads.positive} icon={TrendingUp} iconColorClass="text-cyan-600" iconBgClass="bg-cyan-50" onClick={() => navigate('/admin/dashboard/crm/leads')} />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics: Revenue vs Expense */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Financial Velocity</h4>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Revenue</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Expense</span></div>
              </div>
           </div>
           <RevenueExpenseChart data={data.analytics.revenueVsExpense} />
        </div>

        {/* Workforce Distribution */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
           <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Workforce Distribution</h4>
           <div className="flex-1 flex items-center justify-center">
              <DistributionPie data={data.distributions.workforce} colors={PIE_COLORS} />
           </div>
           <div className="space-y-2 mt-6">
              {data.distributions.workforce.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]}}></div>
                      <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                   </div>
                   <span className="text-[11px] font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Middle Grid: More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Material Usage Trend */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Material Flux Trend</h4>
            <MaterialUsageChart data={data.analytics.materialUsageTrend} />
         </div>

         {/* Stock In Out Bar Chart */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Stock In vs Out Activity</h4>
            <StockInOutChart data={data.analytics.stockInOut} />
         </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Sales Channel Performance</h4>
            <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
               <div className="w-1/2">
                  <DistributionPie data={data.distributions.salesChannel} colors={PIE_COLORS} />
               </div>
               <div className="flex-1 space-y-3 w-full">
                  {data.distributions.salesChannel.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-md" style={{backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]}}></div>
                          <span className="text-xs font-bold text-slate-600">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900">{item.value}%</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Inventory Matrix Breakdown</h4>
            <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
               <div className="w-1/2">
                  <DistributionPie data={data.distributions.inventoryCategory} colors={['#6366f1', '#f59e0b', '#ec4899', '#10b981']} />
               </div>
               <div className="flex-1 space-y-3 w-full">
                  {data.distributions.inventoryCategory.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-md" style={{backgroundColor: ['#6366f1', '#f59e0b', '#ec4899', '#10b981'][idx % 4]}}></div>
                          <span className="text-xs font-bold text-slate-600">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900">{item.value} Units</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Interaction Stream / Recent Activity */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Interaction Stream</h4>
               <button className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                  Full Audit <ArrowRight size={12} />
               </button>
            </div>
            <ActivityTable data={data.tables.recentActivities} />
         </div>

         {/* Critical Thresholds / Low Stock */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Critical Stock Thresholds</h4>
               <button className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-1 hover:gap-2 transition-all">
                  Restock All <ArrowRight size={12} />
               </button>
            </div>
            <LowStockTable data={data.tables.lowStockParams} />
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
