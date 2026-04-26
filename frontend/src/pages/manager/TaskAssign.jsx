import { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Calendar, Clock, 
  MoreVertical, Edit2, Trash2, CheckCircle2, 
  AlertCircle, ChevronRight, X, UserPlus, Briefcase, FileText, Upload, ChevronDown
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TaskAssign = () => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    category: 'General',
    attachment: null
  });

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/api/tasks/assignments'),
        api.get('/api/users')
      ]);
      setTasks(tasksRes.data);
      setEmployees(usersRes.data.filter(u => u.role !== 'Admin'));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load mission data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('priority', formData.priority);
      data.append('assignedTo', formData.assignedTo);
      data.append('dueDate', formData.dueDate);
      data.append('category', formData.category);
      if (formData.attachment instanceof File) {
        data.append('attachment', formData.attachment);
      }

      if (editMode) {
        await api.put(`/api/tasks/assignments/${editingId}`, data);
        toast.success('Objective Refined');
      } else {
        await api.post('/api/tasks/assignments', data);
        toast.success('Objective Deployed');
      }
      
      setShowModal(false);
      setEditMode(false);
      setEditingId(null);
      setFormData({ 
        title: '', description: '', priority: 'Medium', 
        assignedTo: '', dueDate: '', category: 'General', attachment: null 
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation Failed');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Purge this mission from the matrix?')) {
      try {
        await api.delete(`/api/tasks/assignments/${id}`);
        toast.success('Mission Purged');
        loadData();
      } catch (error) {
        toast.error('Purge Failed');
      }
    }
  };

  const handleEditClick = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignedTo: task.isBroadcast ? 'all' : (task.assignedTo[0]?.user?._id || ''),
      dueDate: task.dueDate || '',
      category: task.category || 'General',
      attachment: task.attachment
    });
    setEditingId(task._id);
    setEditMode(true);
    setShowModal(true);
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'High': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'Completed': return 'bg-emerald-500 text-white';
      case 'In Progress': return 'bg-sky-500 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'High Priority') return matchesSearch && t.priority === 'High';
    if (activeTab === 'Completed') return matchesSearch && t.assignedTo.every(a => a.status === 'Completed');
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Mission Control</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Unified Workforce Deployment</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setEditMode(false); }}
          className="group flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-600/30 hover:bg-rose-700 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          Initialize Mission
        </button>
      </div>

      {/* --- FILTERS --- */}
      <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 overflow-x-auto scroller-hide w-full xl:w-auto">
          {['All Tasks', 'High Priority', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search objectives or personnel..."
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-slate-900 focus:bg-white transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- TASK GRID --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map((task) => {
            const completedCount = task.assignedTo.filter(a => a.status === 'Completed').length;
            const totalCount = task.assignedTo.length;
            
            return (
              <div key={task._id} className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-50 shadow-2xl shadow-slate-200/40 hover:shadow-rose-500/5 transition-all duration-500 group relative flex flex-col">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                       <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                       </span>
                       {task.isBroadcast && (
                         <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm italic">
                            BROADCAST
                         </span>
                       )}
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => handleEditClick(task)} className="p-2 text-slate-300 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all">
                          <Edit2 size={14} />
                       </button>
                       <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>

                 <h3 className="text-xl font-black text-slate-900 italic uppercase mb-3 tracking-tighter leading-tight group-hover:text-rose-600 transition-colors line-clamp-2">
                    {task.title}
                 </h3>
                 
                 <p className="text-slate-500 text-[11px] font-bold leading-relaxed mb-6 line-clamp-3">
                    {task.description || 'No operational briefing provided.'}
                 </p>

                 {task.attachment && (
                   <a href={task.attachment} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all mb-6 group/file shadow-lg">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover/file:bg-white/30 transition-colors">
                         <FileText size={18} />
                      </div>
                      <div className="min-w-0 pr-4">
                         <p className="text-[8px] font-black opacity-60 uppercase tracking-widest leading-none mb-1.5 italic">Operational Brief</p>
                         <p className="text-[11px] font-black truncate uppercase tracking-tighter">Download Technical Specs</p>
                      </div>
                   </a>
                 )}

                 {/* PERSONNEL TEAM SECTION */}
                 <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex -space-x-3">
                          {task.assignedTo.slice(0, 3).map((a, i) => (
                            <div key={i} className="w-10 h-10 rounded-xl border-4 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg" title={a.user?.name}>
                               {a.user?.name?.charAt(0) || '?'}
                            </div>
                          ))}
                          {task.assignedTo.length > 3 && (
                            <div className="w-10 h-10 rounded-xl border-4 border-white bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                               +{task.assignedTo.length - 3}
                            </div>
                          )}
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Personnel</p>
                          <p className="text-[10px] font-black text-slate-900 italic">
                             {task.isBroadcast ? 'ALL ACTIVE UNITS' : (
                               task.assignedTo[0]?.user ? `${task.assignedTo[0].user.name} (${task.assignedTo[0].user.role || task.assignedTo[0].user.department})` : 'UNASSIGNED'
                             )}
                          </p>
                       </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Users size={12} className="text-slate-400" />
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                             {completedCount}/{totalCount} Units Finalized
                          </span>
                       </div>
                       <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="px-8 py-5 bg-slate-900 flex justify-between items-center">
                <div>
                   <h2 className="text-base font-black text-white italic uppercase tracking-tighter leading-none">{editMode ? 'Refine Objective' : 'Initialize Objective'}</h2>
                   <p className="text-slate-400 text-[7px] font-bold uppercase tracking-widest mt-1">Deployment Configuration</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                   <X size={16} />
                </button>
             </div>

             <form onSubmit={handleAssignTask} className="p-8 space-y-5">
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Task Objective</label>
                   <input required type="text" placeholder="Title..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase text-slate-900 focus:border-slate-900 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Mission Brief</label>
                   <textarea rows="3" placeholder="Details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 focus:border-slate-900 transition-all outline-none resize-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Personnel</label>
                      <select required value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-900 focus:border-slate-900 outline-none appearance-none">
                         <option value="">Select Staff</option>
                         <option value="all">ALL STAFF (BROADCAST)</option>
                         {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name} ({emp.role || emp.department})
                            </option>
                          ))}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Deadline</label>
                      <input required type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 outline-none" />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Technical Specs (PDF/DOC)</label>
                   <input type="file" onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})} className="w-full text-[10px] font-bold text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white hover:file:bg-rose-600 cursor-pointer" />
                </div>
                <button type="submit" className="w-full py-5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/20 hover:bg-rose-700 hover:-translate-y-1 transition-all italic">
                   {editMode ? 'Authorize Changes' : 'Authorize Mission Deployment'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAssign;
