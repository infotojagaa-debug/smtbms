import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';
import socketService from '../../../utils/socketService';
import { 
  LayoutDashboard, Megaphone, Activity, Users, Server, 
  PieChart, LogOut, Settings, ChevronDown, ChevronRight, Bell 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { group: 'Main Menu' },
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Announcements', icon: Megaphone, path: '/admin/dashboard/announcements' },
  { 
    name: 'Stock & Inventory', 
    icon: Activity, 
    path: '/admin/dashboard/inventory/list',
    subItems: [
      { name: 'Inventory View', path: '/admin/dashboard/inventory/list' },
      { name: 'Material Release', path: '/admin/dashboard/inventory/release' },
      { name: 'Requisitions', path: '/admin/dashboard/inventory/requests' },
      { name: 'Add Material', path: '/admin/dashboard/inventory/add' },
      { name: 'Low Stock', path: '/admin/dashboard/inventory/alerts' },
      { name: 'Terminal Scanner', path: '/admin/dashboard/inventory/scanner' }
    ]
  },
  { 
    name: 'Staff Management', 
    icon: Users, 
    path: '/admin/dashboard/hr',
    subItems: [
      { name: 'Staff List', path: '/admin/dashboard/hrms/employees' },
      { name: 'Job Assignments', path: '/admin/dashboard/hrms/task-assign' },
      { name: 'Site Audits', path: '/admin/dashboard/hrms/field-audits' },
      { name: 'Daily Attendance', path: '/admin/dashboard/hrms/attendance' },
      { name: 'Leave Approvals', path: '/admin/dashboard/hrms/leave' },
      { name: 'Salary & Payroll', path: '/admin/dashboard/hrms/payroll' }
    ]
  },
  { 
    name: 'Supplier & Orders', 
    icon: Server, 
    path: '/admin/dashboard/erp',
    subItems: [
      { name: 'Suppliers List', path: '/admin/dashboard/erp/vendors' },
      { name: 'Purchase Orders', path: '/admin/dashboard/erp/orders' },
      { name: 'Money Reports', path: '/admin/dashboard/erp/finance' }
    ]
  },
  { 
    name: 'Customer Sales', 
    icon: PieChart, 
    path: '/admin/dashboard/crm',
    subItems: [
      { name: 'Customers', path: '/admin/dashboard/crm/customers' },
      { name: 'New Inquiries', path: '/admin/dashboard/crm/leads' },
      { name: 'Business Deals', path: '/admin/dashboard/crm/deals' },
      { name: 'Billing & Invoices', path: '/admin/dashboard/crm/invoices' },
      { name: 'Help Support', path: '/admin/dashboard/crm/tickets' }
    ]
  },
  { group: 'System Console' },
  { name: 'Admin Hub', icon: Activity, path: '/admin/dashboard/material-hub' },
  { name: 'Notifications', icon: Bell, path: '/admin/dashboard/notifications' },
  { name: 'User Management', icon: Users, path: '/admin/dashboard/users' },
  { name: 'Reports Center', icon: LayoutDashboard, path: '/admin/dashboard/reports-center' },
  { name: 'System History', icon: Server, path: '/admin/dashboard/audit-logs' },
  { name: 'Settings', icon: Settings, path: '/admin/dashboard/settings' }
];

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [openMenus, setOpenMenus] = useState({});

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
  };

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="w-64 bg-[#0F172A] flex flex-col h-full font-sans text-slate-300 shadow-xl z-20">
      {/* Brand Logo */}
      <div className="h-24 flex items-center px-6 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex justify-center items-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
             <span className="text-white font-black text-lg tracking-wide block leading-tight">SMTBMS</span>
             <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Core Node v6.0</span>
             </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {navItems.map((item, idx) => {
          if (item.group) {
             return <p key={idx} className="text-[10px] font-black uppercase tracking-widest text-slate-500 pt-5 pb-2 pl-3">{item.group}</p>
          }

          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenus[item.name];
          const isActive = location.pathname === item.path || (hasSubItems && item.subItems.some(sub => location.pathname === sub.path));

          return (
            <div key={item.name} className="space-y-1">
              <div className="relative group">
                <Link 
                  to={item.path}
                  onClick={() => hasSubItems && !isOpen && toggleMenu(item.name)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isActive 
                      ? hasSubItems ? 'bg-slate-800/50 text-white font-bold' : 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'}>
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="text-[13px]">{item.name}</span>
                  </div>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-rose-500/20">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                {hasSubItems && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(item.name); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Sub Items */}
              <AnimatePresence>
                {hasSubItems && isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-1 pl-12 pr-2"
                  >
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={`block py-2 px-3 rounded-lg text-[12px] transition-all ${
                          location.pathname === sub.path 
                            ? 'text-indigo-400 font-bold bg-indigo-500/5' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-rose-500/10 rounded-xl transition-all font-medium group"
        >
          <LogOut size={18} className="group-hover:text-rose-500" />
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
