import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Info, 
  AlertTriangle, 
  Clock, 
  Filter,
  User,
  Shield,
  Send
} from 'lucide-react';

const AnnouncementsTerminal = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    type: 'Info',
    priority: 'Normal',
    targetRole: 'Employee'
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Broadcasting data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/announcements', formData);
      toast.success('Transmission successfully broadcasted to all nodes');
      setShowModal(false);
      setFormData({ title: '', desc: '', type: 'Info', priority: 'Normal', targetRole: 'Employee' });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transmission initialization failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this broadcast?')) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      toast.success('Broadcast Terminated');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Termination Protocol Refused (Admin Auth Required)');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 leading-none mb-2 flex items-center gap-3">
             Broadcasting Terminal <Megaphone className="text-indigo-600" />
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enterprise Communications Center</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-slate-900 transition-all active:scale-95"
        >
          <Plus size={18} /> Initialize Broadcast
        </button>
      </div>

      {loading ? (
         <div className="p-20 text-center animate-pulse">
            <h4 className="text-lg font-black text-slate-300 uppercase italic tracking-[0.5em]">Scanning Broadcasting Frequencies...</h4>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {announcements.map((ann) => (
               <div key={ann._id} className="p-8 rounded-[2.5rem] bg-white border border-slate-200 relative group overflow-hidden hover:border-indigo-200 hover:shadow-2xl transition-all duration-500">
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 rotate-12 transition-transform group-hover:scale-110 ${ann.type === 'Warning' ? 'text-rose-500' : 'text-indigo-500'}`}>
                     <Megaphone size={128} />
                  </div>

                  <div className="flex items-center justify-between mb-8">
                     <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        ann.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        ann.priority === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                     }`}>
                        {ann.priority} Priority
                     </span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tabular-nums">
                        {new Date(ann.createdAt).toLocaleDateString()}
                     </span>
                  </div>

                  <h4 className="text-xl font-black text-slate-900 uppercase italic leading-tight mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
                     {ann.title}
                  </h4>
                  
                  <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8 line-clamp-3">
                     {ann.desc}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black italic">
                           {ann.author?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-900 uppercase leading-none mb-1">{ann.author?.name || 'System'}</p>
                           <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">{ann.author?.role || 'Authority'}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleDelete(ann._id)}
                        className="p-3 text-slate-300 hover:text-rose-600 transition-colors"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
            ))}

            {announcements.length === 0 && (
               <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border border-slate-200 border-dashed opacity-50 font-black uppercase italic tracking-widest text-slate-400">
                  No Active Broadcasts Detected in Current Frequency
               </div>
            )}
         </div>
      )}

      {/* Initialize Modal */}
      {showModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-300">
               <div className="px-10 py-8 bg-slate-900 border-b border-indigo-900 flex justify-between items-center text-white">
                  <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tight">New Broadcast Sequence</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Initialize Enterprise Communications</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-white opacity-50 hover:opacity-100 font-bold text-2xl">&times;</button>
               </div>
               <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast Title</label>
                     <input 
                       required 
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-400 font-black text-slate-900 uppercase italic" 
                       placeholder="e.g. SYSTEM MAINTENANCE LOG" 
                       value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transmission Detail</label>
                     <textarea 
                       required 
                       rows="4"
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-900" 
                       placeholder="Enter full announcement details here..." 
                       value={formData.desc} 
                       onChange={e => setFormData({...formData, desc: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signal Type</label>
                        <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-xs uppercase" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                           <option value="Info">General Info</option>
                           <option value="Warning">Incident Alert</option>
                           <option value="Action Required">Directive Node</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Level</label>
                        <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-xs uppercase" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                           <option value="Normal">Normal Signal</option>
                           <option value="High">High Magnitude</option>
                           <option value="Critical">Critical Breach</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Audience (Operational Nodes)</label>
                     <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-xs uppercase" value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}>
                        <option value="All">All Entities (Global Broadcast)</option>
                        <option value="Employee">Staff Employees (Standard Nodes)</option>
                        <option value="Manager">Department Managers (Supervisory Hubs)</option>
                        <option value="Sales Team">Sales Team (Outreach Unit)</option>
                        <option value="HR">HR Personnel (Workforce Architects)</option>
                     </select>
                  </div>
                  <div className="pt-6 flex justify-end gap-4">
                     <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Cancel Transmission</button>
                     <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3">
                        <Send size={16} /> Execute Broadcast
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default AnnouncementsTerminal;
