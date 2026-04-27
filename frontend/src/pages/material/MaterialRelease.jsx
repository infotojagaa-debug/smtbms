import { useState, useEffect } from 'react';
import { 
  Package, 
  Send, 
  User, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  History,
  AlertCircle,
  CheckCircle2,
  Truck
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MaterialRelease = () => {
  const [materials, setMaterials] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    dealId: '',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const [matRes, dealRes] = await Promise.all([
          axios.get('/api/materials', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/crm/deals', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setMaterials(matRes.data.materials || []);
        // Only show active deals for material release
        setDeals(dealRes.data.filter(d => d.stage !== 'closed-lost') || []);
      } catch (err) {
        toast.error('Data Synchronization Failure');
      }
    };
    fetchData();
  }, []);

  const handleRelease = async (e) => {
    e.preventDefault();
    if (!formData.materialId || !formData.dealId || !formData.quantity) {
      return toast.error('Incomplete Parameters: Please fill all fields.');
    }

    const selectedMat = materials.find(m => m._id === formData.materialId);
    if (selectedMat && selectedMat.quantity < formData.quantity) {
      return toast.error('Insufficient Stock Magnitude in Nexus Inventory');
    }

    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const selectedDeal = deals.find(d => d._id === formData.dealId);
      
      await axios.post('/api/materials/dispatch', {
        ...formData,
        customerId: selectedDeal?.customerId?._id || selectedDeal?.customerId
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success('Material Dispatched: Inventory Matrix Updated');
      setFormData({ materialId: '', dealId: '', quantity: '', reason: '' });
      // Refresh materials
      const matRes = await axios.get('/api/materials', { headers: { Authorization: `Bearer ${user.token}` } });
      setMaterials(matRes.data.materials || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dispatch Protocol Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic leading-none">Material Release Note</h2>
          <p className="text-slate-500 font-medium tracking-tight">Authorize and dispatch materials to client sites (Step 4 Workflow).</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <div className="px-6 py-3 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
              <ShieldCheck className="text-primary-600" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 italic">Inventory Authorization Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-5 blur-3xl"></div>
             <div className="p-16 space-y-10 relative z-10 text-slate-900">
                <form onSubmit={handleRelease} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Select Strategic Deal / Client</label>
                         <select 
                           className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                           onChange={(e) => setFormData({...formData, dealId: e.target.value})}
                           value={formData.dealId}
                         >
                            <option value="">Select Project/Deal...</option>
                            {deals.map(d => (
                              <option key={d._id} value={d._id}>{d.title} ({d.customerId?.name || 'Partner'})</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Material to Dispatch</label>
                         <select 
                           className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                           onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                           value={formData.materialId}
                         >
                            <option value="">Select Material...</option>
                            {materials.map(m => (
                              <option key={m._id} value={m._id}>{m.name} (Available: {m.quantity} {m.unit})</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Dispatch Quantity</label>
                         <input 
                           type="number"
                           className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                           placeholder="e.g. 50"
                           onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                           value={formData.quantity}
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Dispatch Reason / Ref</label>
                         <input 
                           type="text"
                           className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                           placeholder="e.g. Site Request #102"
                           onChange={(e) => setFormData({...formData, reason: e.target.value})}
                           value={formData.reason}
                         />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
                   >
                      {loading ? 'Processing Authorization...' : (
                        <>
                          Execute Material Release <Truck size={20} className="group-hover:translate-x-2 transition-all" />
                        </>
                      )}
                   </button>
                </form>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 opacity-20 blur-3xl"></div>
              <Package size={32} className="text-primary-400 mb-6" />
              <h4 className="text-xl font-black italic tracking-tighter mb-2">Live Inventory Nexus</h4>
              <p className="text-white/50 text-[11px] leading-relaxed font-medium uppercase tracking-tight">Dispatching materials will automatically deduct quantities from the global ledger.</p>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><AlertCircle size={20} /></div>
                 <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900">Critical Checkpoints</h4>
              </div>
              <ul className="space-y-4">
                 <li className="flex gap-4 items-start">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-normal">Verify site engineer's Internal Resource Request before dispatch.</p>
                 </li>
                 <li className="flex gap-4 items-start">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-normal">Ensure target deal is in 'Qualified' or 'Proposal' stage.</p>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialRelease;
