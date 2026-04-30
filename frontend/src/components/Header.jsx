import { useSelector, useDispatch } from 'react-redux';
import { 
  Settings, 
  Terminal,
  Clock as ClockIcon,
  Wifi,
  LogOut,
  UserCircle,
  Menu
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import NotificationBell from './NotificationBell';

const Header = ({ toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const { onlineCount } = useSelector((state) => state.socket);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleAccentColor = {
    Admin: 'text-indigo-400',
    HR: 'text-emerald-500',
    Sales: 'text-amber-500',
    Employee: 'text-violet-500',
    Customer: 'text-primary-500',
  }[user?.role] || 'text-blue-500';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-20 flex items-center justify-between px-4 lg:px-10 shrink-0 relative z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-4 lg:gap-8">
         <button 
           onClick={toggleSidebar} 
           className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
         >
           <Menu size={24} />
         </button>
         <div className="flex flex-col">
            <h3 className="text-sm lg:text-base font-bold text-slate-900 leading-none">
              {user?.role === 'Admin' ? 'Command Center' :
               user?.role === 'HR' ? 'People Hub' :
               user?.role === 'Sales' ? 'Revenue Cockpit' : 
               user?.role === 'Customer' ? 'Client Portal' : 'My Workspace'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
               <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                 {user?.role} • Access Authorized
               </p>
            </div>
         </div>
         
         <div className="h-8 w-px hidden lg:block bg-slate-200" />
         
         <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Wifi size={14} className="text-emerald-500" />
               <span className="text-[11px] font-semibold text-slate-600">
                 {onlineCount} Online
               </span>
            </div>
            <div className="flex items-center gap-2">
               <ClockIcon size={14} className={roleAccentColor} />
               <span className="text-[11px] font-semibold text-slate-600">
                 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
         <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
               <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
               <p className={`text-[11px] font-semibold mt-1 ${roleAccentColor}`}>{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-slate-900 text-white shadow-sm transform hover:scale-105 transition-transform">
               {user?.name?.[0].toUpperCase()}
            </div>
         </div>

         <div className="h-8 w-px bg-slate-200" />

         <div className="p-1 rounded-full flex gap-1 bg-slate-50 border border-slate-200 relative">
            <NotificationBell />
            <button className="hidden sm:block p-2.5 transition-all text-slate-500 hover:text-slate-900 hover:bg-white rounded-full">
               <Terminal size={18} />
            </button>
            <div ref={settingsRef} className="relative">
               <button 
                 onClick={() => setShowSettings(!showSettings)}
                 className={`p-2.5 transition-all rounded-full ${showSettings ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
               >
                  <Settings size={18} className={showSettings ? "animate-spin-slow" : ""} />
               </button>
               
               {/* Settings Dropdown View */}
               {showSettings && (
                 <div className="absolute right-0 mt-3 w-56 rounded-2xl shadow-xl p-2 bg-white border border-slate-200 text-slate-900 z-50">
                   <div className="px-4 py-3 mb-2 border-b border-slate-100">
                      <p className="text-sm font-bold truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{user?.email}</p>
                   </div>
                   
                   <div className="space-y-1">
                      <button
                        onClick={() => { setShowSettings(false); navigate('/my-profile'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors hover:bg-slate-50"
                      >
                        <UserCircle size={16} className="text-slate-500" /> My Profile
                      </button>
                      <button
                        onClick={() => { setShowSettings(false); /* Settings */ }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors hover:bg-slate-50"
                      >
                        <Settings size={16} className="text-slate-500" /> Preferences
                      </button>
                     
                     <div className="h-px bg-slate-100/10 my-1 mx-2" />
                     
                     <button
                       onClick={handleLogout}
                       className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left text-rose-600 hover:bg-rose-50 transition-colors"
                     >
                       <LogOut size={16} /> Sign Out
                     </button>
                  </div>
                </div>
              )}
            </div>
         </div>
      </div>
    </header>
  );
};

export default Header;
