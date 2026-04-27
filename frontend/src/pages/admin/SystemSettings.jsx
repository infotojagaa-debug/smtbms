import { useEffect, useState } from 'react';
import { 
  Building2, 
  Mail, 
  Clock, 
  Calendar, 
  DollarSign, 
  Bell, 
  Save, 
  ShieldCheck, 
  Upload, 
  Globe, 
  Zap,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('Company');
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await api.get('/api/settings', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSettings(res.data);
    } catch (err) {
      toast.error('Settings Retrieval Failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await api.put('/api/settings', settings, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('System Directives Updated.');
      loadSettings();
    } catch (err) {
      toast.error('Protocol Update Failure');
    }
  };

  const handleTestEmail = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await api.post('/api/settings/test-email', settings.emailSettings, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('SMTP Connectivity Verified.');
    } catch (err) {
      toast.error('SMTP Connection Refused');
    }
  };

  if (loading || !settings) return <div className="p-20 text-center font-medium animate-pulse text-slate-500 text-sm">Decoding System Directives...</div>;

  const tabs = [
    { id: 'Company', icon: Building2 },
    { id: 'Email', icon: Mail },
    { id: 'Working Hours', icon: Clock },
    { id: 'Holidays', icon: Calendar },
    { id: 'Leave Policy', icon: Zap },
    { id: 'Payroll', icon: DollarSign },
    { id: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-end text-slate-900 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Global Organizational Config</h2>
          <p className="text-slate-500 text-sm">Enterprise-level directives for organizational flow, fiscal policies, and communication protocols.</p>
        </div>
        <button 
          onClick={handleUpdate}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Save size={18} /> Deploy Directives
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar border-b border-slate-200">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <tab.icon size={16} /> {tab.id} Matrix
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
         
         {activeTab === 'Company' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Corporate Identity</label>
                    <input 
                      className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Engagement Node Email</label>
                    <input 
                      className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                    />
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="px-6 py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 hover:border-indigo-400 transition-all">
                    <div className="p-4 bg-white rounded-lg text-slate-400 shadow-sm">
                       <Upload size={32} />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">Deploy Global Identity (Logo)</p>
                 </div>
                 <div grid-cols-1 sm:grid-cols-2>
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-700 block">Fiscal Artifact Currency</label>
                       <select className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-700 block">Temporal Date Sequence</label>
                       <select className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.dateFormat} onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                       </select>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'Email' && (
           <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300 max-w-2xl">
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-4">
                    <ShieldCheck size={24} className="text-emerald-600" />
                    <div>
                       <p className="text-sm font-bold text-emerald-900">STMP Protocol Synchronization</p>
                       <p className="text-xs font-medium text-emerald-700 mt-0.5">Ensure corporate dispatch node is verified for system alerts.</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleTestEmail}
                  className="px-6 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-colors shadow-sm"
                 >
                    Validate Node
                 </button>
              </div>
              <div grid-cols-1 sm:grid-cols-2>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">SMTP Host Registry</label>
                    <input className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.emailSettings?.host} onChange={(e) => setSettings({...settings, emailSettings: {...settings.emailSettings, host: e.target.value}})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Communications Port</label>
                    <input className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.emailSettings?.port} onChange={(e) => setSettings({...settings, emailSettings: {...settings.emailSettings, port: e.target.value}})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Authorized Custodian (User)</label>
                    <input className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.emailSettings?.user} onChange={(e) => setSettings({...settings, emailSettings: {...settings.emailSettings, user: e.target.value}})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Security Sequence (Pass)</label>
                    <input type="password" className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.emailSettings?.pass} onChange={(e) => setSettings({...settings, emailSettings: {...settings.emailSettings, pass: e.target.value}})} />
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'Working Hours' && (
           <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <h5 className="text-sm font-bold text-slate-900 border-l-4 border-amber-500 pl-3">Operational Temporal Node</h5>
                    <div className="flex items-center gap-6">
                       <div className="flex-1 space-y-2">
                          <label className="text-sm font-semibold text-slate-700 block">Genesis Hour</label>
                          <input type="time" className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.workingHours?.start} onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, start: e.target.value}})} />
                       </div>
                       <div className="flex-1 space-y-2">
                          <label className="text-sm font-semibold text-slate-700 block">Extraction Hour</label>
                          <input type="time" className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={settings.workingHours?.end} onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, end: e.target.value}})} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                     <h5 className="text-sm font-bold text-slate-900 border-l-4 border-amber-500 pl-3">Active Operational Cycles</h5>
                     <div className="flex flex-wrap gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                           <button 
                            key={day}
                            onClick={() => {
                               const days = settings.workingDays.includes(day) 
                                 ? settings.workingDays.filter(d => d !== day)
                                 : [...settings.workingDays, day];
                               setSettings({...settings, workingDays: days});
                            }}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                               settings.workingDays.includes(day) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                           >
                              {day}
                           </button>
                        ))}
                     </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'Holidays' && (
           <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                 <h5 className="text-sm font-bold text-slate-900">Temporal Rest Registry (Global Holidays)</h5>
                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                    <Plus size={16} /> Initialize Sequence
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {settings.holidays?.map((h, i) => (
                    <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-300 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600"><Calendar size={18} /></div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{h.name}</p>
                             <p className="text-xs font-semibold text-slate-500 mt-0.5">{new Date(h.date).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <button className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                 ))}
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default SystemSettings;
