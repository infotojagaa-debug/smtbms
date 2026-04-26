import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Camera,
  Clock,
  TrendingUp,
  Fingerprint,
  CheckCircle,
  X,
  Plus,
  Activity,
  Bell,
  Info,
  ExternalLink,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const avatars = [
  { id: 'boy1', url: '/avatars/boy1.png', label: 'Executive 1' },
  { id: 'girl1', url: '/avatars/girl1.png', label: 'Executive 2' },
  { id: 'boy2', url: '/avatars/boy2.png', label: 'Professional 1' },
  { id: 'girl2', url: '/avatars/girl2.png', label: 'Professional 2' },
  { id: 'boy3', url: '/avatars/boy3.png', label: 'Management 1' },
  { id: 'girl3', url: '/avatars/girl3.png', label: 'Management 2' },
  { id: 'boy4', url: '/avatars/boy4.png', label: 'Senior 1' },
  { id: 'girl4', url: '/avatars/girl1.png', label: 'Senior 2' },
  { id: 'boy5', url: '/avatars/boy2.png', label: 'Lead 1' },
  { id: 'girl5', url: '/avatars/girl2.png', label: 'Lead 2' },
  { id: 'boy6', url: '/avatars/boy3.png', label: 'Director 1' },
  { id: 'girl6', url: '/avatars/girl3.png', label: 'Director 2' },
];

