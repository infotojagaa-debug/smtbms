import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Clock, ArrowRight, Package, Users, Briefcase, Target, Trash2, CheckCircle2, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { markAsRead, clearNotifications, fetchUnreadCount, fetchNotifications } from '../redux/slices/notificationSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getModuleIcon = (type) => {
    switch(type) {
      case 'leave': return <Clock size={14} className="text-emerald-500" />;
      case 'payroll': return <CheckCircle2 size={14} className="text-blue-500" />;
      case 'task': return <FileText size={14} className="text-purple-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'danger': return <AlertCircle size={14} className="text-rose-500" />;
      default: return <Bell size={14} className="text-slate-400" />;
    }
  };

  const handleNotifClick = (n) => {
    if (!n.isRead) dispatch(markAsRead(n._id));
    if (n.link) navigate(n.link);
    setIsOpen(false);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (window.confirm('Wipe all intelligence entries?')) {
      dispatch(clearNotifications());
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm group active:scale-95"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-6 w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
             <div className="px-8 py-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                <h4 
                  onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 italic cursor-pointer hover:text-rose-600 transition-colors"
                >
                  Intelligence Stream
                </h4>
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-800 transition-all"
                >
                  <Trash2 size={12} /> Clear Protocol
                </button>
             </div>
             
             <div className="max-h-[480px] overflow-y-auto scroller-hide">
                {notifications.slice(0, 10).map((n, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleNotifClick(n)}
                    className={`px-8 py-6 border-b border-slate-50 hover:bg-slate-50/80 transition-all cursor-pointer flex gap-5 group items-start relative ${!n.isRead ? 'bg-primary-50/10' : ''}`}
                  >
                     <div className={`p-3 rounded-xl bg-white border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm`}>
                        {getModuleIcon(n.type)}
                     </div>
                     <div className="flex-1 space-y-1.5">
                        <p className="text-[13px] font-black text-slate-900 uppercase italic leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{n.title}</p>
                        <p className="text-[11px] font-bold text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-3 pt-1">
                           <Clock size={11} className="text-slate-400" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                     </div>
                     {!n.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 shadow-sm shadow-primary-500/50"></div>}
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                     <Bell size={40} />
                     <p className="text-[8px] font-black uppercase tracking-widest">No Intelligence Entries</p>
                  </div>
                )}
             </div>

             <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="block w-full py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white transition-all border-t border-slate-100"
             >
                Enter Protocol Center <ArrowRight size={14} className="inline-block ml-2" />
             </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
