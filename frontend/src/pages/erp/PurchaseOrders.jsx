import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus, reset } from '../../redux/slices/erpSlice';
import { 
  Plus, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XSquare, 
  MoreVertical, 
  Download,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector((state) => state.erp);

  useEffect(() => {
    dispatch(fetchOrders());
    if (isError) toast.error(message);
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  const handleReceive = (id) => {
    if (window.confirm('Executing high-value stock synchronization. Confirm receipt of all line items?')) {
      dispatch(updateOrderStatus({ id, status: 'Received' }));
      toast.success('Inventory Ledger Synchronized');
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Procurement Lifecycle</h2>
          <p className="text-slate-500 font-medium">Manage corporate acquisition pipelines and vendor fulfillment records.</p>
        </div>
        <Link 
          to="/erp/orders/new" 
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus size={18} /> Initiate Acquisition
        </Link>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Index</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fulfillment partner</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acquisition Value</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors shadow-sm">
                                <Truck size={22} />
                             </div>
                             <div>
                                <p className="font-black text-slate-900 leading-tight uppercase tracking-tight">{order.poNumber}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">{new Date(order.orderDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                             <span className="font-black text-slate-700 uppercase text-xs">{order.vendor?.company || order.vendor?.name || 'Authorized Supplier'}</span>
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-1 ml-4 tracking-tighter">{order.items.length} Line items included</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="font-black text-slate-900 text-lg italic tracking-tighter decoration-primary-200 underline underline-offset-4 decoration-2">
                             ${order.totalAmount.toLocaleString()}
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border w-fit flex items-center gap-1.5 ${getStatusStyle(order.status)}`}>
                             {order.status === 'Received' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                             {order.status}
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                             {order.status === 'Sent' && (
                               <button 
                                 onClick={() => handleReceive(order._id)}
                                 className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all"
                               >
                                  <PackageCheck size={14} /> Synchronize Stock
                               </button>
                             )}
                             <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm">
                                <Download size={18} />
                             </button>
                             <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                                <MoreVertical size={20} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-32 flex flex-col items-center justify-center space-y-4 opacity-30">
                 <AlertCircle size={64} className="text-slate-300" />
                 <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting procurement data sequences.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
