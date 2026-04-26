import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals } from '../../redux/slices/dealSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Target, 
  Trophy, 
  Layout, 
  List as ListIcon,
  DollarSign,
  Activity,
  ArrowRight,
  PieChart as PieChartIcon,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../utils/api';

const DealList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { deals, loading } = useSelector((state) => state.deals);
  const [viewMode, setViewMode] = useState('stages');
  const [wonLeads, setWonLeads] = useState([]);
  const [stats, setStats] = useState({ pipelineValue: [], winRate: { won: [{count: 0}], total: [{count: 0}] } });

  useEffect(() => {
    dispatch(fetchDeals());
    const loadData = async () => {
       try {
         const user = JSON.parse(sessionStorage.getItem('user'));
         const config = { headers: { Authorization: `Bearer ${user.token}` } };
         const [statsRes, leadRes] = await Promise.all([
            axios.get('/api/crm/deals/stats', config),
            axios.get('/api/crm/leads', config)
         ]);
         setStats(statsRes.data);
         // Filter leads that are WON but not yet converted to deals (assuming no dealId or similar check if needed)
         setWonLeads(leadRes.data.filter(l => l.status === 'won') || []);
       } catch (err) {
         console.error('Data sync failed');
       }
    };
    loadData();
  }, [dispatch]);

  const stages = [
    { id: 'prospecting', label: 'Inquiry Analysis' },
    { id: 'qualification', label: 'Project Confirmed' },
    { id: 'proposal', label: 'Price Given' },
    { id: 'negotiation', label: 'Final Talk' },
    { id: 'closed-won', label: 'Work Started' },
    { id: 'closed-lost', label: 'Cancelled' }
  ];

  const getStageColor = (stage) => {
    switch(stage) {
      case 'prospecting': return 'bg-blue-400';
      case 'qualification': return 'bg-indigo-400';
      case 'proposal': return 'bg-purple-400';
      case 'negotiation': return 'bg-amber-400';
      case 'closed-won': return 'bg-emerald-400';
      case 'closed-lost': return 'bg-red-400';
      default: return 'bg-slate-400';
    }
  };

  const totalPipeline = stats.pipelineValue.reduce((acc, curr) => acc + curr.total, 0);
  const winRatePercent = stats.winRate.total[0]?.count > 0 ? (stats.winRate.won[0]?.count / stats.winRate.total[0]?.count * 100).toFixed(1) : 0;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-slate-900">Business Deals History</h2>
          <p className="text-slate-500 font-medium tracking-tight">Monitor all your successful and lost deals in one clear view.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><ListIcon size={18} /></button>
              <button onClick={() => setViewMode('stages')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'stages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><Layout size={18} /></button>
           </div>
            <button 
              onClick={() => navigate('add')}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
            >
              <Plus size={18} /> Initialize Deal
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
            <div className="flex justify-between items-start relative z-10 mb-6 font-black uppercase text-primary-400 tracking-widest text-[10px]">
               <span>Total Pipeline Value</span>
               <TrendingUp size={20} />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter relative z-10">₹{totalPipeline.toLocaleString()}</h3>
            <p className="text-[10px] font-black text-white/30 uppercase mt-2 tracking-widest relative z-10">Projected Organizational Revenue</p>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-lg relative overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="flex justify-between items-start mb-6 font-black uppercase text-emerald-500 tracking-widest text-[10px]">
               <span>Closing Win Rate</span>
               <Trophy size={20} />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">{winRatePercent}%</h3>
            <div className="h-2 w-full bg-slate-50 mt-4 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${winRatePercent}%` }}></div>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-lg relative overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="flex justify-between items-start mb-6 font-black uppercase text-primary-500 tracking-widest text-[10px]">
               <span>Avg Deal Magnitude</span>
               <Activity size={20} />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">₹{(totalPipeline / (deals.length || 1)).toLocaleString()}</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">Per Strategic Engagement</p>
         </div>
      </div>

      {viewMode === 'stages' ? (
         <div className="flex gap-8 overflow-x-auto pb-10 scroller-hide min-h-[600px]">
            {stages.map(stageObj => {
                let stageDeals = deals.filter(d => d.stage === stageObj.id);
                // For prospecting stage, also include WON leads as potential deals
                if (stageObj.id === 'prospecting') {
                  const leadDeals = wonLeads.map(l => ({
                    _id: l._id,
                    title: l.title,
                    value: l.value || 0,
                    customerId: l.customerId,
                    isLead: true,
                    probability: 100
                  }));
                  stageDeals = [...stageDeals, ...leadDeals];
                }

                const stageValue = stageDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);
                return (
                   <div key={stageObj.id} className="w-80 shrink-0 space-y-6">
                      <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4 ml-4">
                         <div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 italic">{stageObj.label}</h4>
                            <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-1">₹{stageValue.toLocaleString()}</p>
                         </div>
                         <span className="text-[9px] font-black bg-slate-100 px-3 py-1 rounded-lg">{stageDeals.length}</span>
                      </div>
                      <div className="space-y-6">
                         {stageDeals.map(deal => (
                            <div key={deal._id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden">
                               <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStageColor(stageObj.id)}`}></div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2 truncate">{deal.customerId?.name || deal.customerId?.company || 'Nexus Stakeholder'}</p>
                               <h5 className="text-sm font-black text-slate-900 uppercase italic mb-4 leading-tight">{deal.title}</h5>
                               <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                                  <div>
                                     <p className="text-[10px] font-black text-slate-900">₹{(deal.value || 0).toLocaleString()}</p>
                                     <p className="text-[8px] font-black uppercase text-primary-400 tracking-widest mt-1">{deal.probability}% Prob.</p>
                                  </div>
                                   {deal.isLead ? (
                                      <Link to={`/admin/dashboard/crm/deals/add?leadId=${deal._id}`} className="px-3 py-1 bg-primary-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-slate-900 transition-all">Convert <ArrowRight size={10} /></Link>
                                   ) : (
                                      <Link to={`${deal._id}`} className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-all"><ArrowRight size={14} /></Link>
                                   )}
                               </div>
                            </div>
                         ))}
                         {stageDeals.length === 0 && (
                            <div className="p-20 text-center opacity-10 flex flex-col items-center gap-4 text-slate-900">
                               <Briefcase size={40} />
                               <p className="text-[8px] font-black uppercase tracking-[0.3em]">No Stage Volume</p>
                            </div>
                         )}
                      </div>
                   </div>
                );
            })}
         </div>
      ) : (
         <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden p-32 text-center">
            <ListIcon size={64} className="mx-auto text-slate-100 mb-6" />
            <p className="font-black uppercase tracking-[0.4em] text-[10px] text-slate-300">Detailed Settlement Ledger (List Mode) Incoming</p>
         </div>
      )}
    </div>
  );
};

export default DealList;
