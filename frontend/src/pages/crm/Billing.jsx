import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  IndianRupee,
  User,
  ArrowRight,
  Briefcase,
  Package,
  Truck,
  Edit2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Billing = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const res = await axios.get('/api/crm/deals', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        // Showing only won deals for billing
        setDeals(res.data.filter(d => d.stage === 'closed-won') || []);
      } catch (err) {
        toast.error('Financial Data Sync Error');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleGenerateInvoice = (dealId) => {
    toast.success('Generating Professional Invoice PDF...');
    // In a real app, this would trigger a backend PDF generation
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic leading-none">Billing & Revenue Matrix</h2>
          <p className="text-slate-500 font-medium tracking-tight">Generate invoices and track payments for successfully closed deals (Step 5).</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
              <Download size={18} /> Export Ledger
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
         <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center flex-wrap gap-6">
            <div className="flex items-center bg-white px-5 py-3 rounded-2xl border-2 border-slate-300 w-full md:w-96 shadow-sm focus-within:border-primary-500 transition-all">
               <Search size={18} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search invoices or deals..." 
                 className="bg-transparent border-none outline-none ml-4 text-[10px] font-black uppercase tracking-widest w-full text-slate-900"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
               <div className="px-5 py-3 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
                  <IndianRupee className="text-primary-600" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 italic">Financial Terminal Active</span>
               </div>
            </div>
         </div>

         <div className="overflow-x-auto flex-1">
            <table className="w-full text-left font-bold text-slate-500">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal / Contract</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Entity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliverables & Status</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Magnitude</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center">
                         <div className="flex flex-col items-center gap-4 opacity-30">
                            <FileText size={64} />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">No 'Won' deals ready for billing</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    deals.map(deal => (
                      <tr key={deal._id} className="hover:bg-slate-50/50 transition-all group">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white"><Briefcase size={18} /></div>
                               <div>
                                  <p className="text-xs font-black text-slate-900 uppercase italic leading-none mb-1">{deal.title}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ref: {deal.dealId || 'N/A'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               <User size={14} className="text-slate-300" />
                               <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{deal.customerId?.name || 'Strategic Partner'}</span>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <div className="space-y-3">
                               {deal.products && deal.products.length > 0 ? (
                                 <div className="space-y-1">
                                    {deal.products.map((p, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                         <Package size={10} className="text-primary-400" />
                                         <span className="text-[10px] font-black text-slate-700 uppercase italic">{p.name}</span>
                                         <span className="text-[9px] font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">x{p.quantity}</span>
                                      </div>
                                    ))}
                                    <div className="flex items-center gap-1.5 text-emerald-600 mt-2">
                                       <Truck size={12} />
                                       <span className="text-[9px] font-black uppercase tracking-widest">Received Complete</span>
                                    </div>
                                 </div>
                               ) : (
                                 <span className="text-[9px] font-black text-slate-300 uppercase italic">Service Engagement</span>
                               )}
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className="text-sm font-black italic text-slate-900">₹{deal.value?.toLocaleString()}</span>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <div className="flex justify-center gap-3">
                               <Link 
                                 to={`/admin/dashboard/crm/deals/add/${deal._id}`}
                                 className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                                 title="Adjust Deal Parameters"
                               >
                                  <Edit2 size={14} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Configure Matrix</span>
                               </Link>
                               <button 
                                 onClick={() => handleGenerateInvoice(deal._id)}
                                 className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2"
                               >
                                  <Plus size={14} /> Generate Bill
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Billing;
