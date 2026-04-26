import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* SMTBMS Dark Sidebar */}
      <Sidebar />
      
      {/* Main Content Pane */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Dynamic Topbar */}
        <Topbar />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-10 pt-16 pb-20">
          <div className="max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
