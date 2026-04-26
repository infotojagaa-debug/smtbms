import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterials, reset } from '../../redux/slices/materialSlice';
import { 
  Package, 
  AlertCircle, 
  ArrowRightLeft, 
  Layers, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Bell,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const InventoryDashboard = () => {
  const dispatch = useDispatch();
  const { materials, isLoading, isError, message } = useSelector((state) => state.material);

  useEffect(() => {
    dispatch(fetchMaterials({ limit: 100 })); // Get more for stats
    if (isError) toast.error(message);
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  // Calculations
  const totalMaterials = materials.length;
  const lowStockItems = materials.filter(m => m.quantity <= m.minStockLevel).length;
  const departments = [...new Set(materials.map(m => m.department))].length;
  const totalValue = materials.reduce((acc, curr) => acc + (curr.quantity * 10), 0); // Mock value calculation

  const categoryData = materials.reduce((acc, curr) => {
    const existing = acc.find(a => a.name === curr.category);
    if (existing) {
      existing.stock += curr.quantity;
    } else {
      acc.push({ name: curr.category, stock: curr.quantity });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 pb-10">
      {/* Critical Stock Alert Banner */}
      {lowStockItems > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-6 text-white flex items-center justify-between shadow-2xl shadow-red-500/20 animate-pulse">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                 <AlertCircle size={24} />
              </div>
              <div>
                 <p className="text-sm font-black uppercase tracking-widest opacity-80">Critical Attention Required</p>
                 <h4 className="text-xl font-black">{lowStockItems} Items are below minimum stock thresholds.</h4>
              </div>
           </div>
           <Link to="/material/alerts" className="px-6 py-3 bg-white text-red-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2">
              Review Alerts <ArrowRight size={18} />
           </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Package size={24} />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Data</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Global Registry</p>
          <h3 className="text-4xl font-black text-slate-900 mt-1">{totalMaterials}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-4 bg-red-50 text-red-600 rounded-3xl group-hover:bg-red-600 group-hover:text-white transition-all">
                <AlertCircle size={24} />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shortages</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Low Stock Items</p>
          <h3 className="text-4xl font-black text-slate-900 mt-1">{lowStockItems}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Layers size={24} />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Unique Departments</p>
          <h3 className="text-4xl font-black text-slate-900 mt-1">{departments}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                <ArrowRightLeft size={24} />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Total Asset Value</p>
          <h3 className="text-4xl font-black text-slate-900 mt-1">${totalValue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
           <div className="flex justify-between items-center mb-10">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                 <TrendingUp size={16} className="text-primary-500" />
                 Stock Concentration by Category
              </h4>
           </div>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={categoryData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                   <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                   />
                   <Bar dataKey="stock" radius={[12, 12, 0, 0]} barSize={60}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-8 flex flex-col">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center flex-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 opacity-10 rounded-bl-full"></div>
              <h4 className="font-black uppercase tracking-widest text-[11px] self-start mb-6 text-primary-400">Department Distribution</h4>
              <div className="h-60 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={categoryData} // Using category data as surrogate for visualization
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={10}
                          dataKey="stock"
                       >
                          {categoryData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
              <h4 className="font-black uppercase tracking-widest text-[11px] text-slate-400 flex items-center gap-2">
                 <Bell size={14} className="text-amber-500" />
                 Recent Ledger Activity
              </h4>
              <div className="divide-y divide-slate-50">
                 {materials.slice(0, 3).map(m => (
                    <div key={m._id} className="py-4 flex justify-between items-center group">
                       <p className="text-xs font-bold text-slate-600 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{m.name}</p>
                       <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 transition-colors">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
