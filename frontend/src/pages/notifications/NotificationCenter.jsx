import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ShieldAlert, 
  Package, 
  Users, 
  Briefcase, 
  Target, 
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { fetchNotifications, markAsRead, fetchUnreadCount, markAllAsRead } from '../../redux/slices/notificationSlice';
import { Link } from 'react-router-dom';

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { notifications, loading, pagination } = useSelector((state) => state.notifications);
  const [filters, setFilters] = useState({ page: 1, module: '', type: '', priority: '' });

  useEffect(() => {
    dispatch(fetchNotifications(filters));
    dispatch(fetchUnreadCount());
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getModuleIcon = (type) => {
    switch(type) {
      case 'leave': return <Clock size={20} className="text-emerald-500" />;
      case 'payroll': return <CheckCircle2 size={20} className="text-blue-500" />;
      case 'task': return <FileText size={20} className="text-purple-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'danger': return <AlertCircle size={20} className="text-rose-500" />;
      default: return <Bell size={20} className="text-slate-400" />;
    }
  };

  const getTypeStyles = (type, priority) => {
    if (priority === 'high') return 'bg-rose-50 text-rose-600 border-rose-200 shadow-rose-100 shadow-lg animate-pulse';
    
    switch(type) {
      case 'danger': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'error': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'leave': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'payroll': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'task': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-6 lg:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-slate-900 border-b border-slate-100 pb-12">
        <div className="space-y-4 w-full md:w-auto">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none">Intelligence Protocol Hub</h2>
          <p className="text-slate-600 font-black text-[10px] lg:text-xs uppercase tracking-widest pl-4 border-l-4 border-primary-600">Enterprise notification registry with real-time categorical alerting.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button 
             onClick={() => dispatch(markAllAsRead())}
             className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
           >
             Mark All Protocol Read
           </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-200/50">
        <Filter size={16} className="text-slate-400 mr-2" />
        <select 
          onChange={(e) => handleFilterChange('module', e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
        >
          <option value="">All Modules</option>
          <option value="hrms">Workforce (HRMS)</option>
          <option value="material">Material Hub</option>
          <option value="erp">ERP Console</option>
          <option value="crm">CRM Vertical</option>
          <option value="auth">Security (Auth)</option>
        </select>

        <select 
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
        >
          <option value="">All Priorities</option>
          <option value="high">Critical Only</option>
          <option value="medium">Standard</option>
          <option value="low">Low Impact</option>
        </select>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          {['all', 'info', 'success', 'warning', 'error'].map(t => (
            <button 
              key={t}
              onClick={() => handleFilterChange('type', t === 'all' ? '' : t)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                (filters.type === t || (t === 'all' && !filters.type)) ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notif, idx) => (
          <div key={idx} className={`bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:shadow-xl relative overflow-hidden ${
             notif.isRead ? 'border-slate-100 opacity-60' : 'border-slate-200 shadow-md shadow-slate-100'
          } ${notif.priority === 'high' ? 'ring-2 ring-rose-500 ring-opacity-20' : ''}`}>
            {!notif.isRead && <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notif.priority === 'high' ? 'bg-rose-500' : 'bg-primary-600'}`}></div>}
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
               <div className={`p-4 rounded-2xl ${getTypeStyles(notif.type, notif.priority)} group-hover:scale-110 transition-all shadow-sm shrink-0`}>
                  {getModuleIcon(notif.type)}
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-4">
                     <p className="text-lg font-black text-slate-900 uppercase italic leading-none tracking-tight">
                       {notif.title}
                       {notif.metadata?.count > 1 && (
                         <span className="ml-3 px-2 py-0.5 bg-slate-900 text-white text-[9px] rounded-md font-black not-italic tracking-normal">x{notif.metadata.count}</span>
                       )}
                     </p>
                     <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getTypeStyles(notif.type)} shadow-sm border`}>{notif.type}</span>
                     <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getPriorityColor(notif.priority)}`}>{notif.priority} Priority</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed max-w-2xl">{notif.message}</p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest italic bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <Clock size={12} className="text-slate-400" /> {new Date(notif.createdAt).toLocaleString()}
                     </div>
                     {notif.createdBy && (
                       <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest italic bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          <Users size={12} className="text-indigo-400" /> Dispatcher: {notif.createdBy.name}
                       </div>
                     )}
                     <div className="flex items-center gap-2 text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] italic bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                        <Bell size={12} className="text-primary-400" /> {notif.module} system
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                {notif.link && (
                  <Link to={notif.link} className="p-3 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all shadow-sm">
                    <ExternalLink size={16} />
                  </Link>
                )}
                {!notif.isRead && (
                  <button 
                    onClick={() => dispatch(markAsRead(notif._id))}
                    className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                  <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))
 : (
          <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
             <Bell size={80} strokeWidth={1} />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Intelligence registry awaiting system dispatch.</p>
          </div>
        )}
      </div>

      {/* Sector Scanning Controls (Pagination) */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-12">
          <button 
            disabled={filters.page === 1}
            onClick={() => handleFilterChange('page', filters.page - 1)}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <div className="flex gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => handleFilterChange('page', i + 1)}
                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                  filters.page === i + 1 ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={filters.page === pagination.totalPages}
            onClick={() => handleFilterChange('page', filters.page + 1)}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary-600 disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
