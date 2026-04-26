import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  LogOut,
  Bell,
  Menu,
  X,
  UserCircle,
  Megaphone
} from 'lucide-react';

const HRLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/hr/employees', icon: Users },
    { name: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { name: 'Leaves', path: '/hr/leave', icon: FileText },
    { name: 'Announcements', path: '/hr/announcements', icon: Megaphone },
    { name: 'Documents', path: '/hr/documents', icon: FileText },
    { name: 'Payroll', path: '/hr/payroll', icon: Briefcase },
    { name: 'Performance', path: '/hr/performance', icon: TrendingUp },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Desktop Premium Dark */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0f172a] text-white">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Briefcase className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">
              HRM<span className="text-indigo-400">Core</span>
            </h1>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider ${
                    isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 bg-black/20">
           <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm uppercase border border-indigo-500/30">
                 {user?.name?.charAt(0) || 'H'}
              </div>
              <div className="overflow-hidden">
                 <p className="text-xs font-black truncate text-white">{user?.name || 'HR Admin'}</p>
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{user?.role || 'HR Specialist'}</p>
              </div>
           </div>
           <button 
             onClick={() => navigate('/')}
             className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-400/5 hover:bg-rose-400 hover:text-white border border-rose-400/20 rounded-xl transition-all"
           >
             <LogOut size={16} /> Exit Command Hub
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Mission Control Style */}
        <header className="h-24 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 shadow-sm relative z-10">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-3 text-slate-500 hover:bg-slate-100 rounded-2xl border border-slate-200"
              >
                <Menu size={24} />
              </button>
              <div>
                 <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-500 mb-1 leading-none">Command Hub</h2>
                 <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">
                    {navItems.find(i => i.path === location.pathname)?.name || 'Central Console'}
                 </h1>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden xl:flex items-center gap-6 px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Network Status</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                       <span className="text-[10px] font-black text-slate-900 uppercase">Latency: 0.02ms</span>
                    </div>
                 </div>
                 <div className="w-[1px] h-8 bg-slate-200 mx-2"></div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Temporal Zone</span>
                    <span className="text-[10px] font-black text-slate-900 uppercase">UTC-5 | ACTIVE</span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button className="p-3.5 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl relative transition-all border border-slate-200 shadow-sm group">
                    <Bell size={20} />
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm group-hover:scale-125 transition-transform"></span>
                 </button>
                 <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg border-4 border-slate-50 shadow-xl shadow-indigo-600/20">
                    {user?.name?.charAt(0) || 'H'}
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute inset-y-0 left-0 w-72 bg-white flex flex-col p-8">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                       <Briefcase size={16} />
                    </div>
                    <span className="font-black italic uppercase text-lg">HRM Console</span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={24} className="text-slate-400" />
                 </button>
              </div>

              <nav className="space-y-1">
                 {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${
                          isActive 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                 })}
              </nav>

              <button 
                onClick={handleLogout}
                className="mt-auto flex items-center gap-2 p-4 text-sm font-bold text-rose-500 bg-rose-50 rounded-xl"
              >
                <LogOut size={18} /> Termination Logic
              </button>
           </aside>
        </div>
      )}
    </div>
  );
};

export default HRLayout;
