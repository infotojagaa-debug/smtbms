import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Briefcase,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  Trash2,
  Phone,
  Shield,
  Edit3,
  Eye,
  EyeOff,
  ChevronRight,
  DollarSign,
  XCircle,
  Lock,
  Calendar,
  Edit2
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Employee', department: '', phone: '', password: '',
    salary: { basic: 0, allowances: 0 }
  });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to retrieve user registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/api/users/${selectedId}`, formData);
        toast.success('Personnel record updated successfully');
      } else {
        const res = await api.post('/api/users', formData);
        toast.success('Personnel successfully inducted');
        setGeneratedCredentials({ email: res.data.email, password: res.data.tempPassword });
      }
      
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', role: 'Employee', department: '', phone: '', password: '', salary: { basic: 0, allowances: 0 } });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction Failed');
    }
  };

  const handleEditClick = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role || 'Employee',
      department: user.department || '',
      phone: user.phone || '',
      password: '', // Don't show password
      salary: user.salary || { basic: 0, allowances: 0 }
    });
    setSelectedId(user._id);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/api/users/${id}/toggle-status`, {});
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to modify status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("CRITICAL WARNING: This will permanently delete the selected user. Proceed?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('Personnel record expunged');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deletion Failed');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Are you sure you want to forcibly reset this user's password?")) return;
    try {
      const res = await api.put(`/api/users/${id}/reset-password`, {});
      toast.success('Security sequence reset. Check active credentials display.');
      setGeneratedCredentials({ email: 'RE-GENERATED', password: res.data.tempPassword });
    } catch (err) {
      toast.error('Reset Failed');
    }
  };

  const AVATAR_COLORS = [
    'bg-fuchsia-600', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-cyan-500'
  ];

  const COMBINED_FILTER_LIST = ['ALL', 'EMPLOYEE', 'MANAGER', 'HR', 'SALES', 'CUSTOMER'];

  const filteredUsers = users.filter(u => {
    // Show all except admin
    if (u.role?.toLowerCase() === 'admin') return false;

    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    const role = u.role ? u.role.toLowerCase() : '';
    const department = u.department ? u.department.toLowerCase() : '';
    
    if (filterType === 'ADMIN') return role.includes('admin');
    if (filterType === 'CUSTOMER') return role.includes('customer');
    if (filterType === 'EMPLOYEE') return role.includes('employee');
    if (filterType === 'MANAGER') return role.includes('manager') || role.includes('lead') || role.includes('head');
    if (filterType === 'HR') return role.includes('hr') || department.includes('hr') || department.includes('admin');
    if (filterType === 'SALES') return role.includes('sales') || department.includes('sales');
    
    return true; // ALL
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black italic uppercase text-slate-900 tracking-tighter leading-none mb-2">
               Global Registry
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
               Admin Authorization Control: <span className="text-indigo-600 font-black">{users.length} Identities Indexed</span>
            </p>
         </div>

         <button 
            onClick={() => {
              setIsEditMode(false);
              setGeneratedCredentials(null);
              setFormData({ name: '', email: '', role: 'Employee', department: '', phone: '', password: '', salary: { basic: 0, allowances: 0 } });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-slate-900/20 hover:scale-[1.02] hover:bg-indigo-600 active:scale-95 transition-all"
         >
            <UserPlus size={16} /> Enroll Entity
         </button>
      </div>

      {generatedCredentials && (
         <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-[2rem] shadow-sm flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 text-emerald-800">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-lg uppercase italic">Secure Credentials Generated</h3>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.3em] mt-0.5">Authorization Token Prepared</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Email Access</p>
                  <p className="font-mono text-slate-900 font-bold mt-1 text-lg">{generatedCredentials.email}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Temporary Password</p>
                  <p className="font-mono text-rose-600 font-black text-2xl tracking-wider bg-rose-50 px-6 py-2 rounded-xl mt-1 inline-block border border-rose-100">{generatedCredentials.password}</p>
               </div>
            </div>
         </div>
      )}

      {/* --- COMPACT SEARCH & STATS ROW --- */}
      <div className="flex flex-col gap-4 mb-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center gap-3 transition-all focus-within:ring-2 ring-indigo-100 pl-5">
               <Search size={16} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="SEARCH IDENTITY OR EMAIL..." 
                 className="bg-transparent border-none outline-none w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 placeholder-slate-400 py-1"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
               <div className="bg-indigo-50 rounded-2xl px-5 py-3 border border-indigo-100 flex items-center gap-4 min-w-[140px]">
                  <Users size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">{users.length}</p>
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Total Nodes</p>
                  </div>
               </div>
               <div className="bg-emerald-50 rounded-2xl px-5 py-3 border border-emerald-100 flex items-center gap-4 min-w-[140px]">
                  <Shield size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">{users.filter(u => u.status === 'Active').length}</p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Active Now</p>
                  </div>
               </div>
               <div className="bg-rose-50 rounded-2xl px-5 py-3 border border-rose-100 flex items-center gap-4 min-w-[140px]">
                  <Briefcase size={18} className="text-rose-500" />
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">{users.filter(u => u.role === 'Admin').length}</p>
                    <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Overlords</p>
                  </div>
               </div>
            </div>
         </div>

         {/* COMBINED FILTERS */}
         <div className="flex bg-slate-100 rounded-xl p-1 overflow-x-auto hide-scrollbar w-full">
            {COMBINED_FILTER_LIST.map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`shrink-0 px-8 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  filterType === type
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
         </div>
      </div>

      {/* --- USER GRID --- */}
      {loading ? (
        <div className="p-20 text-center text-slate-300 animate-pulse font-black uppercase italic tracking-widest">Compiling Roster...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic font-bold uppercase tracking-widest opacity-50">No Personnel Found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user, idx) => {
             const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
             const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
             const isAdmin = user.role === 'Admin';
             const isManager = user.role === 'Manager' || user.role === 'HR';

             return (
               <div 
                 key={user._id} 
                 className="bg-white rounded-[1.25rem] shadow-[0_8px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden border border-slate-100 max-h-[380px]"
                 style={{ animationDelay: `${idx * 0.05}s` }}
               >
                  <div className={`h-1 w-full ${isAdmin ? 'bg-rose-500' : (isManager ? 'bg-amber-500' : 'bg-indigo-500')} opacity-80`}></div>

                  {/* COMPACT CONTENT AREA */}
                  <div className="p-5 flex-1 flex flex-col overflow-hidden" onClick={() => handleEditClick(user)}>
                     <div className="flex justify-between items-start mb-4">
                        <div className="relative">
                           <div className={`${avatarBg} w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                              {initials}
                           </div>
                           {user.status === 'Active' && (
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                           )}
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] ${
                             isAdmin ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                             (isManager ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100')
                           }`}>
                              {user.role}
                           </span>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                              NODE: {user._id.substring(0, 8)}
                           </p>
                        </div>
                     </div>

                     <div className="mb-4">
                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1 truncate">{user.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                           {user.department || 'GLOBAL'} Sector
                        </p>
                     </div>

                     {/* INTERNAL SCROLLABLE METRICS */}
                     <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 pb-2">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Mail size={14} className="text-slate-300" />
                              <span className="text-[10px] font-bold truncate">{user.email}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Phone size={14} className="text-slate-300" />
                              <span className="text-[10px] font-bold">{user.phone || 'NO_LINK'}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-slate-500">
                              <Calendar size={14} className="text-slate-300" />
                              <span className="text-[10px] font-bold">Created {new Date(user.createdAt).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-indigo-600 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                              <DollarSign size={14} className="text-indigo-400" />
                              <span className="text-[10px] font-black tracking-widest uppercase">Base: ₹{(user.salary?.basic || 0).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* COMPACT FOOTER */}
                  <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center mt-auto">
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user._id); }} 
                        className={`text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${user.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}
                     >
                        {user.status === 'Active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {user.status === 'Active' ? 'AUTHORIZED' : 'SUSPENDED'}
                     </button>
                     
                     <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(user); }} className="p-1.5 rounded-lg bg-white border border-slate-100 text-indigo-500 shadow-sm hover:bg-indigo-50 transition-colors"><Edit2 size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleResetPassword(user._id); }} className="p-1.5 rounded-lg bg-white border border-slate-100 text-amber-500 shadow-sm hover:bg-amber-50 transition-colors"><KeyRound size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(user._id); }} className="p-1.5 rounded-lg bg-white border border-slate-100 text-rose-500 shadow-sm hover:bg-rose-50 transition-colors"><Trash2 size={12} /></button>
                     </div>
                  </div>
               </div>
             );
          })}
        </div>
      )}

      {/* --- PREMIUM NODE REGISTRATION MODAL --- */}
      {isCreateModalOpen && (
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
                             {isEditMode ? 'Modify Entity' : 'Enroll Identity'}
                          </h3>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Authorization Level Access</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => setIsCreateModalOpen(false)} 
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
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Command Role</label>
                       <select 
                         value={formData.role || 'Employee'} 
                         onChange={e => setFormData({...formData, role: e.target.value})} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-500 transition-all appearance-none cursor-pointer uppercase tracking-widest text-[10px]"
                       >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="HR">HR Architect</option>
                          <option value="Sales Team">Sales unit</option>
                          <option value="Admin">System Overlord</option>
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
                       onClick={() => setIsCreateModalOpen(false)} 
                       className="px-6 py-3 text-[9px] font-black tracking-widest uppercase text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                    >
                       Abort
                    </button>
                    <button 
                       type="submit" 
                       className="px-8 py-3 bg-slate-900 text-[9px] font-black tracking-widest uppercase text-white rounded-xl shadow-lg hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                       {isEditMode ? 'Modify Entity' : 'Enroll Identity'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
