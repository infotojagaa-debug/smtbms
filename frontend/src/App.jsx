import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';

// Layout & Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import MobileBottomNav from './components/MobileBottomNav';

// Isolated Premium Admin Setup
import AdminLayout from './modules/adminDashboard/layout/AdminLayout';
import SaasAdminDashboard from './modules/adminDashboard/pages/Dashboard';
import AdminPlaceholder from './modules/adminDashboard/pages/AdminPlaceholder';

// Auth Pages
import Login from './pages/auth/Login'; 

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import HRDashboard from './pages/dashboard/HRDashboard';
import SalesDashboard from './pages/dashboard/SalesDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';

// Employee Portal Pages
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import MyTasks from './pages/employee/MyTasks';
import Announcements from './pages/employee/Announcements';
import MaterialHub from './pages/employee/MaterialHub';
import MySalary from './pages/employee/MySalary';
import MyProfile from './pages/employee/MyProfile';

// Customer Portal Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import MaterialTracker from './pages/customer/MaterialTracker';
import CustomerTickets from './pages/customer/CustomerTickets';
import ProductCatalog from './pages/customer/ProductCatalog';

// Notification & Search
import NotificationCenter from './pages/notifications/NotificationCenter';
import ManagerRequests from './pages/manager/ManagerRequests';
import TaskAssign from './pages/manager/TaskAssign';
import FieldAuditReview from './pages/manager/FieldAuditReview';
import FieldAudit from './pages/employee/FieldAudit';

// Module Pages (Referenced from previous steps)
import InventoryDashboard from './pages/material/InventoryDashboard';
import MaterialList from './pages/material/MaterialList';
import AddEditMaterial from './pages/material/AddEditMaterial';
import MaterialDetail from './pages/material/MaterialDetail';
import MaterialRelease from './pages/material/MaterialRelease';
import LowStockAlerts from './pages/material/LowStockAlerts';
import ScannerPage from './pages/material/ScannerPage';

// ATUM Isolated Inventory Module
import ATUMInventoryDashboard from './modules/inventory/pages/InventoryDashboard';
import ATUMStockManagement from './modules/inventory/pages/StockManagement';

// HR Module Integration
import HRLayout from './modules/hrModule/layout/HRLayout';
import HRDashboardPage from './modules/hrModule/pages/HRDashboard';
import EmployeeHub from './modules/hrModule/pages/EmployeeHub';
import AttendanceMatrix from './modules/hrModule/pages/AttendanceMatrix';
import LeaveTerminal from './modules/hrModule/pages/LeaveTerminal';
import PayrollEngine from './modules/hrModule/pages/PayrollEngine';
import PerformanceRadar from './modules/hrModule/pages/PerformanceRadar';
import DocumentVault from './modules/hrModule/pages/DocumentHub';
import AnnouncementsTerminal from './modules/hrModule/pages/AnnouncementsTerminal';

import ERPDashboard from './pages/erp/ERPDashboard';
import VendorList from './pages/erp/VendorList';
import AddEditVendor from './pages/erp/AddEditVendor';
import VendorProfile from './pages/erp/VendorProfile';
import PurchaseOrderList from './pages/erp/PurchaseOrderList';
import CreatePurchaseOrder from './pages/erp/CreatePurchaseOrder';
import PODetail from './pages/erp/PODetail';
import FinancialReports from './pages/erp/FinancialReports';
import CustomerList from './pages/crm/CustomerList';
import AddEditCustomer from './pages/crm/AddEditCustomer';
import CustomerProfile from './pages/crm/CustomerProfile';
import LeadList from './pages/crm/LeadList';
import AddEditLead from './pages/crm/AddEditLead';
import LeadDetail from './pages/crm/LeadDetail';
import DealList from './pages/crm/DealList';
import AddEditDeal from './pages/crm/AddEditDeal';
import DealDetail from './pages/crm/DealDetail';
import Billing from './pages/crm/Billing';
import SupportTickets from './pages/crm/SupportTickets';
import AddEditTicket from './pages/crm/AddEditTicket';
import TicketDetail from './pages/crm/TicketDetail';
import CRMDashboard from './pages/crm/CRMDashboard';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import MaterialHubAdmin from './pages/admin/MaterialHubAdmin';
import UserManagement from './pages/admin/UserManagement';
import ReportsCenter from './pages/admin/ReportsCenter';

