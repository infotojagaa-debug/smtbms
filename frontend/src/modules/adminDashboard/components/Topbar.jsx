import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ExternalLink, Filter, Settings, TerminalSquare, Menu } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from '../../../components/NotificationBell';

const Topbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 font-sans shadow-sm z-30 w-full relative">
      <div className="flex items-center gap-4 lg:gap-12">
         <button 
           onClick={toggleSidebar} 
           className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
         >
           <Menu size={24} />
         </button>
         <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
               Command Center
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin • Access Authorized</span>
            </div>
         </div>

         <div className="hidden md:flex items-center gap-6 border-l border-slate-100 pl-8">
            <div className="flex items-center gap-2 text-slate-500">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-xs font-semibold">6 Online</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
               <TerminalSquare size={14} />
               <span className="text-xs font-semibold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 lg:gap-3 pr-2 lg:pr-6 cursor-pointer group">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-900">{user?.name || 'Super Admin'}</p>
            <p className="text-[11px] font-medium text-indigo-600">Admin</p>
          </div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-md ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
           <NotificationBell />
           
           <button className="p-2.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-50 border border-slate-100 font-mono text-xs font-bold w-[38px] h-[38px] flex items-center justify-center tracking-tighter">
             {'>_'}
           </button>
           <button className="p-2.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-50 border border-slate-100">
             <Settings size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
