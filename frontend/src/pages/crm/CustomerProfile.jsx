import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerDetails } from '../../redux/slices/customerSlice';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Target, 
  Plus, 
  MessageSquare, 
  ArrowLeft,
  Calendar,
  Ticket as TicketIcon,
  Activity,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

const CustomerProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedCustomer, loading } = useSelector((state) => state.customers);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    dispatch(fetchCustomerDetails(id));
  }, [dispatch, id]);

  if (!selectedCustomer) return <div className="p-20 text-center font-black animate-pulse uppercase italic tracking-widest text-slate-300">Retrieving Stakeholder Identity...</div>;

  const { customer, leads, deals, communications, tickets } = selectedCustomer;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 opacity-5 blur-[100px]"></div>
         <div className="flex items-center gap-10 relative z-10">
            <Link to="/crm/customers" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><ArrowLeft size={22} /></Link>
            <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center font-black text-primary-500 overflow-hidden shadow-inner border border-slate-50">
               {customer.photo ? <img src={customer.photo} className="w-full h-full object-cover" /> : <User size={40} />}
            </div>
            <div>
               <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-none italic uppercase">{customer.name}</h2>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">{customer.status}</span>
               </div>
               <p className="font-black text-slate-400 text-xs italic uppercase flex items-center gap-2"><Building2 size={16} className="text-primary-500" /> {customer.company} • {customer.designation}</p>
            </div>
         </div>
         <div className="flex gap-4 relative z-10">
            <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
               <Plus size={18} /> New Engagement
            </button>
            <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] hover:text-slate-900 transition-all shadow-sm">
               <MessageSquare size={20} />
            </button>
         </div>
      </div>

      <div className="flex gap-10 overflow-x-auto scroller-hide border-b border-slate-100">
         {['Overview', 'Leads', 'Deals', 'Communications', 'Activities', 'Tickets'].map(tab => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            {activeTab === 'Overview' && (
               <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                           <User size={18} className="text-primary-600" /> Core Bio-Data
                        </h4>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                              <span className="text-slate-400">Electronic Mail</span>
                              <span className="text-slate-900 italic">{customer.email}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                              <span className="text-slate-400">Mobile Frequency</span>
                              <span className="text-slate-900 italic">{customer.phone}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                              <span className="text-slate-400">Industry Sector</span>
                              <span className="text-primary-600 italic bg-primary-50 px-3 py-1 rounded-lg">{customer.industry}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                           <MapPin size={18} className="text-primary-600" /> Geographical Node
                        </h4>
                        <div className="space-y-6">
                           <p className="text-xs font-black text-slate-900 uppercase italic leading-loose">
                              {customer.address?.street}<br />
                              {customer.address?.city}, {customer.address?.state}<br />
                              {customer.address?.country} - {customer.address?.pincode}
                           </p>
                           <div className="pt-4 border-t border-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2">
                              <Tag size={12} className="text-primary-400" /> {customer.source} acquisition
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 opacity-20 blur-[100px]"></div>
                     <div className="relative z-10 flex justify-between items-center">
                        <div>
                           <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 italic">Fiscal Yield Portfolio</h4>
                           <div className="flex items-end gap-6">
                              <h3 className="text-5xl font-black italic tracking-tighter text-emerald-400 leading-none">₹{customer.totalRevenue.toLocaleString()}</h3>
                              <div className="pb-1 text-[11px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                 <TrendingUp size={16} className="text-emerald-500" /> Across {customer.totalDeals} settlements
                              </div>
                           </div>
                        </div>
                        <Briefcase size={80} className="text-white/5 opacity-10" />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'Communications' && (
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
                  <div className="flex justify-between items-center">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900">Relationship Lifecycle Feed</h4>
                     <button className="text-[10px] font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">Log Interaction <Plus size={14} /></button>
                  </div>
                  <div className="space-y-12 relative pl-8">
                     <div className="absolute left-10 top-2 bottom-2 w-0.5 bg-slate-50"></div>
                     {communications.map((comm, idx) => (
                        <div key={idx} className="relative group">
                           <div className={`absolute -left-12 top-0 w-8 h-8 rounded-xl border-4 border-white shadow-sm flex items-center justify-center text-white text-[10px] ${
                             comm.type === 'call' ? 'bg-amber-500' : comm.type === 'email' ? 'bg-primary-500' : 'bg-emerald-500'
                           }`}>
                              {comm.type[0].toUpperCase()}
                           </div>
                           <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                 <h5 className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight">{comm.subject}</h5>
                                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(comm.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight leading-relaxed line-clamp-2">{comm.content}</p>
                              <div className="pt-4 flex items-center gap-6 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                 <span className="flex items-center gap-1.5"><ChevronRight size={10} className="text-primary-500" /> {comm.direction}</span>
                                 <span className="flex items-center gap-1.5"><ChevronRight size={10} className="text-primary-500" /> Outcome: {comm.outcome}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Leads, Deals, Activities, Tickets tabs would have similar high-end list components */}
            {['Leads', 'Deals', 'Activities', 'Tickets'].includes(activeTab) && (
               <div className="bg-white p-20 rounded-[4rem] border border-slate-50 shadow-sm text-center">
                  <Activity size={48} className="mx-auto text-slate-100 mb-6" strokeWidth={1} />
                  <p className="font-black uppercase tracking-[0.4em] text-[10px] text-slate-300">Detailed {activeTab} Ledger Protocol Incoming</p>
               </div>
            )}
         </div>

         <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                  <Target size={18} className="text-primary-600" /> Strategic Anchoring
               </h4>
               <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Assigned Custodian</p>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xs italic">SA</div>
                        <div>
                           <p className="text-[11px] font-black text-slate-900 uppercase italic">Sebastian Alistair</p>
                           <p className="text-[9px] font-black text-primary-500 tracking-tighter uppercase">Lead Representative</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Portfolio Analytics</p>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span>Active Leads</span>
                           <span className="text-slate-900 italic">{leads.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span>Support Cases</span>
                           <span className="text-red-500 italic">{tickets.filter(t => t.status !== 'closed').length}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
