import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Target, 
  Briefcase, 
  TrendingUp, 
  Trophy, 
  Clock, 
  Calendar, 
  Plus, 
  Layout, 
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SalesPersonDashboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ leads: 0, deals: 0, revenue: 0, activities: 0 });
  const [myLeads, setMyLeads] = useState([]);
  const [myActivities, setMyActivities] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const headers = { Authorization: `Bearer ${user.token}` };
      
      const resLeads = await axios.get(`/api/crm/leads?assignedTo=${currentUser._id}`, { headers });
      setMyLeads(resLeads.data);
      
      const resActs = await axios.get(`/api/crm/activities/today`, { headers });
      setMyActivities(resActs.data);

      setStats({
         leads: resLeads.data.length,
         deals: resLeads.data.filter(l => l.status === 'won').length,
         revenue: resLeads.data.filter(l => l.status === 'won').reduce((acc, curr) => acc + curr.value, 0),
         activities: resActs.data.length
      });
    };
    loadData();
  }, [currentUser]);

  const cards = [
    { label: 'My Portfolio Leads', value: stats.leads, icon: Target, color: 'primary' },
    { label: 'Conversion Volume', value: stats.deals, icon: Trophy, color: 'emerald' },
    { label: 'Cumulative Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: Briefcase, color: 'slate-900' },
    { label: 'Priority Objectives', value: stats.activities, icon: Clock, color: 'amber' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic leading-none">Operational Performance Hub</h2>
              <span className="px-3 py-1 bg-primary-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Sales Representative</span>
           </div>
           <p className="text-slate-500 font-medium tracking-tight">Personalized analytical dashboard for lifecycle management and target achievement monitoring.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
             <Plus size={18} /> Log Proposal
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`p-6 rounded-[2.5rem] border shadow-sm group hover:shadow-2xl transition-all ${
            card.color === 'slate-900' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className={`p-3 rounded-2xl mb-6 w-fit ${
               card.color === 'primary' ? 'bg-blue-50 text-blue-600' : card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : card.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-white/10 text-emerald-400'
            }`}>
               <card.icon size={24} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${card.color === 'slate-900' ? 'text-white/40' : 'text-slate-400'} mb-1`}>{card.label}</p>
            <h3 className={`text-2xl font-black italic tracking-tighter ${card.color === 'slate-900' ? 'text-white' : 'text-slate-900'}`}>{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
               <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                     <Layout size={18} className="text-primary-600" /> Pipeline Progression
                  </h4>
                  <div className="text-[10px] font-black text-primary-600 uppercase italic tracking-widest">Active Forecast: ₹1.8M</div>
               </div>
               <div className="flex gap-4 overflow-x-auto pb-4 scroller-hide">
                  {['new', 'qualified', 'proposal', 'negotiation'].map(stage => (
                     <div key={stage} className="w-64 shrink-0 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                           <span>{stage}</span>
                           <span className="bg-white px-2 py-0.5 rounded-lg">{myLeads.filter(l => l.status === stage).length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-600 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                  <TrendingUp size={18} className="text-primary-600" /> Target vs. Achievement Quotient
               </h4>
               <div className="space-y-12">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">Monthly Settlement Yield</p>
                        <p className="text-xs font-black text-slate-900">₹4.5M / ₹6.0M</p>
                     </div>
                     <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: '75%' }}></div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">Lead Acquisition Velocity</p>
                        <p className="text-xs font-black text-slate-900">85 / 100 Objectives</p>
                     </div>
                     <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                        <div className="h-full bg-primary-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: '85%' }}></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
               <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                     <Clock size={18} className="text-primary-600" /> Objective Queue
                  </h4>
                  <Link to="/crm/activities" className="text-[8px] font-black text-primary-600 uppercase border-b border-primary-100 pb-0.5">Full Queue</Link>
               </div>
               <div className="space-y-6">
                  {myActivities.length > 0 ? myActivities.map((act, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                       <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-primary-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          {act.type[0].toUpperCase()}
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">{act.title}</p>
                          <p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest">{act.dueTime || '14:30 Today'}</p>
                       </div>
                       <button className="w-8 h-8 rounded-xl bg-white text-slate-200 hover:text-emerald-500 transition-all"><CheckCircle2 size={18} /></button>
                    </div>
                  )) : (
                    <div className="p-10 text-center opacity-10 flex flex-col items-center gap-4">
                       <AlertCircle size={40} />
                       <p className="text-[8px] font-black uppercase tracking-[0.3em]">No Pending Objectives</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] italic text-white/50">Strategic Engagement</h4>
               <p className="text-xs font-bold text-white/60 leading-relaxed italic">"Excellence is not a protocol, but an organizational habit."</p>
               <button className="flex items-center justify-center gap-3 w-full py-5 bg-white text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all">
                  Next Objective <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SalesPersonDashboard;
