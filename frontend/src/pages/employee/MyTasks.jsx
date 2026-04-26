import { useState, useEffect } from 'react';
import { 
  Plus, ClipboardList, CheckCircle2, Clock, X, Trash2, 
  Loader2, RefreshCw, ChevronDown, Calendar as CalendarIcon, 
  AlertCircle, Zap, ChevronLeft, ChevronRight, FileText, Users, Target
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const { user } = useSelector((state) => state.auth);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [personalTasks, setPersonalTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTask, setActiveTask] = useState(null); // Full task object
  const [isAssignedMode, setIsAssignedMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    duration: 0,
    priority: 'Normal',
    status: 'Pending',
    progressNotes: ''
  });

  const [activeDates, setActiveDates] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personalRes, assignedRes, datesRes] = await Promise.all([
        api.get(`/api/tasks?date=${date}`),
        api.get('/api/tasks/assignments'),
        api.get('/api/tasks/dates')
      ]);
      setPersonalTasks(personalRes.data);
      setAssignedTasks(assignedRes.data);
      setActiveDates(datesRes.data || []);
    } catch (error) {
      toast.error('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAssignedMode) {
        // Update manager-assigned task
        await api.put(`/api/tasks/assignments/${activeTask._id}`, {
          status: taskForm.status,
          progressNotes: taskForm.progressNotes
        });
        toast.success('Mission Update Logged');
      } else if (editMode) {
        // Update personal task
        await api.put(`/api/tasks/${activeTask._id}`, taskForm);
        toast.success('Task updated');
      } else {
        // Create personal task
        await api.post('/api/tasks', { ...taskForm, date });
        toast.success('Task added');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const openEditModal = (task, assigned = false) => {
    setActiveTask(task);
    setIsAssignedMode(assigned);
    
    if (assigned) {
      const myEntry = task.assignedTo.find(a => a.user?._id === user._id || a.user === user._id);
      setTaskForm({
        title: task.title,
        status: myEntry?.status || 'Pending',
        progressNotes: myEntry?.progressNotes || '',
        priority: task.priority,
        duration: 0
      });
    } else {
      setTaskForm({
        title: task.title,
        duration: task.duration,
        priority: task.priority,
        status: task.status,
        progressNotes: ''
      });
      setEditMode(true);
    }
    setShowModal(true);
  };

  const allTasks = [
    ...personalTasks.map(t => ({ ...t, isPersonal: true })),
    ...assignedTasks.map(t => {
      const myEntry = t.assignedTo.find(a => a.user?._id === user._id || a.user === user._id);
      return { ...t, isPersonal: false, status: myEntry?.status || 'Pending' };
    })
  ].filter(t => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pt-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Personal Portal</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Operational Workspace & Task Matrix</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-white rounded-2xl p-1 shadow-xl shadow-slate-200/50 border border-slate-100">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-800 outline-none bg-transparent cursor-pointer" />
           </div>
           <button onClick={() => { setShowModal(true); setEditMode(false); setIsAssignedMode(false); }} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/30 hover:bg-rose-600 hover:-translate-y-1 transition-all">
              Initialize Local Task
           </button>
        </div>
      </div>

      {/* --- STATS & FILTERS --- */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-10">
         <div className="flex items-center bg-white p-2 rounded-[1.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-x-auto scroller-hide w-full xl:w-auto">
            {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>
                 {f}
              </button>
            ))}
         </div>
      </div>

      {/* --- OBJECTIVE GRID --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2rem] animate-pulse border-2 border-slate-100"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTasks.map((t) => (
            <div key={t._id} className={`bg-white rounded-[2rem] p-6 border-2 transition-all duration-500 group relative flex flex-col ${t.isPersonal ? 'border-slate-50 shadow-xl' : 'border-rose-100 shadow-2xl shadow-rose-500/5'}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                     <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${t.status === 'Completed' ? 'bg-emerald-500 text-white' : t.status === 'In Progress' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {t.status}
                     </span>
                     <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${t.isPersonal ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-rose-50 text-rose-600 border-rose-200 italic'}`}>
                        {t.isPersonal ? 'Personal' : 'MISSION DIRECTIVE'}
                     </span>
                  </div>
                  {!t.isPersonal && <Target size={16} className="text-rose-600 animate-pulse" />}
               </div>

               <h4 className="text-base font-black text-slate-900 italic uppercase mb-2 tracking-tighter leading-tight line-clamp-2">
                  {t.title}
               </h4>
               
               <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-6 line-clamp-3">
                  {t.description || 'No briefing details provided.'}
               </p>

               {t.attachment && (
                 <a href={t.attachment} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all mb-6 shadow-lg">
                    <FileText size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Download Technical Brief</span>
                 </a>
               )}

               <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-lg ${t.isPersonal ? 'bg-slate-900' : 'bg-rose-600'}`}>
                        {t.isPersonal ? 'P' : 'M'}
                     </div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {t.isPersonal ? 'Self Assigned' : `Manager Deployment`}
                     </p>
                  </div>
                  <button onClick={() => openEditModal(t, !t.isPersonal)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all ${t.isPersonal ? 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-xl shadow-rose-500/10'}`}>
                     Refine Status
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TASK UPDATE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
             <div className="px-8 py-5 bg-slate-900 flex justify-between items-center">
                <div>
                   <h2 className="text-base font-black text-white italic uppercase tracking-tighter leading-none">{isAssignedMode ? 'Mission Update Log' : 'Refine Objective'}</h2>
                   <p className="text-slate-400 text-[7px] font-bold uppercase tracking-widest mt-1">Personnel Feed & Feedback Vector</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                   <X size={16} />
                </button>
             </div>

             <form onSubmit={handleTaskSubmit} className="p-8 space-y-6">
                {!isAssignedMode && (
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Objective Title</label>
                      <input required type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 focus:border-slate-900 outline-none" />
                   </div>
                )}
                
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Operational Status</label>
                   <select required value={taskForm.status} onChange={(e) => setTaskForm({...taskForm, status: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-900 focus:border-slate-900 outline-none appearance-none">
                      <option value="Pending">Pending (Standby)</option>
                      <option value="In Progress">Active (Processing)</option>
                      <option value="Completed">Finalized (Deployed)</option>
                   </select>
                </div>

                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Situational Feedback / Notes</label>
                   <textarea rows="4" placeholder="Brief the command center on your progress or roadblocks..." value={taskForm.progressNotes} onChange={(e) => setTaskForm({...taskForm, progressNotes: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 focus:border-slate-900 transition-all outline-none resize-none"></textarea>
                </div>

                <button type="submit" className="w-full py-5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/20 hover:bg-rose-700 hover:-translate-y-1 transition-all italic">
                   {isAssignedMode ? 'Transmit Update' : 'Authorize Changes'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
