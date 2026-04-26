import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../../redux/slices/ticketSlice';
import { 
  Ticket as TicketIcon, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Building2,
  Tag,
  ArrowRightCircle,
  BarChart2,
  Smile,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SupportTickets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tickets, loading } = useSelector((state) => state.tickets);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    dispatch(fetchTickets());
    const loadStats = async () => {
       const user = JSON.parse(sessionStorage.getItem('user'));
       const res = await axios.get('/api/crm/tickets/stats', { headers: { Authorization: `Bearer ${user.token}` } });
       setStats(res.data);
    };
    loadStats();
  }, [dispatch]);

  const getPriorityColor = (prio) => {
    switch(prio) {
      case 'critical': return 'bg-red-50 text-red-600 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-primary-50 text-primary-600 border-primary-100';
    }
  };

  const dashboardStats = [
    { label: 'Active Support Cases', value: tickets.filter(t => t.status !== 'closed').length, icon: TicketIcon, color: 'primary' },
    { label: 'Resolved (Last 24h)', value: '14', icon: CheckCircle2, color: 'emerald' },
    { label: 'Avg Resolution Time', value: '4.2h', icon: Zap, color: 'amber' },
    { label: 'Customer Satisfaction', value: '4.8/5', icon: Smile, color: 'blue' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-slate-900">Customer Support Help Desk</h2>
          <p className="text-slate-500 font-medium tracking-tight">Track and resolve all customer support tickets and help requests.</p>
        </div>
        <div className="flex gap-4">
            <button 
              onClick={() => navigate('create')}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
            >
              <Plus size={18} /> Initialize Support Case
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className={`p-4 bg-${stat.color === 'primary' ? 'blue' : stat.color}-50 text-${stat.color === 'primary' ? 'blue' : stat.color}-600 rounded-2xl`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
         <div className="px-10 py-2 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="flex gap-10">
               {['All Tickets', 'Pending Fulfillment', 'Resolution Audit'].map(tab => (
                 <button 
                  key={tab}
                  className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${tab === 'All Tickets' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab}
                    {tab === 'All Tickets' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-white px-5 py-2 rounded-2xl border border-slate-200 shadow-sm">
                  <Search size={14} className="text-slate-400" />
                  <input type="text" placeholder="Locate Ticket..." className="bg-transparent border-none outline-none ml-2 text-[10px] font-black uppercase tracking-widest w-40" />
               </div>
               <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm"><Filter size={16} /></button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left font-bold text-slate-500">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Identity</th>
                     <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder Hub</th>
                     <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                     <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status protocol</th>
                     <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {tickets.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-10 py-6">
                          <div>
                             <p className="font-black text-slate-900 uppercase text-xs italic leading-none">{t.ticketId}</p>
                             <p className="text-[10px] font-black text-slate-400 mt-2 uppercase italic truncate max-w-[200px]">{t.subject}</p>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <p className="font-black text-slate-700 text-xs uppercase italic flex items-center gap-2 mr-4"><Building2 size={14} className="text-slate-300" /> {t.customerId?.company}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-tighter truncate max-w-[150px]">{t.customerId?.email}</p>
                       </td>
                       <td className="px-10 py-6">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border mb-2 ${getPriorityColor(t.priority)}`}>
                             {t.priority}
                          </div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{t.category} SECTOR</p>
                       </td>
                       <td className="px-10 py-6">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border mx-auto w-fit ${
                             t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                          }`}>
                             {t.status}
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <div className="flex items-center justify-center gap-4">
                             <Link 
                               to={`${t._id}`}
                               className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all shadow-sm"
                             >
                                <ArrowRightCircle size={18} />
                             </Link>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {tickets.length === 0 && (
           <div className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-6">
              <TicketIcon size={80} strokeWidth={1} />
              <p className="font-black uppercase tracking-[0.4em] text-[10px]">Service registry awaiting stakeholder case initialization.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default SupportTickets;
