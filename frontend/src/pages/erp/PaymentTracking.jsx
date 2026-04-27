import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../../redux/slices/paymentSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  History,
  AlertCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentTracking = () => {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);
  const [activeTab, setActiveTab] = useState('All');
  const [summary, setSummary] = useState({ incoming: 0, outgoing: 0, outstanding: 0 });

  useEffect(() => {
    dispatch(fetchPayments());
    const loadSummary = async () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get('/api/erp/payments/summary', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = res.data;
      setSummary({
        incoming: data.find(d => d._id === 'incoming')?.total || 0,
        outgoing: data.find(d => d._id === 'outgoing')?.total || 0,
        outstanding: 450000 // Mock for demo
      });
    };
    loadSummary();
  }, [dispatch]);

  const stats = [
    { label: 'Total Inflow', value: `₹${summary.incoming.toLocaleString()}`, icon: ArrowDownLeft, color: 'emerald' },
    { label: 'Total Outflow', value: `₹${summary.outgoing.toLocaleString()}`, icon: ArrowUpRight, color: 'red' },
    { label: 'Net Cash Flow', value: `₹${(summary.incoming - summary.outgoing).toLocaleString()}`, icon: Activity, color: 'blue' },
    { label: 'Outstanding Debt', value: `₹${summary.outstanding.toLocaleString()}`, icon: AlertCircle, color: 'amber' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic">Cash Liquidity Monitor</h2>
          <p className="text-slate-500 font-medium">Real-time tracking of organizational cash inflow, outflow, and automated settlement auditing.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
             <Plus size={18} /> Record Transaction
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-3xl`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
         <div className="px-10 py-2 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="flex gap-10">
               {['All', 'Incoming', 'Outgoing'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab} Cycles
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                 </button>
               ))}
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:gap-3 transition-all">
               Export Ledger <Download size={14} />
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left font-bold text-slate-500">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement (₹)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {payments.filter(p => activeTab === 'All' || p.paymentType === activeTab.toLowerCase()).map(pay => (
                    <tr key={pay._id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pay.paymentType === 'incoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} transition-all`}>
                                {pay.paymentType === 'incoming' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 uppercase text-xs leading-none">{pay.paymentNumber}</p>
                                <p className="text-[9px] uppercase font-black text-slate-300 tracking-widest mt-1 italic">{new Date(pay.paymentDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="font-black text-slate-700 text-xs uppercase italic truncate max-w-[150px]">{pay.vendorId?.name || pay.customerId?.name || 'Authorized Entity'}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-1 italic">Ref: {pay.referenceNumber || 'DIRECT-TRANS'}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                             <CreditCard size={14} className="text-primary-400" /> {pay.paymentMethod}
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest w-fit flex items-center gap-1.5">
                             <CheckCircle2 size={12} /> {pay.status}
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <p className={`text-sm font-black italic ${pay.paymentType === 'incoming' ? 'text-emerald-600' : 'text-slate-900'}`}>
                             {pay.paymentType === 'incoming' ? '+' : '-'}₹{pay.amount.toLocaleString()}
                          </p>
                       </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                       <td colSpan="5" className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-4">
                          <History size={64} className="mx-auto" strokeWidth={1} />
                          <p className="font-black uppercase tracking-[0.3em] text-xs">Liquidity monitor awaiting transactional sequence.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default PaymentTracking;
