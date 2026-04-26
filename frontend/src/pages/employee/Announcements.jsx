import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AlertCircle, Terminal, Info, Code2, Zap, Rocket, Plus, Trash2, Activity } from 'lucide-react';

import socketService from '../../utils/socketService';

const Announcements = () => {
  const { user } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', desc: '', type: 'Info', priority: 'Normal', targetRole: 'All'
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/api/announcements');
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to load broadcasts');
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const socket = socketService.getSocket();
    if (socket) {
      // In a real app we'd join a room based on role, but server emits globally or specific.
      // We rely on the server to only emit to rooms we are in, or we just listen locally.
      socket.on('announcement', (newAnnounce) => {
        setItems((prev) => [newAnnounce, ...prev]);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto p-6 border border-rose-500/30 backdrop-blur-xl`}>
            <div className="flex items-center gap-3 mb-2">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
               </span>
               <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Incoming Broadcast</p>
            </div>
            <p className="font-black text-white text-sm italic uppercase mt-1">{newAnnounce.title}</p>
          </div>
        ));
      });
    }

    return () => {
      if (socket) socket.off('announcement');
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/announcements', formData);
      setIsModalOpen(false);
      setFormData({ title: '', desc: '', type: 'Info', priority: 'Normal', targetRole: 'All' });
      // We don't need to manually fetch, socket will trigger, but fetch just in case.
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to dispatch broadcast');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this broadcast globally?")) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      setItems(items.filter(i => i._id !== id));
      toast.success('Broadcast expunged');
    } catch (err) {
      toast.error('Failed to expunge');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Critical': return Zap;
      case 'Warning': return AlertCircle;
      case 'System Update': return Rocket;
      default: return Info;
    }
  };

  const getColorStyles = (priority) => {
    switch (priority) {
      case 'Critical': return { box: 'border-rose-500/20 bg-rose-500/5 shadow-rose-500/10', iconBox: 'bg-rose-500/20 text-rose-400 border border-rose-500/30', badge: 'bg-rose-500 text-white' };
      case 'High': return { box: 'border-amber-500/20 bg-amber-500/5 shadow-amber-500/10', iconBox: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', badge: 'bg-amber-500 text-slate-900' };
      default: return { box: 'border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/10', iconBox: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30', badge: 'bg-indigo-500 text-white' };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-fade-in relative">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-10 md:p-14 shadow-2xl border border-rose-500/10 group">
         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] animate-pulse"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="px-5 py-2 bg-white/10 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" /> LIVE STREAM ACTIVE
                  </div>
               </div>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase italic">Global <span className="text-rose-500">Broadcasts</span></h2>
               <p className="text-slate-400 font-bold max-w-xl text-xs leading-relaxed opacity-80">Real-time transmissions directly from the Network Command Center regarding system upgrades, operational status, and matrix updates.</p>
            </div>
            
            <div className="flex flex-col items-end gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                 <Terminal size={24} />
              </div>
              {(user?.role === 'Admin' || user?.role === 'HR') && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Plus size={18} /> NEW SIGNAL
                </button>
              )}
            </div>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-12 bg-slate-950/30 backdrop-blur-md animate-fade-in font-sans">
           <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] w-full max-w-2xl overflow-hidden transform animate-enter relative flex flex-col max-h-[70vh] border border-white/50 m-12">
              
              <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50">
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tighter italic uppercase">Dispatch Signal</h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-slate-300 hover:text-rose-500 transition-all rounded-full hover:bg-rose-50 p-2"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1">Transmission Title</label>
                    <input 
                       required 
                       value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})} 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm placeholder:text-slate-300" 
                       placeholder="Enter signal headline..." 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Signal Narrative</label>
                    <textarea 
                       required 
                       value={formData.desc} 
                       onChange={e => setFormData({...formData, desc: e.target.value})} 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all h-32 resize-none shadow-sm" 
                       placeholder="Detailed parameters of the event..."
                    ></textarea>
                 </div>

                 <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1">Variant Type</label>
                       <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm">
                          <option>Info</option>
                          <option>Warning</option>
                          <option>Action Required</option>
                          <option>System Update</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1">Urgency Priority</label>
                       <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm">
                          <option>Normal</option>
                          <option>High</option>
                          <option>Critical</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1">Broadcast Vector</label>
                    <select 
                      value={formData.targetRole} 
                      onChange={e => setFormData({...formData, targetRole: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                    >
                       <option value="All">All Stakeholders</option>
                       <option value="HR">HR Department</option>
                       <option value="Manager">Management Consol</option>
                       <option value="Sales Team">Sales Unit</option>
                       <option value="Employee">Employee Force</option>
                    </select>
                 </div>

                 <div className="pt-4 pb-2">
                    <button type="submit" className="w-full bg-[#0F172A] hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-[0_15px_40px_-5px_rgba(15,23,42,0.4)] hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
                       <Rocket size={18} /> Dispatch System Signal
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {items.map((item) => {
          const Icon = getIcon(item.type);
          const colorStyles = getColorStyles(item.priority);

          return (
            <div key={item._id} className={`p-8 rounded-[2rem] border shadow-xl transition-all hover:translate-x-2 duration-500 group relative overflow-hidden flex flex-col md:flex-row gap-8 ${
               item.priority === 'Critical' ? 'bg-rose-50/30 border-rose-100 hover:border-rose-300' : 
               item.priority === 'High' ? 'bg-amber-50/30 border-amber-100 hover:border-amber-200' :
               'bg-white border-slate-100 hover:border-rose-200 shadow-slate-200/50'
            }`}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
               
               <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative z-10 group-hover:rotate-6 transition-all duration-500 ${
                  item.priority === 'Critical' ? 'bg-rose-500 text-white' : 
                  item.priority === 'High' ? 'bg-amber-500 text-white' :
                  'bg-slate-900 text-white'
               }`}>
                  <Icon size={24} />
               </div>
               
               <div className="flex-1 z-10">
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                     <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none italic uppercase">{item.title}</h4>
                     <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.25em] shadow-sm ${
                        item.priority === 'Critical' ? 'bg-rose-600 text-white' : 
                        item.priority === 'High' ? 'bg-amber-600 text-white' :
                        'bg-slate-900 text-white'
                     }`}>
                        {item.type}
                     </span>
                     {user?.role === 'Admin' && (
                       <button onClick={() => handleDelete(item._id)} className="ml-auto p-2.5 bg-white text-slate-300 hover:text-rose-500 border border-slate-100 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-105">
                         <Trash2 size={16} />
                       </button>
                     )}
                  </div>
                  
                  <p className="text-[13px] font-bold text-slate-500 leading-relaxed max-w-4xl whitespace-pre-wrap border-l-2 border-rose-500/20 pl-5 mb-6 group-hover:border-rose-500/50 transition-colors">
                     {item.desc}
                  </p>

                  <div className="flex flex-wrap items-center gap-5 pt-5 border-t border-slate-100/50">
                     <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-rose-500 flex items-center justify-center shadow-md">
                           <Code2 size={12} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">{item.author?.name || 'NETWORK OPERATOR'}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${item.author?.role === 'Admin' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'}`}>
                           {item.author?.role || 'Authority'}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Vector:</span>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-200">{item.targetRole}</span>
                     </div>
                     <span className="text-xs font-black uppercase tracking-tighter text-slate-600 ml-auto tabular-nums italic">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
               </div>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="py-24 text-center bg-white border-2 border-slate-100 border-dashed rounded-[3rem]">
            <div className="w-24 h-24 rounded-[2.2rem] bg-rose-50 border-2 border-rose-100 flex items-center justify-center text-rose-200 mx-auto mb-8">
               <Info size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 italic uppercase">Spectral Silence</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-3">No active transmissions in memory</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;