// Utils
import socketService from './utils/socketService';
import { addNotification, updateNotification } from './redux/slices/notificationSlice';
import { setConnected, updateOnlineCount, handleUserOnline, handleUserOffline } from './redux/slices/socketSlice';
import { AlertCircle, Clock } from 'lucide-react';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 1. Socket Integration
    if (user) {
      const socket = socketService.connect();
      
      if (socket) {
        socket.on('connect', () => dispatch(setConnected(true)));
        socket.on('disconnect', () => dispatch(setConnected(false)));
        
        // Listen to Organizational Alerts
        socket.on('notification', (notif) => {
          dispatch(addNotification(notif));
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-[1.5rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border border-slate-100`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-[14px] font-black text-slate-900 uppercase italic leading-none">{notif.title}</p>
                    <p className="mt-2 text-[11px] font-bold text-slate-700 uppercase leading-relaxed">{notif.message}</p>
                    <p className="mt-2 text-[9px] font-black text-slate-400 uppercase italic tracking-widest leading-none flex items-center gap-2">
                       {notif.priority === 'high' ? <AlertCircle size={10} className="text-rose-500" /> : <Clock size={10} />} 
                       {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 4000 });
        });

        // Listen for Grouped Updates (Real-time merging)
        socket.on('notification_updated', (notif) => {
          dispatch(updateNotification(notif));
        });

        // Online Tracking
        socket.on('system:online_count', (count) => dispatch(updateOnlineCount(count)));
        socket.on('user:online', (u) => dispatch(handleUserOnline(u)));
        socket.on('user:offline', (u) => dispatch(handleUserOffline(u)));
      }
    } else {
      socketService.disconnect();
    }

    return () => {
       socketService.disconnect();
    };
  }, [user, dispatch]);

  const getDefaultDashboard = () => {
    if (!user) return <Login />;
    const role = user.role?.toLowerCase();
    switch(role) {
      case 'admin': return <AdminDashboard />;
      case 'hr': return <HRDashboard />;
      case 'sales team': return <SalesDashboard />;
      case 'customer': return <CustomerDashboard />;
      case 'manager': return <AdminDashboard />;
      default: return <EmployeeDashboard />;
    }
  };

  const location = useLocation();
  const isIsolatedLayout = location.pathname.startsWith('/admin/dashboard');

  return isIsolatedLayout ? (
    <>
      <Toaster 
        position="top-right" 
        containerStyle={{
          top: 85,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          }
        }}
      />
      {isMobile && user && <MobileBottomNav />}
      <Routes>
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><AdminLayout /></RoleRoute>}>
           <Route index element={<SaasAdminDashboard />} />
           <Route path="announcements" element={<Announcements />} />
           
           {/* Material Flux / Inventory */}
           <Route path="stock-inventory" element={<InventoryDashboard />} />
           <Route path="inventory/list" element={<MaterialList />} />
           <Route path="inventory/add" element={<AddEditMaterial />} />
           <Route path="inventory/release" element={<MaterialRelease />} />
           <Route path="inventory/alerts" element={<LowStockAlerts />} />
           <Route path="inventory/scanner" element={<ScannerPage />} />
           <Route path="inventory/requests" element={<ManagerRequests />} />

           {/* Workforce Hub / HRMS */}
           <Route path="hr" element={<HRDashboardPage />} />
           <Route path="hrms/employees" element={<EmployeeHub />} />
           <Route path="hrms/attendance" element={<AttendanceMatrix />} />
           <Route path="hrms/leave" element={<LeaveTerminal />} />
           <Route path="hrms/payroll" element={<PayrollEngine />} />
           <Route path="hrms/performance" element={<PerformanceRadar />} />
           <Route path="hrms/documents" element={<DocumentVault />} />
           <Route path="hrms/task-assign" element={<TaskAssign />} />
           <Route path="hrms/field-audits" element={<FieldAuditReview />} />

           {/* ERP Console */}
           <Route path="erp" element={<ERPDashboard />} />
           <Route path="erp/vendors" element={<VendorList />} />
           <Route path="erp/vendors/add" element={<AddEditVendor />} />
           <Route path="erp/vendors/:id" element={<VendorProfile />} />
           <Route path="erp/orders" element={<PurchaseOrderList />} />
           <Route path="erp/orders/create" element={<CreatePurchaseOrder />} />
           <Route path="erp/orders/:id" element={<PODetail />} />
           <Route path="erp/finance" element={<FinancialReports />} />

           {/* CRM Vertical */}
           <Route path="crm" element={<CRMDashboard />} />
           <Route path="crm/customers" element={<CustomerList />} />
           <Route path="crm/customers/add" element={<AddEditCustomer />} />
           <Route path="crm/customers/:id" element={<CustomerProfile />} />
           <Route path="crm/leads" element={<LeadList />} />
           <Route path="crm/leads/add" element={<AddEditLead />} />
           <Route path="crm/leads/:id" element={<LeadDetail />} />
           <Route path="crm/deals" element={<DealList />} />
           <Route path="crm/deals/add" element={<AddEditDeal />} />
           <Route path="crm/deals/add/:id" element={<AddEditDeal />} />
           <Route path="crm/deals/:id" element={<DealDetail />} />
           <Route path="crm/invoices" element={<Billing />} />
           <Route path="crm/tickets" element={<SupportTickets />} />
           <Route path="crm/tickets/create" element={<AddEditTicket />} />
           <Route path="crm/tickets/:id" element={<TicketDetail />} />

           <Route path="notifications" element={<NotificationCenter />} />
           <Route path="users" element={<UserManagement />} />
           <Route path="material-hub" element={<MaterialHubAdmin />} />
           <Route path="reports-center" element={<ReportsCenter />} />
           <Route path="audit-logs" element={<AuditLogs />} />
           <Route path="settings" element={<SystemSettings />} />
           <Route path="*" element={<AdminPlaceholder title="Module Hub" description="This subsystem is currently being migrated to the high-density analytical layer." />} />
        </Route>


      </Routes>
    </>
  ) : (
    <div className={`h-screen flex overflow-hidden font-sans bg-[#F1FFF0] ${isMobile ? 'flex-col' : ''}`}>
      <Toaster 
        position="top-right" 
        containerStyle={{
          top: 85,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          }
        }}
      />
      
      {!isMobile && user && <Sidebar />}
      {isMobile && user && <MobileBottomNav />}
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {!isMobile && user && <Header />}
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${user ? (isMobile ? 'p-4 pb-24' : 'p-6') : ''}`}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            <Route path="/" element={<ProtectedRoute>{user?.role === 'Admin' ? <Navigate to="/admin/dashboard" /> : getDefaultDashboard()}</ProtectedRoute>} />
            
            {/* Global Features */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

            {/* Employee Portal */}
            <Route path="/my-profile" element={<RoleRoute allowedRoles={['Employee', 'Admin', 'HR', 'Manager', 'Sales Team', 'Customer']}><MyProfile /></RoleRoute>} />
            <Route path="/my-attendance" element={<RoleRoute allowedRoles={['Employee', 'HR', 'Manager', 'Sales Team']}><MyAttendance /></RoleRoute>} />
            <Route path="/my-leaves" element={<RoleRoute allowedRoles={['Employee', 'HR', 'Manager', 'Sales Team']}><MyLeaves /></RoleRoute>} />
            <Route path="/my-tasks" element={<RoleRoute allowedRoles={['Employee', 'Manager', 'Admin', 'Sales Team']}><MyTasks /></RoleRoute>} />
            <Route path="/my-salary" element={<RoleRoute allowedRoles={['Employee']}><MySalary /></RoleRoute>} />
            <Route path="/employee/materials" element={<RoleRoute allowedRoles={['Employee']}><MaterialHub /></RoleRoute>} />
            <Route path="/field-audit" element={<RoleRoute allowedRoles={['Employee']}><FieldAudit /></RoleRoute>} />

            {/* Customer Portal */}
            <Route path="/customer/orders" element={<RoleRoute allowedRoles={['Customer']}><CustomerOrders /></RoleRoute>} />
            <Route path="/customer/shop" element={<RoleRoute allowedRoles={['Customer']}><ProductCatalog /></RoleRoute>} />
            <Route path="/customer/tracking" element={<RoleRoute allowedRoles={['Customer']}><MaterialTracker /></RoleRoute>} />
            <Route path="/customer/tickets" element={<RoleRoute allowedRoles={['Customer']}><CustomerTickets /></RoleRoute>} />

            {/* HR / Workforce Module (Admin/Manager/HR) */}
            <Route path="/hr/dashboard" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><HRDashboardPage /></RoleRoute>} />
            <Route path="/hr/employees" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><EmployeeHub /></RoleRoute>} />
            <Route path="/hr/attendance" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><AttendanceMatrix /></RoleRoute>} />
            <Route path="/hr/leave" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><LeaveTerminal /></RoleRoute>} />
            <Route path="/hr/announcements" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><AnnouncementsTerminal /></RoleRoute>} />
            <Route path="/hr/documents" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><DocumentVault /></RoleRoute>} />
            <Route path="/hr/payroll" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><PayrollEngine /></RoleRoute>} />
            <Route path="/hr/performance" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'HR']}><PerformanceRadar /></RoleRoute>} />

            {/* Material Module */}
            <Route path="/inventory" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><InventoryDashboard /></RoleRoute>} />
            <Route path="/inventory/list" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><MaterialList /></RoleRoute>} />
            <Route path="/inventory/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><MaterialDetail /></RoleRoute>} />
            <Route path="/inventory/add" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><AddEditMaterial /></RoleRoute>} />
            <Route path="/inventory/requests" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><ManagerRequests /></RoleRoute>} />
            <Route path="/inventory/alerts" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><LowStockAlerts /></RoleRoute>} />
            <Route path="/inventory/release" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><MaterialRelease /></RoleRoute>} />
            <Route path="/inventory/scanner" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><ScannerPage /></RoleRoute>} />
            <Route path="/manager/task-assign" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><TaskAssign /></RoleRoute>} />
            <Route path="/manager/field-audits" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><FieldAuditReview /></RoleRoute>} />
            
            {/* ATUM Isolated Inventory Module */}
            <Route path="/atum-inventory" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><ATUMInventoryDashboard /></RoleRoute>} />
            <Route path="/atum-inventory/stock" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><ATUMStockManagement /></RoleRoute>} />
            
            {/* ERP Module */}
            <Route path="/erp" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><ERPDashboard /></RoleRoute>} />
            <Route path="/erp/vendors" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><VendorList /></RoleRoute>} />
            <Route path="/erp/vendors/add" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><AddEditVendor /></RoleRoute>} />
            <Route path="/erp/vendors/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><VendorProfile /></RoleRoute>} />
            <Route path="/erp/orders" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><PurchaseOrderList /></RoleRoute>} />
            <Route path="/erp/orders/create" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><CreatePurchaseOrder /></RoleRoute>} />
            <Route path="/erp/orders/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><PODetail /></RoleRoute>} />
            <Route path="/erp/finance" element={<RoleRoute allowedRoles={['Admin', 'Manager']}><FinancialReports /></RoleRoute>} />
            
            {/* CRM Module */}
            <Route path="/crm" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><CRMDashboard /></RoleRoute>} />
            <Route path="/crm/customers" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><CustomerList /></RoleRoute>} />
            <Route path="/crm/customers/add" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><AddEditCustomer /></RoleRoute>} />
            <Route path="/crm/customers/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><CustomerProfile /></RoleRoute>} />
            <Route path="/crm/leads" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><LeadList /></RoleRoute>} />
            <Route path="/crm/leads/add" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><AddEditLead /></RoleRoute>} />
            <Route path="/crm/leads/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><LeadDetail /></RoleRoute>} />
            <Route path="/crm/deals" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><DealList /></RoleRoute>} />
            <Route path="/crm/deals/add" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><AddEditDeal /></RoleRoute>} />
            <Route path="/crm/deals/add/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><AddEditDeal /></RoleRoute>} />
            <Route path="/crm/deals/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><DealDetail /></RoleRoute>} />
            <Route path="/crm/invoices" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><Billing /></RoleRoute>} />
            <Route path="/crm/tickets" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><SupportTickets /></RoleRoute>} />
            <Route path="/crm/tickets/create" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><AddEditTicket /></RoleRoute>} />
            <Route path="/crm/tickets/:id" element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Sales Team']}><TicketDetail /></RoleRoute>} />
            
            {/* Admin Management */}
            <Route path="/admin/audit-logs" element={<RoleRoute allowedRoles={['Admin']}><AuditLogs /></RoleRoute>} />
            <Route path="/admin/settings" element={<RoleRoute allowedRoles={['Admin']}><SystemSettings /></RoleRoute>} />
            <Route path="/admin/material-hub" element={<RoleRoute allowedRoles={['Admin']}><MaterialHubAdmin /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute allowedRoles={['Admin']}><UserManagement /></RoleRoute>} />
            <Route path="/admin/reports" element={<RoleRoute allowedRoles={['Admin']}><ReportsCenter /></RoleRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
