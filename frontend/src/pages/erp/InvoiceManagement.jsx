import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../../redux/slices/invoiceSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  FileText, 
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const InvoiceManagement = () => {
  const dispatch = useDispatch();
  const { invoices, loading, error } = useSelector((state) => state.invoices);
  const [activeTab, setActiveTab] = useState('purchase');

  useEffect(() => {
    dispatch(fetchInvoices({ type: activeTab }));
  }, [dispatch, activeTab]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'sent': return 'bg-primary-50 text-primary-600 border-primary-100';
      case 'partial': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'overdue': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase italic">Fiscal Ledger</h2>
          <p className="text-slate-500 font-medium">Consolidated management of acquisition and sales invoices with automated settlement tracking.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
             <Download size={18} /> Export index
           </button>
           <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
             <Plus size={18} /> Initialize Invoice
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
         <div className="px-10 py-2 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="flex gap-10">
               {['purchase', 'sale'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab} Acquisitions
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-white px-5 py-2 rounded-2xl border border-slate-200 shadow-sm">
                  <Search size={14} className="text-slate-400" />
                  <input type="text" placeholder="Locate Invoice..." className="bg-transparent border-none outline-none ml-2 text-[10px] font-black uppercase tracking-widest w-40" />
               </div>
               <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm"><Filter size={16} /></button>
            </div>
         </div>

         <div className="overflow-x-auto overflow-y-auto">
            <table className="w-full text-left font-bold text-slate-500">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Registry</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Settlement Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield (₹)</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv._id} className="hover:bg-slate-50 transition-all group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'purchase' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'} transition-all`}>
                                {activeTab === 'purchase' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 uppercase text-xs leading-none">{inv.invoiceNumber}</p>
                                <p className="text-[9px] uppercase font-black text-slate-300 tracking-tighter mt-1 italic">Issued {new Date(inv.issueDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="font-black text-slate-700 text-xs uppercase italic truncate max-w-[150px]">{inv.vendorId?.name || inv.customerId?.name || 'Anonymous'}</p>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">{inv.vendorId?.vendorId || 'CUST-ID'}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit mx-auto ${getStatusStyle(inv.status)}`}>
                             {inv.status}
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <p className="text-sm font-black text-slate-900 italic">₹{inv.totalAmount.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Pending: ₹{(inv.totalAmount - inv.paidAmount).toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-4">
                             <Link 
                               to={`/erp/invoices/${inv._id}`}
                               className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all shadow-sm"
                             >
                                <Eye size={18} />
                             </Link>
                             <button className="p-3 text-slate-300 hover:text-slate-600">
                                <MoreVertical size={20} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                       <td colSpan="5" className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-4">
                          <FileText size={64} className="mx-auto" strokeWidth={1} />
                          <p className="font-black uppercase tracking-[0.3em] text-xs">Fiscal registry awaiting document initialization.</p>
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

const Eye = ({ size }) => <FileText size={size} />; 
export default InvoiceManagement;
