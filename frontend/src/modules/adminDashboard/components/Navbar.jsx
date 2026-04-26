import { Search, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 font-sans">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search items, orders and customers" 
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B3674] focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-[#2B3674] transition-colors rounded-full hover:bg-slate-50">
          <Bell size={20} />
          {/* Active indicator dot */}
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-transparent group-hover:ring-[#2B3674] transition-all">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Admin'}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-[#2B3674]">{user?.name || 'System Admin'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
