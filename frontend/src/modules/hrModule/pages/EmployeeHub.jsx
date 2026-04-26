import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Shield,
  Download,
  Trash2,
  Edit2,
  Edit3,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Lock,
  DollarSign,
  XCircle
} from 'lucide-react';

const EmployeeHub = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role?.toLowerCase();
  const isAuthorized = ['admin', 'hr'].includes(userRole);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ role: 'ALL', department: 'ALL', status: 'Active' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', department: '', designation: '', 
    joiningDate: new Date().toISOString().split('T')[0],
    phone: '', salary: { basic: 0, allowances: 0 }, employeeType: 'Full-time'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const query = `search=${search}&status=${filter.status || ''}`;
      const res = await api.get(`/api/hr/employees?${query}`);
      setEmployees(res.data.employees);
    } catch (err) {
      toast.error('Identity data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filter]);

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      const payload = {
         ...formData,
         designation: formData.designation || formData.role || 'Staff Node',
         salary: formData.salary?.basic !== undefined ? formData.salary : { basic: 0, allowances: 0 },
         joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0]
      };

      if (isEditMode) {
        await api.put(`/api/hr/employees/${selectedId}`, payload);
        toast.success(`Node ${formData.name} updated successfully!`);
      } else {
        const res = await api.post('/api/hr/employees', payload);
        toast.success(`Node ${res.data.employee.employeeId} successfully inducted!`);
      }
      
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action Failed');
    }
  };

  const handleEditClick = (emp) => {
    setFormData({
        name: emp.name, email: emp.email, department: emp.department, designation: emp.designation, 
        joiningDate: new Date(emp.joiningDate).toISOString().split('T')[0],
        phone: emp.phone, salary: emp.salary, employeeType: emp.employeeType
    });
    setSelectedId(emp._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this personnel node?')) return;
    try {
      await api.delete(`/api/hr/employees/${id}`);
      toast.success('Node Terminated');
      fetchEmployees();
    } catch (err) {
      toast.error('Termination Protocol Failed');
    }
  };

  // Distinct colors for avatar circles based on index
  const AVATAR_COLORS = [
    'bg-fuchsia-600', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-cyan-500'
  ];

  const ROLE_FILTER_LIST = ['ALL', 'EMPLOYEE', 'MANAGER'];
  const DEPARTMENT_FILTER_LIST = ['ALL', 'OPERATIONS', 'CONSTRUCTION', 'LOGISTICS', 'IT', 'HR', 'SALES'];

  const filteredEmployees = employees.filter(emp => {
    // Show all except admin
    if (emp.userId?.role?.toLowerCase() === 'admin') return false;

    const designation = emp.designation ? emp.designation.toLowerCase() : '';
    const department = emp.department ? emp.department.toLowerCase() : '';
    const sysRole = emp.userId?.role ? emp.userId.role.toLowerCase() : '';
    
    // Ultra-broad manager definition
    const isManager = designation.includes('manager') || designation.includes('lead') || designation.includes('head') || designation.includes('director') || designation.includes('admin') || designation.includes('supervisor') || designation.includes('executive') || designation.includes('chief') || sysRole.includes('manager') || sysRole.includes('admin');
    
    // 1. Role Filter
    if (filter.role === 'EMPLOYEE' && isManager) return false;
    if (filter.role === 'MANAGER' && !isManager) return false;
    
    // 2. Department Filter
    if (filter.department !== 'ALL') {
       if (filter.department === 'HR' && !department.includes('hr') && !department.includes('admin')) return false;
       if (filter.department === 'SALES' && !department.includes('sales')) return false;
       if (filter.department === 'OPERATIONS' && !department.includes('operat')) return false;
       if (filter.department === 'CONSTRUCTION' && !department.includes('construct')) return false;
       if (filter.department === 'LOGISTICS' && !department.includes('logistic')) return false;
       if (filter.department === 'IT' && !department.includes('it') && !department.includes('tech') && !department.includes('dev') && !department.includes('information')) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black italic uppercase text-slate-900 tracking-tighter leading-none mb-2">
               Workforce Directory
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               Active Roster: <span className="text-rose-600 font-black">{employees.length} Personnel Authorized</span>
            </p>
         </div>

          {isAuthorized && (
            <button 
                onClick={() => {
                  setIsEditMode(false);
                  setFormData({ name: '', email: '', department: '', designation: '', joiningDate: new Date().toISOString().split('T')[0], phone: '', salary: { basic: 0, allowances: 0 }, employeeType: 'Full-time', role: 'Employee', password: '' });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-rose-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-rose-600/20 hover:scale-[1.02] hover:bg-rose-700 active:scale-95 transition-all"
            >
                <UserPlus size={16} /> Enroll Employee
            </button>
          )}
      </div>

      {/* --- COMPACT DASHBOARD HEADER --- */}
      <div className="flex flex-col gap-4 mb-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
         {/* Top Row: Search & Stats */}
         <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center gap-3 transition-all focus-within:ring-2 ring-indigo-100 pl-5">
               <Search size={16} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="SEARCH IDENTITY OR EMAIL..." 
                 className="bg-transparent border-none outline-none w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 placeholder-slate-400 py-1"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="flex gap-4">
               <div className="bg-indigo-50 rounded-2xl px-5 py-3 border border-indigo-100 flex items-center gap-4 min-w-[140px]">
                  <Users size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">{employees.length}</p>
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Total Staff</p>
                  </div>
               </div>
               <div className="bg-emerald-50 rounded-2xl px-5 py-3 border border-emerald-100 flex items-center gap-4 min-w-[140px]">
                  <Shield size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">{employees.filter(e => e.status === 'Active').length}</p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Active Now</p>
                  </div>
               </div>
               <div className="bg-amber-50 rounded-2xl px-5 py-3 border border-amber-100 flex items-center gap-4 min-w-[140px]">
                  <Briefcase size={18} className="text-amber-500" />
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">{new Set(employees.map(e => e.department)).size}</p>
                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">Active Depts</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Bottom Row: Filters */}
         <div className="flex flex-col lg:flex-row gap-4 items-center">


            {/* Department Filter Segmented Control */}
            <div className="flex bg-slate-100 rounded-xl p-1 overflow-x-auto hide-scrollbar w-full">
               {DEPARTMENT_FILTER_LIST.map(dept => (
                 <button 
                   key={dept}
                   onClick={() => setFilter({ role: 'ALL', department: dept, status: filter.status })}
                   className={`shrink-0 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                     filter.department === dept && filter.role === 'ALL'
                     ? 'bg-white text-slate-900 shadow-sm'
                     : 'text-slate-500 hover:text-slate-900'
                   }`}
                 >
                   {dept}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* --- EMPLOYEE GRID --- */}
      {loading ? (
        <div className="p-20 text-center text-slate-300 animate-pulse font-black uppercase italic tracking-widest">Compiling Roster...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic font-bold uppercase tracking-widest opacity-50">No Personnel Found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((emp, idx) => {
             const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
             const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
             const sysRole = emp.userId?.role ? emp.userId.role.toLowerCase() : '';
             const isAdmin = sysRole === 'admin';
             const isManager = emp.designation?.toLowerCase().includes('manager') || emp.designation?.toLowerCase().includes('lead') || emp.designation?.toLowerCase().includes('head') || sysRole === 'manager';
             const perfScore = 60 + (emp.name.length % 5) * 8; 
             const isExcellent = perfScore >= 80;

             return (
               <div 
                 key={emp._id} 
                 className="bg-white rounded-[1.25rem] shadow-[0_8px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden border border-slate-100 max-h-[380px]"
                 style={{ animationDelay: `${idx * 0.05}s` }}
               >
                  <div className={`h-1 w-full ${isManager ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'} opacity-80`}></div>

                  {/* COMPACT CONTENT AREA */}
                  <div className="p-5 flex-1 flex flex-col overflow-hidden" onClick={() => isAuthorized && handleEditClick(emp)}>
                     <div className="flex justify-between items-start mb-4">
                        <div className="relative">
                           <div className={`w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 ${isManager ? 'bg-slate-900' : avatarBg}`}>
                              {initials}
                           </div>
                           {emp.status === 'Active' && (
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                           )}
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] ${
                             isManager ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'
                           }`}>
                              {isManager ? 'MANAGER' : 'EMPLOYEE'}
                           </span>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                              ID: {emp.employeeId || emp._id.substring(0,6)}
                           </p>
                        </div>
                     </div>

                     <div className="mb-4">
                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1 truncate">{emp.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                           {emp.designation || 'Specialist'} • {emp.department}
                        </p>
                     </div>

                     {/* INTERNAL SCROLLABLE METRICS */}
                     <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 pb-2">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Mail size={14} className="text-slate-300" />
                              <span className="text-[10px] font-bold truncate">{emp.email}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Phone size={14} className="text-slate-300" />
                              <span className="text-[10px] font-bold">{emp.phone || 'NO_LINK'}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Calendar size={14} className="text-slate-300" />
                              <span className="text-[10px] font-bold">Joined {new Date(emp.joiningDate).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-indigo-600 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                              <DollarSign size={14} className="text-indigo-400" />
                              <span className="text-[10px] font-black tracking-widest uppercase">₹{(emp.salary?.basic || 0).toLocaleString()}</span>
                           </div>
                        </div>

                        <div>
                           <div className="flex justify-between items-end mb-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Magnitude</p>
                              <p className={`text-[9px] font-black ${isExcellent ? 'text-emerald-500' : 'text-amber-500'}`}>{perfScore}%</p>
                           </div>
                           <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${isExcellent ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${perfScore}%` }}></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* COMPACT FOOTER */}
                  <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                     {!isAdmin ? (
                       <button 
                          onClick={(e) => { e.stopPropagation(); if(isAuthorized) handleToggleStatus(emp._id); }} 
                          disabled={!isAuthorized}
                          className={`text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${emp.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'} ${!isAuthorized ? 'cursor-default' : ''}`}
                       >
                          {emp.status === 'Active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {emp.status === 'Active' ? 'ACTIVE' : 'OFFLINE'}
                       </button>
                     ) : (
                       <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Shield size={12} /> SECURE
                       </div>
                     )}
                     
                     {!isAdmin && isAuthorized && (
                       <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); handleEditClick(emp); }} className="p-1.5 rounded-lg bg-white border border-slate-100 text-indigo-500 shadow-sm hover:bg-indigo-50 transition-colors"><Edit2 size={12} /></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(emp._id); }} className="p-1.5 rounded-lg bg-white border border-slate-100 text-rose-500 shadow-sm hover:bg-rose-50 transition-colors"><Trash2 size={12} /></button>
                       </div>
                     )}
                  </div>
               </div>
             );
          })}
         </div>
      )}

      {/* --- PREMIUM NODE REGISTRATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-lg border border-slate-200 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-300">
              
              {/* COMPACT HEADER WITH GRADIENT ACCENT */}
              <div className="relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500"></div>
                 <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                          <UserPlus size={20} />
                       </div>
                       <div>
                          <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase italic">
                             {isEditMode ? 'Modify Entity' : 'Enroll Personnel'}
                          </h3>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Authorization Tier 1</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => setIsModalOpen(false)} 
                       className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 rounded-lg"
                    >
                       <XCircle size={20} />
                    </button>
                 </div>
              </div>

              <form onSubmit={handleAction} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Tag</label>
                       <input 
                         required 
                         value={formData.name} 
                         onChange={e => setFormData({...formData, name: e.target.value})} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all text-xs" 
                         placeholder="Full Name" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Comm Link</label>
                       <input 
                         required 
                         type="email" 
                         value={formData.email} 
                         onChange={e => setFormData({...formData, email: e.target.value})} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all text-xs" 
                         placeholder="Email Address" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Role</label>
                       <select 
                         value={formData.role || 'Employee'} 
                         onChange={e => setFormData({...formData, role: e.target.value})} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 transition-all appearance-none cursor-pointer uppercase tracking-widest text-[10px]"
                       >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="HR">HR Specialist</option>
                          <option value="Sales Team">Sales Unit</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Sector</label>
                       <select 
                         required 
                         value={formData.department} 
                         onChange={e => setFormData({...formData, department: e.target.value})} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 transition-all appearance-none cursor-pointer uppercase tracking-widest text-[10px]"
                       >
                          <option value="" disabled>Select Sector</option>
                          <option value="Operations">Operations</option>
                          <option value="Construction">Construction</option>
                          <option value="Logistics">Logistics</option>
                          <option value="IT">IT Infrastructure</option>
                          <option value="HR">Human Resources</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Voice Protocol</label>
                       <input 
                         required 
                         value={formData.phone} 
                         onChange={e => setFormData({...formData, phone: e.target.value})} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all text-xs" 
                         placeholder="Contact #" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Magnitude (Salary)</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                          <input 
                            required 
                            type="number"
                            value={formData.salary?.basic || ''} 
                            onChange={e => setFormData({...formData, salary: {...formData.salary, basic: e.target.value}})} 
                            className="w-full pl-10 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all text-xs" 
                            placeholder="Amount" 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                       <input 
                         type={showPassword ? "text" : "password"} 
                         value={formData.password || ''} 
                         onChange={e => setFormData({...formData, password: e.target.value})} 
                         className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all text-xs" 
                         placeholder={isEditMode ? "Unchanged" : "Auto-Generated"} 
                       />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                       >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                 </div>

                 <div className="pt-4 flex items-center justify-end gap-3">
                    <button 
                       type="button" 
                       onClick={() => setIsModalOpen(false)} 
                       className="px-6 py-3 text-[9px] font-black tracking-widest uppercase text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                    >
                       Abort
                    </button>
                    <button 
                       type="submit" 
                       className="px-8 py-3 bg-slate-900 text-[9px] font-black tracking-widest uppercase text-white rounded-xl shadow-lg hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                       {isEditMode ? 'Modify Personnel' : 'Enroll Employee'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeHub;
