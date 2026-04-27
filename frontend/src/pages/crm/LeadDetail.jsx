import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Target, 
  ArrowLeft, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Building2,
  Phone,
  Mail,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  History,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadDetail = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const loadLead = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get(`/api/crm/leads/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setLead(res.data);
  };

  useEffect(() => { loadLead(); }, [id]);

  if (!lead) return <div className="p-20 text-center font-black animate-pulse uppercase italic tracking-widest text-slate-300">Auditing Acquisition Path...</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'won': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'lost': return 'bg-red-50 text-red-600 border-red-100';
      case 'new': return 'bg-primary-50 text-primary-600 border-primary-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-start text-slate-900 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
           <Link to="/crm/leads" className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={22} />
           </Link>
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-none italic uppercase">{lead.title}</h2>
                 <span className={`px-3 py-1 border rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>{lead.status}</span>
              </div>
              <p className="text-slate-400 font-black text-xs tracking-widest uppercase flex items-center gap-2">Protocol Registry: {lead.leadId} • <AlertCircle size={12} className="text-amber-500" /> {lead.priority} Priority</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           {lead.status === 'won' && (
             <button className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">
               <TrendingUp size={18} /> Convert to Deal
             </button>
           )}
           <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
             <MessageSquare size={18} /> Log Interaction
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            <div className="flex gap-10 border-b border-slate-100 overflow-x-auto scroller-hide">
               {['Overview', 'Communications', 'Activities', 'Collaboration'].map(tab => (
                  <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0 ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     {tab}
                     {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                  </button>
               ))}
            </div>

            {activeTab === 'Overview' && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                        <Target size={18} className="text-primary-600" /> Acquisition parameters
                     </h4>
                     <div grid-cols-1 sm:grid-cols-2>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projected Yield</p>
                           <p className="text-2xl font-black italic text-slate-900">₹{(lead.value || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Protocol</p>
                           <p className="text-sm font-black uppercase italic text-primary-600">{lead.source}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Hub</p>
                           <p className="text-sm font-black uppercase italic text-slate-900">{lead.assignedTo?.name || 'Custodian Required'}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 space-y-10">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                        <History size={18} className="text-primary-600" /> Lifecycle Anchors
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center gap-4">
                           <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Clock size={20} /></div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Last Interaction</p>
                              <p className="text-xs font-black text-slate-900 uppercase italic">{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'No recorded activity'}</p>
                           </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center gap-4">
                           <div className="p-3 bg-primary-50 text-primary-500 rounded-2xl"><Calendar size={20} /></div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Follow-up deadline</p>
                              <p className="text-xs font-black text-slate-900 uppercase italic">{lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Temporal anchor undefined'}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'Communications' && (
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
                  <div className="text-center p-20 opacity-20">
                     <MessageSquare size={64} className="mx-auto mb-6" strokeWidth={1} />
                     <p className="font-black uppercase tracking-[0.4em] text-[10px]">Intersectional Interaction Ledger Protocols Initializing</p>
                  </div>
               </div>
            )}
         </div>

         <div className="space-y-10">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 italic">Strategic Stakeholder</h4>
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary-400 text-xl italic overflow-hidden shadow-2xl">
                        {lead.customerId?.photo ? <img src={lead.customerId.photo} className="w-full h-full object-cover" /> : <User size={30} />}
                     </div>
                     <div>
                        <p className="text-lg font-black text-white italic leading-none">{lead.customerId?.name}</p>
                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mt-2">{lead.customerId?.company}</p>
                     </div>
                  </div>
                  <div className="space-y-6 pt-6 border-t border-white/5">
                     <div className="flex items-center gap-4 text-white/60">
                        <Mail size={16} className="text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{lead.customerId?.email}</span>
                     </div>
                     <div className="flex items-center gap-4 text-white/60">
                        <Phone size={16} className="text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{lead.customerId?.phone}</span>
                     </div>
                  </div>
                  <Link 
                    to={`/crm/customers/${lead.customerId?._id}`}
                    className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group"
                  >
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Stakeholder 360 View</p>
                     <ChevronRight size={18} className="text-primary-500 group-hover:translate-x-2 transition-all" />
                  </Link>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                  <CheckCircle2 size={18} className="text-emerald-500" /> Conversion Matrix
               </h4>
               <div className="space-y-4">
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-4">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center italic">65% Conversion Probability Recorded</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LeadDetail;
