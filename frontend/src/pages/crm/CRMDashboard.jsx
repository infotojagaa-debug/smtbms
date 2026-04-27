import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Target, 
  Briefcase, 
  Ticket, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import { fetchLeadPipeline } from '../../redux/slices/leadSlice';

const CRMDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers } = useSelector((state) => state.customers);
  const { pipeline } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchLeadPipeline());
  }, [dispatch]);

  const stats = [
    { label: 'Strategic Partners', value: customers.filter(c => c.isStrategicPartner).length || '0', delta: '+12%', icon: Users, color: 'primary' },
    { label: 'Pipeline Value', value: `₹${Object.values(pipeline).reduce((acc, curr) => acc + (curr.totalValue || 0), 0).toLocaleString()}`, delta: '+5%', icon: Target, color: 'amber' },
    { label: 'Settlement Yield', value: `₹${customers.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0).toLocaleString()}`, delta: '+18%', icon: Briefcase, color: 'emerald' },
    { label: 'Support SLA', value: '98.2%', delta: '+2%', icon: Ticket, color: 'red' },
  ];

  const funnelData = Object.keys(pipeline).map(stage => ({
    name: stage.toUpperCase(),
    value: pipeline[stage].count,
    amount: pipeline[stage].totalValue
  }));

  const trendData = [
    { name: 'Jan', won: 4000, lost: 2400 },
    { name: 'Feb', won: 3000, lost: 1398 },
    { name: 'Mar', won: 2000, lost: 9800 },
    { name: 'Apr', won: 2780, lost: 3908 },
    { name: 'May', won: 1890, lost: 4800 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic leading-none">Strategic Intelligence Hub</h2>
          <p className="text-slate-500 font-medium tracking-tight">Consolidated auditing of relationship lifecycle, pipeline velocity, and support satisfaction metrics.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button 
             onClick={() => navigate('/admin/dashboard/crm/customers')}
             className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
           >
             <Plus size={18} /> Add Strategic Partner
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`p-4 bg-${stat.color === 'primary' ? 'blue' : stat.color}-50 text-${stat.color === 'primary' ? 'blue' : stat.color}-600 rounded-3xl group-hover:bg-slate-900 group-hover:text-white transition-all`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
              <p className="text-[9px] font-black text-emerald-500 uppercase mt-1 italic">{stat.delta} Yield</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6 lg:space-y-10">
           <div className="bg-white p-5 lg:p-10 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6 lg:space-y-10">
              <div className="flex justify-between items-center">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                    <TrendingUp size={18} className="text-primary-600" /> Conversion Velocity Trends
                 </h4>
                 <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                    <option>Last 6 Quarters</option>
                 </select>
              </div>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                       <defs>
                          <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                       <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                       <Area type="monotone" dataKey="won" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWon)" strokeWidth={4} />
                       <Area type="monotone" dataKey="lost" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
              <div className="bg-white p-5 lg:p-10 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6 lg:space-y-8">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic">Pipeline Funnel Distribution</h4>
                 <div className="space-y-6">
                    {funnelData.slice(0, 5).map((stage, idx) => (
                       <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stage.name}</p>
                             <p className="text-xs font-black text-slate-900">{stage.value} Leads</p>
                          </div>
                          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                             <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(stage.value / 50) * 100}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 p-5 lg:p-10 rounded-[2rem] lg:rounded-[3.5rem] shadow-2xl space-y-6 lg:space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-white/50">Leaderboard Protocol</h4>
                 <div className="space-y-6 relative z-10">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-xs italic group-hover:bg-primary-600 transition-all border border-white/10">SA</div>
                             <div>
                                <p className="text-[11px] font-black text-white uppercase italic">Sebastian Alistair</p>
                                <p className="text-[9px] font-black text-emerald-400 tracking-tighter uppercase">₹1.2M Closed</p>
                             </div>
                          </div>
                          <div className="text-[10px] font-black text-white italic">Rank #{i}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6 lg:space-y-10">
          <div className="bg-white p-5 lg:p-10 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6 lg:space-y-8 h-full">
             <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                   <Calendar size={18} className="text-primary-600" /> Temporal Tasks
                </h4>
                <span className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-tighter animate-pulse">3 Overdue</span>
             </div>
             
             <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer border-l-4 border-l-primary-600">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Meeting Sequence</span>
                         <MoreVertical size={14} className="text-slate-300 group-hover:text-slate-900" />
                      </div>
                      <p className="text-xs font-black text-slate-900 italic uppercase mb-1">Contractual Resolution - Zenith Corp</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Due 14:30 Today</p>
                      <div className="mt-4 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-primary-600 border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-lg bg-emerald-600 border-2 border-white"></div>
                         </div>
                         <button className="text-[9px] font-black uppercase text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">Proceed <ArrowRight size={10} /></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
