import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPOs } from '../../redux/slices/purchaseOrderSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PurchaseOrderList = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.purchaseOrders);

  useEffect(() => {
    dispatch(fetchPOs());
  }, [dispatch]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'sent': return 'bg-primary-50 text-primary-600 border-primary-100';
      case 'partial-received': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">Order History</h2>
          <p className="text-slate-500 font-medium">Manage and track all your purchase orders and supplier deliveries.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
             <Download size={18} /> Export POs
           </button>
           <Link 
            to="create"
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
           >
             <Plus size={18} /> Create New Order
           </Link>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full md:w-96 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Order ID or Supplier..." 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm font-bold"
              />
           </div>
           
           <div className="flex gap-3">
              <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm"><Filter size={18} /></button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left font-bold text-slate-500">
              <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Arrival Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {orders.map(order => (
                   <tr key={order._id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                               <ShoppingBag size={18} />
                            </div>
                            <p className="font-black text-slate-900 uppercase text-xs">{order.poNumber}</p>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="font-black text-slate-700 text-xs uppercase italic">{order.vendorId?.name}</p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mt-1">ID: {order.vendorId?.vendorId}</p>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-xs font-black text-slate-900 italic">₹{order.totalAmount.toLocaleString()}</p>
                         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{order.items.length} Acquisition Units</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 italic">
                            <Clock size={12} className="text-amber-500" />
                            {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${getStatusStyle(order.status)}`}>
                           {order.status}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center justify-center gap-4">
                            <Link 
                              to={`${order._id}`}
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
                 {orders.length === 0 && (
                   <tr>
                      <td colSpan="6" className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-4">
                         <Truck size={64} className="mx-auto" strokeWidth={1} />
                         <p className="font-black uppercase tracking-[0.3em] text-xs">Acquisition ledger awaiting cycle initialization.</p>
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

export default PurchaseOrderList;
