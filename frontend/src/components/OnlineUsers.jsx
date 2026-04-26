import { useSelector } from 'react-redux';
import { Users, ShieldCheck, User as UserIcon, Activity } from 'lucide-react';

const OnlineUsers = () => {
  const { onlineUsers, onlineCount } = useSelector((state) => state.socket);

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-10 flex flex-col h-full">
      <div className="flex justify-between items-center px-4">
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900 border-l-4 border-emerald-500 pl-4">
           <Activity size={18} className="text-emerald-500" /> Presence Matrix
        </h4>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{onlineCount} Active</span>
        </div>
      </div>

      <div className="overflow-y-auto scroller-hide space-y-6">
        {onlineUsers.length > 0 ? onlineUsers.map((user, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[2.5rem] border border-slate-50 hover:bg-white hover:shadow-xl transition-all group cursor-pointer">
             <div className="flex items-center gap-5">
                <div className="relative">
                   <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-600 font-black text-xs italic group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      {user.name[0]}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-in zoom-in"></div>
                </div>
                <div>
                   <p className="text-[11px] font-black text-slate-900 uppercase italic leading-none">{user.name}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{user.role}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest italic">{user.department || 'GLOBAL'}</span>
                   </div>
                </div>
             </div>
             <ShieldCheck size={16} className="text-slate-100 group-hover:text-primary-600 transition-all mr-2" />
          </div>
        )) : (
          <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
             <Users size={40} />
             <p className="text-[8px] font-black uppercase tracking-widest">Awaiting Stakeholder Ingress</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-slate-50 space-y-4">
         <p className="text-[8px] font-black text-slate-300 uppercase italic px-4 leading-relaxed">
            Authorized stakeholders currently engaged in real-time operational auditing across organizational nodes.
         </p>
      </div>
    </div>
  );
};

export default OnlineUsers;
