import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Briefcase, 
  ArrowLeft, 
  User, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Trophy, 
  CheckCircle2, 
  XSquare, 
  Calendar, 
  Clock, 
  Package, 
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DealDetail = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementData, setSettlementData] = useState({ status: 'closed-won', lostReason: '' });

  const loadDeal = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get(`/api/crm/deals/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setDeal(res.data);
  };

  const handleFinalize = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await axios.put(`/api/crm/deals/${id}/close`, { 
        status: settlementData.status, 
        lostReason: settlementData.lostReason 
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`Settlement Protocol Executed: Deal Marked as ${settlementData.status.toUpperCase()}`);
      setShowSettlementModal(false);
      loadDeal();
    } catch (err) {
      toast.error('Strategic Settlement Error: Could not finalize deal magnitude.');
    }
  };

  useEffect(() => { loadDeal(); }, [id]);

  if (!deal) return <div className="p-20 text-center font-black animate-pulse uppercase italic tracking-widest text-slate-300">Auditing Settlement Path...</div>;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-start text-slate-900 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
           <Link to="/crm/deals" className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={22} />
           </Link>
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <h2 className="text-3xl font-black tracking-tight leading-none italic uppercase">{deal.title}</h2>
                 <span className={`px-3 py-1 border rounded-xl text-[9px] font-black uppercase tracking-widest ${
                   deal.stage === 'closed-won' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                 }`}>{deal.stage}</span>
              </div>
              <p className="text-slate-400 font-black text-xs tracking-widest uppercase flex items-center gap-2">Contractual Registry: {deal.dealId} • {deal.probability}% Probability Anchor</p>
           </div>
        </div>
        <div className="flex gap-4">
           {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
             <>
               <button className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-3xl hover:bg-slate-200 transition-all active:scale-95">
                 Optimize Probability
               </button>
               <button 
                  onClick={() => setShowSettlementModal(true)}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95"
                >
                 <Trophy size={18} /> Finalize Settlement
               </button>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-12">
            <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 opacity-20 blur-[100px]"></div>
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 italic">Total Settlement Magnitude</p>
                     <h3 className="text-6xl font-black italic tracking-tighter text-emerald-400">₹{deal.value.toLocaleString()}</h3>
                  </div>
                  <TrendingUp size={60} className="text-white/5 opacity-20" />
               </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                  <Package size={20} className="text-primary-600" /> Contractual Artifacts & Line Items
               </h4>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <th className="py-4">Resource Identity</th>
                           <th className="py-4 text-center">Magnitude</th>
                           <th className="py-4 text-right">Yield (₹)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {deal.products.map((p, i) => (
                           <tr key={i} className="group">
                              <td className="py-6">
                                 <p className="font-black text-slate-900 text-xs italic uppercase">{p.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">SKU REF: DEF-{Math.floor(Math.random()*1000)}</p>
                              </td>
                              <td className="py-6 text-center text-xs font-black text-slate-900 uppercase italic">x{p.quantity}</td>
                              <td className="py-6 text-right font-black text-slate-900 text-xs italic">₹{p.price.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-8">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                  <ShieldAlert size={20} className="text-primary-600" /> Competitive Landscape Auditing
               </h4>
               <div className="flex flex-wrap gap-4">
                  {deal.competitors.map((c, i) => (
                     <div key={i} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 italic">Target: {c}</div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900">Strategic Stakeholder</h4>
               <div className="space-y-8">
                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xs italic">C</div>
                     <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase italic">{deal.customerId?.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{deal.customerId?.company}</p>
                     </div>
                  </div>
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Exp. Closure</span>
                        <span className="text-slate-900 italic">{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Assigned Hub</span>
                        <span className="text-primary-600 italic bg-primary-50 px-3 py-1 rounded-lg">{deal.assignedTo?.name || 'Awaiting Hub'}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900">Next Action Protocol</h4>
               <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100 space-y-4">
                  <div className="flex items-center gap-3 text-primary-600">
                     <Clock size={18} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Pending Decision</span>
                  </div>
                  <p className="text-[10px] font-bold text-primary-400 uppercase italic leading-relaxed">Executive follow-up required regarding contractual variance on line item magnitude.</p>
                  <button className="w-full py-4 bg-primary-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all">Mark Resolution</button>
               </div>
            </div>
         </div>
      </div>

      {showSettlementModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl max-w-4xl w-full p-16 space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-5 blur-3xl"></div>
              <div className="text-center space-y-4">
                 <h3 className="text-3xl font-black italic uppercase tracking-tight text-slate-900">Finalize Strategic Settlement</h3>
                 <p className="text-slate-500 font-medium italic">Select the terminal outcome for this contractual engagement.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <button 
                   onClick={() => setSettlementData({...settlementData, status: 'closed-won'})}
                   className={`p-10 rounded-[3rem] border-4 transition-all text-left space-y-6 ${
                     settlementData.status === 'closed-won' ? 'border-emerald-500 bg-emerald-50 shadow-xl scale-105' : 'border-slate-50 bg-slate-50 opacity-60'
                   }`}
                 >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Trophy size={26} /></div>
                    <div>
                       <h4 className="text-xl font-black italic uppercase text-slate-900">Authorize Won</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">Contract successfully secured. Magnitude added to active revenue.</p>
                    </div>
                 </button>

                 <button 
                   onClick={() => setSettlementData({...settlementData, status: 'closed-lost'})}
                   className={`p-10 rounded-[3rem] border-4 transition-all text-left space-y-6 ${
                     settlementData.status === 'closed-lost' ? 'border-red-500 bg-red-50 shadow-xl scale-105' : 'border-slate-50 bg-slate-50 opacity-60'
                   }`}
                 >
                    <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20"><XSquare size={26} /></div>
                    <div>
                       <h4 className="text-xl font-black italic uppercase text-slate-900">Mark as Lost</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">Engagement failed. Audit reason required for diagnostic reporting.</p>
                    </div>
                 </button>
              </div>

              {settlementData.status === 'closed-lost' && (
                <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 italic">Lost Reason / Diagnostic Audit</label>
                   <textarea 
                     className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none"
                     placeholder="Specify why the deal was lost..."
                     value={settlementData.lostReason}
                     onChange={(e) => setSettlementData({...settlementData, lostReason: e.target.value})}
                   />
                </div>
              )}

              <div className="flex gap-6 pt-6">
                 <button 
                   onClick={() => setShowSettlementModal(false)}
                   className="flex-1 py-6 bg-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-xs rounded-[2.5rem] hover:text-slate-900 transition-all"
                 >
                    Abort Protocol
                 </button>
                 <button 
                   onClick={handleFinalize}
                   className="flex-[2] py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                 >
                    Execute Settlement <CheckCircle2 size={20} className="group-hover:scale-125 transition-all" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DealDetail;
