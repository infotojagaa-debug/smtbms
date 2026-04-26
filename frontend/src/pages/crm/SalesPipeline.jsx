import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals, updateDealStage, reset } from '../../redux/slices/crmSlice';
import { 
  Plus, 
  MoreVertical, 
  DollarSign, 
  User, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const SalesPipeline = () => {
  const dispatch = useDispatch();
  const { deals, isLoading, isError, message } = useSelector((state) => state.crm);

  const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed-Won'];

  useEffect(() => {
    dispatch(fetchDeals());
    if (isError) toast.error(message);
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  const handleMove = (id, stage) => {
    dispatch(updateDealStage({ id, stage }));
    toast.success(`Deal accelerated to ${stage}`);
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'Discovery': return 'border-t-blue-500';
      case 'Proposal': return 'border-t-purple-500';
      case 'Negotiation': return 'border-t-amber-500';
      case 'Closed-Won': return 'border-t-emerald-500';
      default: return 'border-t-slate-200';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sales Pipeline Kanban</h2>
          <p className="text-slate-500 font-medium">Visualize deal velocity, stage distribution, and acquisition probability.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
          <Plus size={18} /> Initiate New Deal
        </button>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
         {stages.map(stage => (
           <div key={stage} className="min-w-[350px] flex-shrink-0 flex flex-col gap-6">
              <div className="flex items-center justify-between px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm border-b-4 border-b-slate-100">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStageColor(stage).replace('border-t', 'bg')}`}></div>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">{stage}</h4>
                 </div>
                 <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-400 font-black text-[10px]">{deals.filter(d => d.stage === stage).length}</span>
              </div>

              <div className="flex-1 space-y-6">
                 {deals.filter(d => d.stage === stage).map(deal => (
                   <div key={deal._id} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 border-t-8 ${getStageColor(stage)} shadow-xl hover:shadow-2xl transition-all group relative`}>
                      <div className="absolute top-6 right-6">
                         <button className="text-slate-300 hover:text-slate-600 transition-colors">
                            <MoreVertical size={18} />
                         </button>
                      </div>

                      <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{deal.customer?.company || 'Authorized Client'}</p>
                            <h5 className="font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors uppercase tracking-tight">{deal.title}</h5>
                         </div>

                         <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-2">
                               <DollarSign size={14} className="text-emerald-500" />
                               <span className="font-black text-slate-900 italic">${deal.value.toLocaleString()}</span>
                            </div>
                            <div className="flex -space-x-2">
                               <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black">AD</div>
                            </div>
                         </div>

                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-1.5"><Clock size={12} /> 12d Active</div>
                            {stage !== 'Closed-Won' && (
                              <button 
                                onClick={() => handleMove(deal._id, stages[stages.indexOf(stage) + 1])}
                                className="flex items-center gap-1 text-primary-500 hover:gap-2 transition-all"
                              >
                                Accelerate <ArrowRight size={12} />
                              </button>
                            )}
                         </div>
                      </div>
                   </div>
                 ))}

                 {deals.filter(d => d.stage === stage).length === 0 && (
                   <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-10 opacity-30">
                      <Briefcase size={32} className="text-slate-300 mb-4" />
                      <p className="font-black uppercase tracking-widest text-[9px]">Awaiting deal sequence initialization.</p>
                   </div>
                 )}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default SalesPipeline;
