import { useState, useEffect } from 'react';
import { 
  XSquare, 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Send, 
  Plus, 
  Calendar, 
  Clock, 
  Paperclip,
  TrendingUp,
  Layout,
  Check
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LogCommunicationModal = ({ isOpen, onClose, customerId, leadId, dealId, onLogSuccess }) => {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    leadId: leadId || '',
    dealId: dealId || '',
    type: 'call',
    direction: 'outgoing',
    subject: '',
    content: '',
    duration: 0,
    outcome: 'neutral',
    nextAction: '',
    nextActionDate: ''
  });

  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (isOpen && !customerId) {
       const loadCustomers = async () => {
          const user = JSON.parse(sessionStorage.getItem('user'));
          const res = await axios.get('/api/crm/customers', { headers: { Authorization: `Bearer ${user.token}` } });
          setCustomers(res.data.customers);
       };
       loadCustomers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.post('/api/crm/communications', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Engagement Protocol Successfully Authenticated');
      if (onLogSuccess) onLogSuccess();
      onClose();
    } catch (err) {
      toast.error('Engagement Audit Failure');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[200] flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl p-16 space-y-12 animate-in zoom-in-95 duration-500 relative flex flex-col max-h-[90vh] overflow-y-auto scroller-hide">
         <button onClick={onClose} className="absolute top-12 right-12 p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all"><XSquare size={24} /></button>
         
         <div className="flex items-center gap-6">
            <div className="p-6 bg-primary-600 text-white rounded-[2.5rem] shadow-2xl"><MessageSquare size={32} /></div>
            <div>
               <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Log Strategic Interaction</h3>
               <p className="text-slate-400 font-medium tracking-tight mt-2">Authenticating multi-channel stakeholder engagement records.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                     <Users size={12} className="text-primary-500" /> Stakeholder Node
                  </label>
                  <select 
                     className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-black uppercase italic tracking-widest outline-none appearance-none cursor-pointer shadow-inner"
                     value={formData.customerId}
                     onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                     disabled={!!customerId}
                     required
                  >
                     <option value="">Select Stakeholder</option>
                     {customerId ? <option value={customerId}>Current Context Node</option> : customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.company})</option>)}
                  </select>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                     <Layout size={12} className="text-primary-500" /> Interaction Channel
                  </label>
                  <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                     {['call', 'email', 'meeting', 'whatsapp'].map(type => (
                        <button 
                           key={type}
                           type="button"
                           onClick={() => setFormData({...formData, type})}
                           className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                              formData.type === type ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-slate-50 bg-slate-50 text-slate-400'
                           }`}
                        >
                           {type === 'call' && <Phone size={16} />}
                           {type === 'email' && <Mail size={16} />}
                           {type === 'meeting' && <Users size={16} />}
                           {type === 'whatsapp' && <Send size={16} />}
                           <span className="text-[10px] font-black uppercase italic">{type}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                  <Plus size={12} className="text-primary-500" /> Subject Protocol
               </label>
               <input 
                  className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-black uppercase italic tracking-widest outline-none shadow-inner"
                  placeholder="e.g. FY24 Strategy Resolution Hub"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                  <MessageSquare size={12} className="text-primary-500" /> Engagement Disposition
               </label>
               <textarea 
                  className="w-full p-8 bg-slate-50 border-none rounded-[3rem] text-sm font-bold text-slate-900 outline-none shadow-inner min-h-[150px]"
                  placeholder="Detailed summary of stakeholder alignment outcomes..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
               ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Direction</label>
                  <select className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-inner" value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})}>
                     <option value="outgoing">Outgoing</option>
                     <option value="incoming">Incoming</option>
                  </select>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Temporal Duration (min)</label>
                  <div className="relative">
                     <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input type="number" className="w-full p-5 pl-12 bg-slate-50 border-none rounded-2xl text-xs font-black outline-none shadow-inner" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Alignment Outcome</label>
                  <select className="w-full p-5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-inner" value={formData.outcome} onChange={e => setFormData({...formData, outcome: e.target.value})}>
                     <option value="positive">Positive Alignment</option>
                     <option value="neutral">Neutral Disposition</option>
                     <option value="negative">Variance Detected</option>
                  </select>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Action Anchorage</label>
                  <div className="relative">
                     <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input type="date" className="w-full p-5 pl-12 bg-slate-50 border-none rounded-2xl text-[10px] font-black outline-none shadow-inner" value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="pt-10 flex justify-between items-center border-t border-slate-50">
               <div className="flex items-center gap-4 text-slate-400 hover:text-primary-600 transition-all cursor-pointer">
                  <Paperclip size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Attach Artifacts</span>
               </div>
               <button 
                  type="submit"
                  className="px-16 py-6 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-3xl hover:bg-primary-600 transition-all flex items-center gap-3 shadow-2xl active:scale-95"
               >
                  Authorize Engagement Log <Check size={20} />
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};

export default LogCommunicationModal;
