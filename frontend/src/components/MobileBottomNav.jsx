import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Bell, 
  User, 
  Grid
} from 'lucide-react';
import { useSelector } from 'react-redux';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  // Custom tabs based on role
  const getDynamicTab = () => {
    switch(user.role?.toLowerCase()) {
      case 'admin':
      case 'manager':
        return { label: 'Inventory', path: '/inventory', icon: Package };
      case 'sales team':
        return { label: 'CRM', path: '/crm', icon: Grid };
      case 'hr':
        return { label: 'HR', path: '/hr/dashboard', icon: Grid };
      default:
        return { label: 'Tasks', path: '/my-tasks', icon: Grid };
    }
  };

  const dynamicTab = getDynamicTab();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    dynamicTab,
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/my-profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-4 pointer-events-none">
      <div className="max-w-md mx-auto w-full h-16 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-around px-2 pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center flex-1 h-full relative"
          >
            <div className={`transition-all duration-300 ${isActive(item.path) ? 'text-blue-400 -translate-y-1' : 'text-slate-500'}`}>
              <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-bold mt-1 uppercase tracking-tighter transition-all duration-300 ${isActive(item.path) ? 'text-blue-400 opacity-100' : 'text-slate-500/0 opacity-0'}`}>
              {item.label}
            </span>
            
            {/* Active Indicator Dot */}
            {isActive(item.path) && (
              <div className="absolute -top-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
