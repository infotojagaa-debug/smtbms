import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Ticket as TicketIcon, 
  ArrowLeft, 
  User, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  Paperclip, 
  ShieldAlert, 
  ChevronRight,
  UserCheck,
  Building2,
  Mail,
  Zap,
  Smile,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isInternal, setIsInternal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const loadTicket = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get(`/api/crm/tickets/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setData(res.data);
  };

  useEffect(() => { loadTicket(); }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.post(`/api/crm/tickets/${id}/comment`, {
        comment: newComment,
        isInternal: isInternal
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setNewComment('');
      loadTicket();
      toast.success('Engagement Protocol Logged.');
    } catch (err) { toast.error('Engagement Audit Failure'); }
  };

  const handleResolve = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
       await axios.put(`/api/crm/tickets/${id}/resolve`, { resolution: 'Functional resolution via support console.' }, {
          headers: { Authorization: `Bearer ${user.token}` }
       });
       toast.success('Case Fulfillment Satisfied.');
       loadTicket();
    } catch (err) { toast.error('Resolution Protocol Failure'); }
  };

  if (!data) return <div className="p-20 text-center font-black animate-pulse uppercase italic tracking-widest text-slate-300">Retrieving Support Protocol...</div>;

  const { ticket, comments } = data;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-start text-slate-900 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
           <Link to="/crm/tickets" className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={22} />
           </Link>
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-none italic uppercase">{ticket.subject}</h2>
                 <span className={`px-3 py-1 border rounded-xl text-[9px] font-black uppercase tracking-widest ${
                   ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                 }`}>{ticket.status}</span>
              </div>
              <p className="text-slate-400 font-black text-xs tracking-widest uppercase flex items-center gap-2">Ticket Registry: {ticket.ticketId} • <ShieldAlert size={12} className="text-amber-500" /> {ticket.priority} Priority</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           {ticket.status !== 'resolved' && (
             <button 
              onClick={handleResolve}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95"
             >
               <CheckCircle2 size={18} /> Finalize Resolution
             </button>
           )}
           <button className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-3xl hover:bg-slate-200 transition-all active:scale-95">
             <UserCheck size={18} /> Reassign Custodian
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-12">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
                  <TicketIcon size={18} className="text-primary-600" /> Support Disposition
               </h4>
               <p className="text-sm font-bold text-slate-900 uppercase italic leading-loose p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  {ticket.description}
               </p>
               <div className="pt-4 flex items-center gap-10 text-[9px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50">
                  <div className="flex items-center gap-2"><Clock size={14} className="text-primary-400" /> Created {new Date(ticket.createdAt).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><Zap size={14} className="text-amber-400" /> First Response: {ticket.firstResponseAt ? new Date(ticket.firstResponseAt).toLocaleTimeString() : 'Awaiting Engagement'}</div>
               </div>
            </div>

            <div className="space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900 flex items-center gap-2 px-4">
                  <MessageSquare size={18} className="text-primary-600" /> Engagement Timeline
               </h4>
               <div className="space-y-8 relative pl-8 border-l border-slate-50 ml-4">
                  {comments.map((comm, idx) => (
                     <div key={idx} className={`p-8 rounded-[3.5rem] border group transition-all relative ${
                        comm.isInternal ? 'bg-amber-50/30 border-amber-100 text-amber-900' : 'bg-white border-slate-100 text-slate-900'
                     }`}>
                        <div className="flex justify-between items-center mb-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs italic uppercase">{comm.createdBy?.name[0]}</div>
                              <div>
                                 <p className="text-[10px] font-black uppercase italic leading-none">{comm.createdBy?.name}</p>
                                 {comm.isInternal && <p className="text-[8px] font-black text-amber-500 uppercase mt-1 tracking-widest">Internal Protocol</p>}
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(comm.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-bold leading-relaxed">{comm.comment}</p>
                     </div>
                  ))}
               </div>

               <form onSubmit={handleAddComment} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900">Authorize Engagement Log</h4>
                     <button 
                        type="button"
                        onClick={() => setIsInternal(!isInternal)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                           isInternal ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                     >
                        {isInternal ? <EyeOff size={12} /> : <Eye size={12} />}
                        {isInternal ? 'Internal Protocol' : 'Public Engagement'}
                     </button>
                  </div>
                  <textarea 
                     className="w-full p-8 bg-slate-50 border-none rounded-[3rem] text-sm font-bold text-slate-900 outline-none shadow-inner min-h-[150px] placeholder:text-slate-200"
                     placeholder="Deploy resolution or engagement details..."
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <div className="flex justify-between items-center">
                     <button type="button" className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:text-primary-600 transition-all"><Paperclip size={20} /></button>
                     <button type="submit" className="px-12 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-3xl hover:bg-primary-600 transition-all flex items-center gap-3 shadow-2xl active:scale-95">
                        Dispatch Engagement <Send size={18} />
                     </button>
                  </div>
               </form>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 italic">Strategic Stakeholder</h4>
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary-400 text-xl italic overflow-hidden shadow-2xl">
                        {ticket.customerId?.photo ? <img src={ticket.customerId.photo} className="w-full h-full object-cover" /> : <User size={30} />}
                     </div>
                     <div>
                        <p className="text-lg font-black text-white italic leading-none">{ticket.customerId?.name}</p>
                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mt-2">{ticket.customerId?.company}</p>
                     </div>
                  </div>
                  <div className="space-y-6 pt-6 border-t border-white/5">
                     <div className="flex items-center gap-4 text-white/60">
                        <Mail size={16} className="text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{ticket.customerId?.email}</span>
                     </div>
                     <div className="flex items-center gap-4 text-white/60">
                        <Building2 size={16} className="text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Industry: {ticket.customerId?.industry}</span>
                     </div>
                  </div>
                  <Link 
                    to={`/crm/customers/${ticket.customerId?._id}`}
                    className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group"
                  >
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Stakeholder 360 View</p>
                     <ChevronRight size={18} className="text-primary-500 group-hover:translate-x-2 transition-all" />
                  </Link>
               </div>
            </div>

            {ticket.status === 'resolved' && (
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 animate-in bounce-in duration-700">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-slate-900">Resolution Payload</h4>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                     <div className="flex items-center gap-3 text-emerald-600">
                        <Smile size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Satisfaction Quotient</span>
                     </div>
                     <p className="text-[10px] font-bold text-emerald-600/60 uppercase italic leading-relaxed">System awaiting stakeholder feedback regarding resolution magnitude.</p>
                     <div className="flex gap-2">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-400 opacity-30">{i}</div>)}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TicketDetail;
