import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Package, Send, Box, AlertCircle, 
  Activity, CheckCircle2, Database,
  ArrowRight, ShieldAlert, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MaterialHub = () => {
  const [activeTab, setActiveTab] = useState('use'); 
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: '',
    reason: ''
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/materials');
      setMaterials(res.data.materials || []);
    } catch (err) {
      console.error('Fetch Materials Failed:', err);
      toast.error('Unable to fetch materials list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialId || !formData.quantity || !formData.reason) {
      return toast.error('Please fill in all fields.');
    }

    try {
       setLoading(true);
       if (activeTab === 'use') {
          await api.post('/api/materials/activity/usage', {
             materialId: formData.materialId,
             quantityUsed: Number(formData.quantity),
             purpose: formData.reason
          });
          toast.success('Material consumption logged successfully.');
       } else {
          await api.post('/api/materials/activity/request', {
             materialId: formData.materialId,
             quantityRequested: Number(formData.quantity),
             reason: formData.reason
          });
          toast.success('Material request submitted successfully.');
       }
       setFormData({ materialId: '', quantity: '', reason: '' });
    } catch (err) {
       toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
       setLoading(false);
    }
  };

  if (loading && materials.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium tracking-wide">Loading Material Resources...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header Area */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 md:p-14 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 border border-white/5 group">
         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <span className="px-5 py-2 bg-white/10 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md flex items-center gap-2">
                 <Database size={12} className="animate-pulse" /> RESOURCE STREAM
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tight">Material <span className="text-rose-500 text-6xl">Hub</span></h1>
            <p className="text-slate-400 mt-4 font-bold text-xs max-w-md opacity-80 leading-relaxed">Manage and request inventory resources for site operations directly from the regional baseline.</p>
         </div>

         <div className="relative z-10 flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
               <Package size={28} />
            </div>
            <div className="pr-4">
               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Stock Status</p>
               <p className="text-xl font-black text-white tabular-nums tracking-tighter">LIVE ACCESS</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Mode Selection & Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-rose-100 rounded-[3rem] p-4 shadow-xl shadow-rose-200/5">
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('use')}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 ${
                  activeTab === 'use' 
                  ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/30 -translate-y-1' 
                  : 'hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'use' ? 'bg-white/20' : 'bg-rose-50 text-rose-500'}`}>
                    <Package size={28} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg uppercase italic tracking-tight leading-none mb-1">Direct</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'use' ? 'text-white opacity-60' : 'text-slate-400'}`}>Consumption</p>
                  </div>
                </div>
                {activeTab === 'use' && <CheckCircle2 size={24} className="animate-enter" />}
              </button>

              <button
                onClick={() => setActiveTab('request')}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 ${
                  activeTab === 'request' 
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30 -translate-y-1' 
                  : 'hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'request' ? 'bg-white/20' : 'bg-slate-900 text-rose-500'}`}>
                    <Send size={28} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg uppercase italic tracking-tight leading-none mb-1">Requisition</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'request' ? 'text-white opacity-60' : 'text-slate-400'}`}>Request Mode</p>
                  </div>
                </div>
                {activeTab === 'request' && <CheckCircle2 size={24} className="animate-enter text-rose-500" />}
              </button>
            </div>
          </div>

          {/* Protocol Note Card */}
          <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 mb-6 border border-rose-500/30 shadow-lg">
                 <ShieldAlert size={24} />
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase italic">Protocol Note</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed opacity-70">
                Direct consumption is for small, immediate tool or material needs. For bulk or high-value items, use <span className="text-rose-500">Requisition Access</span> to trigger authorization workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Execution Form */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-rose-100 rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative group/form overflow-hidden transition-all duration-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF9F9] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover/form:scale-110"></div>
            
            <div className="relative z-10 mb-12">
              <h2 className="text-3xl font-black text-slate-900 italic uppercase">
                {activeTab === 'use' ? 'Submit Consumption' : 'Material Request'}
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-rose-500 pl-4">Provide parameters for inventory synchronization</p>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity Selection</label>
                  <div className="relative group/select">
                    <select 
                      value={formData.materialId}
                      onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="">-- Choose Material --</option>
                      {materials.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.quantity} available)</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/select:text-rose-500 transition-colors">
                       <Database size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantity Vector</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white transition-all outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission Purpose</label>
                <textarea 
                  rows="4"
                  placeholder="Define operational justification..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xl ${
                    activeTab === 'use' 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {activeTab === 'use' ? 'Log Consumption' : 'Submit Authorization'}
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialHub;
