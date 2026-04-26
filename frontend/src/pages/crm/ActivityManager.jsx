import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayActivities } from '../../redux/slices/activitySlice';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  User, 
  Target, 
  Briefcase,
  History,
  MoreVertical,
  Check
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ActivityManager = () => {
  const dispatch = useDispatch();
  const { today, loading } = useSelector((state) => state.activities);
  const [activeTab, setActiveTab] = useState('Today');
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    dispatch(fetchTodayActivities());
    const loadOverdue = async () => {
       const user = JSON.parse(sessionStorage.getItem('user'));
       const res = await axios.get('/api/crm/activities/overdue', { headers: { Authorization: `Bearer ${user.token}` } });
       setOverdue(res.data);
    };
    loadOverdue();
  }, [dispatch]);

  const handleComplete = async (id) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
       await axios.put(`/api/crm/activities/${id}/complete`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
       toast.success('Protocol Fulfillment Authenticated.');
       dispatch(fetchTodayActivities());
       const res = await axios.get('/api/crm/activities/overdue', { headers: { Authorization: `Bearer ${user.token}` } });
       setOverdue(res.data);
    } catch (err) { toast.error('Fulfillment Protocol Failure'); }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none">Productivity Velocity Monitor</h2>
          <p className="text-slate-500 font-medium tracking-tight">Real-time auditing of organizational tasks, stakeholder follow-ups, and engagement deadlines.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
             <Plus size={18} /> Schedule Engagement
           </button>
        </div>
      </div>

      <div className="flex gap-10 border-b border-slate-100 mb-10 overflow-x-auto scroller-hide">
         {['Today', 'Upcoming Sequence', 'Overdue Alerts', 'Full Audit'].map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0 ${activeTab.includes(tab.split(' ')[0]) ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
               {tab}
               {activeTab.includes(tab.split(' ')[0]) && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
               <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                     <Clock size={18} className="text-primary-600" /> Temporal Engagement Queue
                  </h4>
                  <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl text-[9px] font-black uppercase text-slate-400 tracking-widest">
                     Region: Global Hub-01
                  </div>
               </div>

               <div className="space-y-6">
                  {(activeTab === 'Today' ? today : overdue).map(act => (
                     <div key={act._id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group flex justify-between items-center gap-10">
                        <div className="flex items-center gap-8">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${
                             act.type === 'call' ? 'bg-amber-50 text-amber-500' : act.type === 'meeting' ? 'bg-primary-50 text-primary-600' : 'bg-emerald-50 text-emerald-600'
                           } group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                              {act.type[0].toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <p className="text-sm font-black text-slate-900 uppercase italic leading-none">{act.title}</p>
                                 <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                                    act.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'
                                 }`}>{act.priority}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                                 <Target size={12} className="text-primary-400" /> {act.leadId?.title || act.customerId?.name || 'Institutional Context'}
                              </p>
                              <div className="mt-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                                 <span className="flex items-center gap-1.5"><Clock size={12} /> {act.dueTime || 'All Day'}</span>
                                 <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(act.dueDate).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>
                        <button 
                           onClick={() => handleComplete(act._id)}
                           className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-200 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all hover:bg-emerald-50"
                        >
                           <CheckCircle2 size={24} />
                        </button>
                     </div>
                  ))}
                  {(activeTab === 'Today' ? today : overdue).length === 0 && (
                     <div className="p-32 text-center opacity-10 flex flex-col items-center gap-6">
                        <History size={80} strokeWidth={1} />
                        <p className="font-black uppercase tracking-[0.4em] text-[10px]">Productivity queue fully synchronized.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 italic">Velocity Metrics</h4>
               <div className="space-y-8 relative z-10">
                  <div className="pb-8 border-b border-white/5">
                     <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mb-4">Daily Fulfillment</p>
                     <div className="flex items-end gap-3 font-black text-white italic">
                        <span className="text-4xl leading-none">{(today.filter(t => t.status === 'completed').length / (today.length || 1) * 100).toFixed(0)}%</span>
                        <span className="text-[10px] uppercase text-emerald-400 pb-1 tracking-widest">+4.2% Optimization</span>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                        <span>Today's Sequence</span>
                        <span className="text-white italic">{today.length}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                        <span>Overdue Variance</span>
                        <span className="text-red-400 italic">{overdue.length}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900">Urgent Notifications</h4>
               <div className="space-y-6">
                  {overdue.slice(0, 2).map((adv, i) => (
                     <div key={i} className="flex gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                        <AlertCircle size={20} className="text-red-500 shrink-0" />
                        <div>
                           <p className="text-[10px] font-black text-red-900 uppercase italic leading-none mb-1 line-clamp-1">{adv.title}</p>
                           <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">{Math.floor((new Date() - new Date(adv.dueDate)) / (1000 * 60 * 60 * 24))} Days Late</p>
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

export default ActivityManager;
