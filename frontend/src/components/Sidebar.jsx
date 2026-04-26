import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Target, 
  Scan,
  Calendar,
  CreditCard,
  ClipboardList,
  ArrowRightLeft,
  ShieldCheck,
  Settings,
  Bell,
  Activity,
  Truck,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Briefcase,
  Clock,
  Megaphone,
  CheckSquare,
  MapPin,
  MessageSquare,
  UserCircle,
  FileText,
  LogOut
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (name) => {
    setExpandedItem(prev => prev === name ? null : name);
  };

  const isAdmin = user?.role === 'Admin';

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: isAdmin ? '/admin/dashboard' : '/',
      allowedRoles: ['Admin', 'Manager', 'HR', 'Sales Team', 'Employee', 'Customer'] 
    },
    { 
      name: 'My Profile', 
      icon: UserCircle, 
      path: '/my-profile',
      allowedRoles: ['Admin', 'Manager', 'HR', 'Sales Team', 'Employee', 'Customer'] 
    },
    // ---- CUSTOMER EXTENSIONS ----
    { 
      name: 'Purchases', 
      icon: ShoppingBag, 
      path: '/customer/orders',
      allowedRoles: ['Customer'] 
    },
    { 
      name: 'Order Materials', 
      icon: ShoppingCart, 
      path: '/customer/shop',
      allowedRoles: ['Customer'] 
    },
    { 
      name: 'Fleet Tracker', 
      icon: MapPin, 
      path: '/customer/tracking',
      allowedRoles: ['Customer'] 
    },
    { 
      name: 'Help Desk', 
      icon: MessageSquare, 
      path: '/customer/tickets',
      allowedRoles: ['Customer'] 
    },
    { 
      name: 'Profile Config', 
      icon: UserCircle, 
      path: '/customer/profile',
      allowedRoles: ['Customer'] 
    },
    // ---- END CUSTOMER EXTENSIONS ----
    { 
      name: 'Attendance', 
      icon: Clock, 
      path: '/my-attendance',
      allowedRoles: ['Employee', 'HR', 'Manager', 'Sales Team'] 
    },
    { 
      name: 'Leaves', 
      icon: Calendar, 
      path: '/my-leaves',
      allowedRoles: ['Employee', 'HR', 'Manager', 'Sales Team'] 
    },
    { 
      name: 'Tasks', 
      icon: CheckSquare, 
      path: isAdmin ? '/admin/dashboard/hrms/task-assign' : (user?.role === 'Manager' ? '/manager/task-assign' : '/my-tasks'),
      allowedRoles: ['Employee', 'Manager', 'Admin', 'Sales Team'] 
    },
    { 
      name: 'My Salary', 
      icon: DollarSign, 
      path: '/my-salary',
      allowedRoles: ['Employee'] 
    },
    { 
      name: 'Field Audit', 
      icon: ClipboardList, 
      path: '/field-audit',
      allowedRoles: ['Employee'] 
    },
    { 
      name: 'Field Audits', 
      icon: ClipboardList, 
      path: isAdmin ? '/admin/dashboard/hrms/field-audits' : '/manager/field-audits',
      allowedRoles: ['Admin', 'Manager'] 
    },
    { 
      name: 'Material Hub', 
      icon: Package, 
      path: '/employee/materials',
      allowedRoles: ['Employee'] 
    },
    { 
      name: 'Announcements', 
      icon: Megaphone, 
      path: isAdmin ? '/admin/dashboard/announcements' : '/announcements',
      allowedRoles: ['Admin', 'Manager', 'HR', 'Sales Team', 'Employee'] 
    },
    { 
      name: 'Notifications', 
      icon: Bell, 
      path: isAdmin ? '/admin/dashboard/notifications' : '/notifications',
      allowedRoles: ['Admin', 'Manager', 'HR', 'Sales Team', 'Employee', 'Customer'] 
    },
    { 
      name: 'Stock Inventory', 
      icon: Package, 
      path: isAdmin ? '/admin/dashboard/inventory/list' : '/inventory',
      allowedRoles: ['Admin', 'Manager'],
      sub: [
        { name: 'Usage Dashboard', path: isAdmin ? '/admin/dashboard/stock-inventory' : '/inventory', icon: LayoutDashboard },
        { name: 'Materials Ledger', path: isAdmin ? '/admin/dashboard/inventory/list' : '/inventory/list', icon: Package },
        { name: 'Material Release', path: isAdmin ? '/admin/dashboard/inventory/release' : '/inventory/release', icon: Truck },
        { name: 'Employee Requests', path: isAdmin ? '/admin/dashboard/inventory/requests' : '/inventory/requests', icon: ShieldCheck },
        { name: 'Low Stock Alerts', path: isAdmin ? '/admin/dashboard/inventory/alerts' : '/inventory/alerts', icon: AlertCircle },
        { name: 'Digital Scanner', path: isAdmin ? '/admin/dashboard/inventory/scanner' : '/inventory/scanner', icon: Scan },
      ]
    },
    { 
      name: 'Employee Registry', 
      icon: Users, 
      path: isAdmin ? '/admin/dashboard/hrms/employees' : '/hr/employees',
      allowedRoles: ['Admin', 'Manager', 'HR'] 
    },
    { 
      name: 'HR Attendance', 
      icon: Clock, 
      path: isAdmin ? '/admin/dashboard/hrms/attendance' : '/hr/attendance',
      allowedRoles: ['Admin', 'Manager', 'HR'] 
    },
    { 
      name: 'HR Payroll', 
      icon: CreditCard, 
      path: isAdmin ? '/admin/dashboard/hrms/payroll' : '/hr/payroll',
      allowedRoles: ['Admin', 'Manager', 'HR'] 
    },
    { 
      name: 'Broadcasting', 
      icon: Megaphone, 
      path: isAdmin ? '/admin/dashboard/announcements' : '/hr/announcements',
      allowedRoles: ['Admin', 'Manager', 'HR'] 
    },
    { 
      name: 'Leave Approvals', 
      icon: ClipboardList, 
      path: isAdmin ? '/admin/dashboard/hrms/leave' : '/hr/leave',
      allowedRoles: ['Admin', 'Manager', 'HR'] 
    },
    { 
      name: 'ERP Console', 
      icon: ShoppingCart, 
      path: isAdmin ? '/admin/dashboard/erp' : '/erp',
      allowedRoles: ['Admin', 'Manager'],
      sub: [
        { name: 'Strategic Ops', path: isAdmin ? '/admin/dashboard/erp' : '/erp', icon: LayoutDashboard },
        { name: 'Suppliers', path: isAdmin ? '/admin/dashboard/erp/vendors' : '/erp/vendors', icon: Truck },
        { name: 'Procurement', path: isAdmin ? '/admin/dashboard/erp/orders' : '/erp/orders', icon: ShoppingBag },
        { name: 'Fiscal Node', path: isAdmin ? '/admin/dashboard/erp/finance' : '/erp/finance', icon: DollarSign },
      ]
    },
    { 
      name: 'Customer Sales', 
      icon: Target, 
      path: isAdmin ? '/admin/dashboard/crm' : '/crm',
      allowedRoles: ['Admin', 'Manager', 'Sales Team'],
      sub: [
        { name: 'Customers', path: isAdmin ? '/admin/dashboard/crm/customers' : '/crm/customers', icon: Users },
        { name: 'New Inquiries', path: isAdmin ? '/admin/dashboard/crm/leads' : '/crm/leads', icon: Target },
        { name: 'Business Deals', path: isAdmin ? '/admin/dashboard/crm/deals' : '/crm/deals', icon: Briefcase },
        { name: 'Billing & Invoices', path: isAdmin ? '/admin/dashboard/crm/invoices' : '/crm/invoices', icon: DollarSign },
        { name: 'Help Support', path: isAdmin ? '/admin/dashboard/crm/tickets' : '/crm/tickets', icon: Activity },
      ]
    },
  ];

  const adminItems = [
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Reports Center', icon: FileText, path: '/admin/reports' },
    { name: 'Material Hub', icon: Package, path: '/admin/material-hub' },
    { name: 'Audit Ledger', icon: ShieldCheck, path: '/admin/audit-logs' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-lg relative z-20 font-sans">
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20">S</div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">SMTBMS</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <p className="text-[10px] text-slate-400 font-medium">Core Node v6.0</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 mt-2 font-sans">Main Menu</p>

        {menuItems.filter(item => {
          const userRole = user?.role?.toLowerCase();
          return item.allowedRoles.some(role => role.toLowerCase() === userRole);
        }).map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const isExpanded = expandedItem === item.name;

          return (
            <div key={item.name} className="space-y-1">
              {item.sub ? (
                // Items with sub-menus: toggle accordion on click
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive || isExpanded
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ) : (
                // Regular items: navigate on click
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </div>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Sub-menu — always visible when expanded */}
              {item.sub && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-indigo-500/30 pl-4">
                  {item.sub.map(sub => (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                        location.pathname === sub.path
                          ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {sub.icon && <sub.icon size={14} />}
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}



        {user?.role === 'Admin' && (
          <>
            <div className="pt-6 space-y-2 border-t border-slate-800 mt-6">
               <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 mt-4">System Console</p>
               {adminItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      location.pathname === item.path ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                      <div className="flex items-center gap-3">
                         <item.icon size={18} />
                         <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                      {item.name === 'Notifications' && unreadCount > 0 && (
                        <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-indigo-500/20">
                          {unreadCount}
                        </span>
                      )}
                  </Link>
               ))}
            </div>
            
            {/* Notifications Feed for Admin */}
            <div className="mt-8 pt-6 border-t border-white/5 px-4 pb-4">
               <div className="flex justify-between items-center mb-4 px-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Notifications Feed</p>
                  {unreadCount > 0 && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />}
               </div>
               <div className="space-y-3">
                  <SidebarNotificationFeed />
               </div>
            </div>
          </>
        )}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={() => dispatch(logout())}
          className="flex items-center gap-3 text-slate-400 hover:text-rose-400 font-semibold transition-all w-full px-4 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-all" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const SidebarNotificationFeed = () => {
  const { notifications } = useSelector((state) => state.notifications);
  const navigate = useNavigate();

  return notifications.length > 0 ? (
    <div className="space-y-2">
      {notifications.slice(0, 3).map((n, idx) => (
        <div 
          key={idx} 
          onClick={() => navigate('/notifications')}
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-1">
             <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
               n.type === 'danger' ? 'bg-rose-500/20 text-rose-400' : 
               n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
             }`}>
               {n.type}
             </span>
             <span className="text-[6px] font-bold text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</span>
          </div>
          <p className="text-[9px] font-bold text-slate-200 uppercase italic line-clamp-1 group-hover:text-white transition-colors">{n.title}</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="py-8 text-center opacity-20">
       <p className="text-[8px] font-black uppercase tracking-widest">Protocol Stream Empty</p>
    </div>
  );
};

export default Sidebar;