const MyProfile = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  const fetchProfile = async () => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (!userStr) return;
      const { token } = JSON.parse(userStr);
      const res = await axios.get('/api/hr/employees/profile/self', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFormData(res.data);
      setPhotoPreview(res.data.photo);
    } catch (err) {
      console.error('Profile Retrieval Failed:', err);
      toast.error('Failed to sync digital identity');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectAvatar = (url) => {
    setPhotoPreview(url);
    setPhotoFile(null);
    setShowAvatarModal(false);
  };

  const handleUpdate = async () => {
    try {
      const userStr = sessionStorage.getItem('user');
      const { token } = JSON.parse(userStr);
      const headers = { Authorization: `Bearer ${token}` };

      // Step 1: Always update via universal auth route (works for ALL roles)
      await axios.put('/api/auth/update-profile', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        password: formData.newPassword,
        photo: photoFile ? undefined : photoPreview
      }, { headers });

      // Step 2: If there's a file upload, also push to employee endpoint
      if (photoFile) {
        try {
          const fd = new FormData();
          fd.append('photo', photoFile);
          if (formData.phone) fd.append('phone', formData.phone);
          if (formData.address) fd.append('address', formData.address);
          await axios.put('/api/hr/employees/profile/self', fd, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' }
          });
        } catch (_) { /* non-employee user — file handled by auth endpoint */ }
      }

      toast.success('Identity Protocols Synchronized');
      setIsEditing(false);
      setPhotoFile(null);
      fetchProfile();
    } catch (err) {
      console.error('Update Failed:', err);
      toast.error('Synchronization Fault Detected');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] bg-[#F1FFF0] -m-6 p-10 font-sans">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[.3em] text-slate-900 mt-4 animate-pulse">Initializing Identity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1FFF0] -m-6 p-10 font-sans transition-all pb-28 overflow-x-hidden selection:bg-indigo-100">
      <div className="max-w-[1300px] mx-auto space-y-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 px-10 rounded-full border border-slate-100 shadow-sm">
          <div className="text-center sm:text-left">
             <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-2">
                <ShieldCheck size={24} className="text-indigo-600" /> Identity Hub
             </h1>
          </div>
          <button 
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            className={`flex items-center gap-2 px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg border-2 ${
              isEditing ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {isEditing ? <><Save size={14} /> Commit Changes</> : <><Edit3 size={14} /> Open Editor</>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- LEFT: ID CARD --- */}
          <div className="lg:col-span-4 lg:sticky lg:top-10">
             <motion.div className="w-full max-w-[380px] mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative group">
                <div className="h-32 bg-slate-900 relative flex flex-col items-center justify-center text-center">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                   <h3 className="text-lg font-black text-white italic tracking-[0.4em] uppercase">S M T B M S</h3>
                </div>

                <div className="p-10 -mt-16 relative z-10 flex flex-col items-center pb-10"> {/* Increased padding and height */}
                   <div className="relative group/avatar">
                      <div className="w-44 h-44 rounded-full border-[10px] border-white shadow-2xl bg-slate-50 overflow-hidden relative">
                         {photoPreview ? (
                           <img src={photoPreview} className="w-full h-full object-cover" alt="Profile" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-200">
                             <User size={50} />
                           </div>
                         )}
                         {isEditing && (
                            <div onClick={() => setShowAvatarModal(true)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white flex-col gap-1">
                                <Camera size={24} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Change</span>
                            </div>
                         )}
                      </div>
                      {isEditing && (
                        <button onClick={() => setShowAvatarModal(true)} className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl border border-slate-200 hover:border-slate-900 transition-all active:scale-90">
                           <Plus size={18} />
                        </button>
                      )}
                   </div>

                   <div className="mt-4 text-center space-y-2 w-full">
                      <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none truncate px-2">{profile?.name}</h2>
                      <div className="inline-block px-5 py-2 bg-slate-900 rounded-full">
                         <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{profile?.userId?.role || profile?.designation || 'EMPLOYEE'}</span>
                      </div>
                   </div>

                   <div className="w-full mt-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                      <div className="space-y-0.5 text-left">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID</p>
                         <p className="text-[10px] font-black text-slate-900 uppercase truncate">{profile?.employeeId || `USR-${profile?._id?.slice(-5).toUpperCase()}`}</p>
                      </div>
                      <div className="space-y-0.5 text-left">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">UNIT</p>
                         <p className="text-[10px] font-black text-slate-900 uppercase truncate">{profile?.department || 'OPS'}</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* --- RIGHT: DATA TRACKER --- */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* Stats Hub - Increased Height/Padding */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Present Days', value: profile?.stats?.workingDays || 0, total: 30, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-emerald-500', legend: 'This Month', util: `${Math.round(((profile?.stats?.workingDays || 0)/30)*100)}% utilised` },
                  { label: 'Tasks Done', value: profile?.stats?.tasksCompleted || 0, total: 20, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', barColor: 'bg-rose-500', legend: 'Current Cycle', util: `${Math.round(((profile?.stats?.tasksCompleted || 0)/20)*100)}% utilised` },
                  { label: 'Pending Leave', value: profile?.stats?.leavesTaken || 0, total: 10, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50', barColor: 'bg-sky-500', legend: 'Awaiting HR', util: `${Math.round(((profile?.stats?.leavesTaken || 0)/10)*100)}% utilised` },
                ].map((stat, idx) => {
                  const percent = (stat.value / stat.total) * 100;
                  return (
                    <motion.div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-xl group">
                       <div className="flex items-center gap-4">
                          <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl shadow-sm`}>
                             <stat.icon size={20} strokeWidth={3} />
                          </div>
                          <span className={`text-[10px] font-black ${stat.color} uppercase tracking-widest`}>{stat.label}</span>
                       </div>
                       
                       <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-900 tabular-nums">{stat.value}</span>
                          <span className="text-xs font-bold text-slate-400">/ {stat.total} d</span>
                       </div>

                       <div className="space-y-3">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${stat.barColor} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-400 uppercase">{stat.legend}</span>
                             <span className={`text-[9px] font-black ${stat.color} uppercase`}>{stat.util}</span>
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
             </div>

             {/* Personnel Data Matrix - Increased Height/Padding */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden text-left relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                <div className="px-10 py-8 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-transparent flex items-center gap-6">
                   <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <Briefcase size={22} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-2">
                      Personnel Data Matrix
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                   </h3>
                </div>

                <div className="p-8 space-y-10"> {/* Restored padding */}
                   <section className="space-y-8">
                      <div className="flex items-center gap-6">
                         <div className="h-[2.5px] w-8 bg-slate-900 rounded-full"></div>
                         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Primary Identity Vector</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"> {/* Restored gap */}
                         {[
                           { label: 'Identity Name', key: 'name', icon: User, type: 'text', editable: true },
                           { label: 'Corporate Email', key: 'email', icon: Mail, type: 'email', editable: false },
                           { label: 'Mobile Access', key: 'phone', icon: Phone, type: 'text', editable: true },
                           { label: 'Date of Birth', key: 'dateOfBirth', icon: Calendar, type: 'date', editable: true },
                         ].map((field) => (
                           <div key={field.key} className="space-y-4">
                              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                                 {field.label}
                                 {isEditing && field.editable && <span className="w-1 h-1 bg-indigo-500 rounded-full animate-ping"></span>}
                              </label>
                              <div className={`relative group/field ${!field.editable ? 'opacity-60' : ''} transition-transform duration-300 hover:translate-x-1`}>
                                 <field.icon className={`absolute left-6 top-1/2 -translate-y-1/2 ${field.editable ? 'text-slate-400 group-focus-within/field:text-slate-900' : 'text-slate-300'} transition-colors`} size={20} />
                                 <input 
                                   type={field.type}
                                   disabled={!isEditing || !field.editable}
                                   value={field.key === 'dateOfBirth' ? (formData[field.key] ? formData[field.key].split('T')[0] : '') : (formData[field.key] || '')}
                                   onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                   className={`w-full pl-16 pr-8 py-5 bg-white/50 border-2 rounded-[1.5rem] text-sm font-black text-slate-900 outline-none transition-all duration-500 ${isEditing && field.editable ? 'border-slate-200 hover:border-indigo-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10' : 'border-slate-100 cursor-not-allowed'} shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group-hover/field:shadow-md`}
                                 />
                              </div>
                           </div>
                         ))}
                         
                         {isEditing && (
                            <div className="space-y-4">
                               <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-1 opacity-90 flex items-center gap-2">
                                  Update Security Key
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                               </label>
                               <div className="relative group/field transition-transform duration-300 hover:translate-x-1">
                                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-indigo-600 transition-colors" size={20} />
                                  <input 
                                    type={showPassword ? "text" : "password"}
                                    value={formData.newPassword || ''}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    placeholder="Enter new password"
                                    className="w-full pl-16 pr-12 py-5 bg-indigo-50/30 border-2 border-indigo-100 rounded-[1.5rem] text-sm font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-500"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                  >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                               </div>
                            </div>
                          )}
                      </div>
                   </section>

                   <section className="space-y-8 pt-4">
                      <div className="flex items-center gap-6">
                         <div className="h-[2.5px] w-8 bg-rose-500 rounded-full"></div>
                         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Operational Parameters</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 group transition-all duration-500 hover:shadow-xl hover:bg-white/60">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Designation</p>
                           <p className="text-xl font-black text-slate-900 uppercase italic truncate">{profile?.designation}</p>
                         </div>
                         <div className="p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 group transition-all duration-500 hover:shadow-xl hover:bg-white/60">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Unit</p>
                           <p className="text-xl font-black text-slate-900 uppercase italic truncate">{profile?.department}</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Deployment Address</label>
                         <div className="relative group/field">
                            <MapPin className="absolute left-6 top-8 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" size={20} />
                            <textarea 
                              disabled={!isEditing}
                              value={formData.address || ''}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                              rows={4}
                              className={`w-full pl-16 pr-8 py-8 bg-white border-2 rounded-[3rem] text-sm font-black text-slate-900 outline-none transition-all duration-300 ${isEditing ? 'border-slate-300 hover:border-slate-900 focus:border-slate-900' : 'border-slate-100 cursor-not-allowed'} shadow-sm resize-none`}
                            ></textarea>
                         </div>
                      </div>
                    </section>

                    {/* --- NOTIFICATIONS PROTOCOL --- */}
                    <section className="space-y-8 pt-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="h-[2.5px] w-8 bg-indigo-500 rounded-full"></div>
                             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Institutional Alerts</h4>
                          </div>
                          <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                             Protocol History <ExternalLink size={12} />
                          </button>
                       </div>

                       <div className="space-y-4">
                          {notifications && notifications.length > 0 ? notifications.slice(0, 3).map((notif, idx) => (
                             <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-6 group hover:shadow-lg transition-all">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 shadow-sm'}`}>
                                   <Bell size={20} className={notif.isRead ? '' : 'animate-bounce'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className={`text-sm font-black tracking-tight ${notif.isRead ? 'text-slate-500' : 'text-slate-900'}`}>{notif.title}</p>
                                   <p className="text-xs text-slate-400 mt-0.5 truncate italic">"{notif.message}"</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                   {!notif.isRead && <div className="w-2 h-2 rounded-full bg-rose-500 ml-auto mt-2"></div>}
                                </div>
                             </div>
                          )) : (
                             <div className="p-12 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                                <Info className="mx-auto text-slate-300 mb-4" size={32} />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active protocols detected</p>
                             </div>
                          )}
                       </div>
                    </section>
                 </div>
                
                <div className="px-10 py-12 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <ShieldCheck className="text-slate-900" size={24} />
                      <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] opacity-30">Verified Identity Record • REV_11.2</p>
                   </div>
                   <Fingerprint size={32} className="text-slate-100" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAvatarModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden my-auto max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black text-slate-900 uppercase italic">Avatar Terminal</h3>
                 <button onClick={() => setShowAvatarModal(false)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 shadow-sm transition-all"><X size={24} /></button>
              </div>
              <div className="p-10 overflow-y-auto max-h-[50vh]">
                 <div className="grid grid-cols-4 gap-8">
                    {avatars.map((avatar) => (
                      <button key={avatar.id} onClick={() => selectAvatar(avatar.url)} className="group flex flex-col items-center gap-3">
                         <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden shadow-md group-hover:border-indigo-500 group-hover:scale-105 transition-all bg-slate-50">
                            <img src={avatar.url} className="w-full h-full object-cover" alt={avatar.label} />
                         </div>
                         <span className="text-[8px] font-black text-slate-400 uppercase group-hover:text-indigo-600 transition-colors uppercase italic">{avatar.label}</span>
                      </button>
                    ))}
                    <button onClick={() => { setShowAvatarModal(false); fileInputRef.current.click(); }} className="group flex flex-col items-center gap-3">
                       <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-slate-900 hover:text-slate-900 transition-all bg-slate-50 group-hover:scale-105">
                          <Plus size={24} />
                       </div>
                       <span className="text-[8px] font-black text-slate-400 uppercase italic">Upload</span>
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
    </div>
  );
};

export default MyProfile;
