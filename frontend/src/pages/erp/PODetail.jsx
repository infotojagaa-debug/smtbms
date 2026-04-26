import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  FileText, 
  Printer, 
  Clock, 
  MapPin, 
  User,
  Package,
  Check
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [grnItems, setGrnItems] = useState([]);

  const loadPO = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get(`/api/erp/po/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setPo(res.data);
    setGrnItems(res.data.items.map(i => ({
      materialId: i.materialId._id || i.materialId,
      itemName: i.itemName,
      orderedQty: i.quantity,
      receivedQty: i.quantity,
      rejectedQty: 0,
      rejectionReason: '',
      unit: i.unit
    })));
  };

  useEffect(() => { loadPO(); }, [id]);

  const handleApprove = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.put(`/api/erp/po/${id}/approve`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Acquisition Authorized. Notification dispatched to vendor.');
      loadPO();
    } catch (err) { toast.error('Approval Protocol Failure'); }
  };

  const handleReceive = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.post(`/api/erp/po/${id}/receive`, { items: grnItems, remarks: 'Standard fulfillment receipt' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Inventory Synchronized. Goods Receipt Logged.');
      setShowGRNModal(false);
      loadPO();
    } catch (err) { toast.error('Stock Update Failure'); }
  };

  if (!po) return <div className="p-20 text-center font-black animate-pulse uppercase">Auditing Acquisition Path...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center text-slate-900">
        <div className="flex items-center gap-6">
           <Link to="/erp/purchase-orders" className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={22} />
           </Link>
           <div>
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-4 italic uppercase">
                 {po.poNumber} <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[10px] uppercase font-black">{po.status}</span>
              </h2>
              <p className="text-slate-500 font-medium">Acquisition cycle initialized on {new Date(po.createdAt).toLocaleDateString()}</p>
           </div>
        </div>
        <div className="flex gap-4">
           {po.status === 'draft' && (
             <button 
              onClick={handleApprove}
              className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all active:scale-95"
             >
               <CheckCircle2 size={18} /> Authorize Order
             </button>
           )}
           {po.status === 'sent' && (
             <button 
              onClick={() => setShowGRNModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95"
             >
               <Truck size={18} /> Confirm Receipt
             </button>
           )}
           <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-3xl hover:text-slate-900 transition-all shadow-sm">
             <Printer size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Supplier Profile</h4>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-500"><User size={24} /></div>
                        <div>
                           <p className="font-black text-slate-900 uppercase italic leading-none">{po.vendorId?.name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Partner ID: {po.vendorId?.vendorId}</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4 text-right">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Logistics Hub</h4>
                     <p className="text-xs font-black text-slate-900 flex items-center justify-end gap-2"><MapPin size={14} className="text-primary-400" /> {po.deliveryAddress || 'Central Storage Depot 1'}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Exp. Delivery: {new Date(po.expectedDeliveryDate).toLocaleDateString()}</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic flex items-center gap-2">
                     <Package size={16} className="text-primary-500" /> Acquisition Registry
                  </h4>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-slate-50">
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resource Name</th>
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Unit</th>
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                              <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Yield (₹)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {po.items.map((item, idx) => (
                             <tr key={idx} className="group">
                                <td className="py-6 font-black text-slate-900 text-xs italic uppercase">{item.itemName}</td>
                                <td className="py-6 text-center text-xs font-bold text-slate-400 uppercase">{item.unit}</td>
                                <td className="py-6 text-center text-xs font-black text-slate-900 uppercase">x{item.quantity}</td>
                                <td className="py-6 text-right font-black text-slate-900 italic text-xs">₹{item.totalPrice.toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-20 blur-3xl"></div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 relative z-10 italic">Fiscal Resolution</h4>
               
               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center font-black uppercase tracking-widest text-[10px] text-white/40">
                     <span>Subtotal Yield</span>
                     <span className="text-white italic">₹{po.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-black uppercase tracking-widest text-[10px] text-white/40">
                     <span>Statutory Tax ({po.taxPercentage}%)</span>
                     <span className="text-red-400">₹{po.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-black uppercase tracking-widest text-[10px] text-white/40">
                     <span>Shipping Protocol</span>
                     <span className="text-white italic">₹{po.shippingCharges.toLocaleString()}</span>
                  </div>
                  <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] leading-none mb-2">Authenticated Total</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-white">₹{po.totalAmount.toLocaleString()}</h3>
                     </div>
                     <ShoppingBag size={40} className="text-primary-600 opacity-30" />
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> Cycle Timeline</h4>
               <div className="space-y-8 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                  <div className="relative pl-10">
                     <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 bg-primary-500 rounded-full border-4 border-white shadow-sm"></div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Sequence Initialized</p>
                     <p className="text-[9px] font-bold text-slate-400">{new Date(po.createdAt).toLocaleDateString()}</p>
                  </div>
                  {po.status !== 'draft' && (
                    <div className="relative pl-10">
                       <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Partner Dispatched</p>
                       <p className="text-[9px] font-bold text-slate-400">{new Date(po.approvedOn || po.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {showGRNModal && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-500 relative">
              <button onClick={() => setShowGRNModal(false)} className="absolute top-10 right-10 p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all"><XCircle size={24} /></button>
              
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                    <Truck size={32} className="text-primary-600" /> Verify Goods Receipt (GRN)
                 </h3>
                 <p className="text-slate-500 font-medium">Synchronize physical cargo quantities with organizational inventory levels.</p>
              </div>

              <div className="overflow-x-auto max-h-[400px]">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-slate-50">
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ordered</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Received</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Rejected</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rejection Rationale</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {grnItems.map((item, idx) => (
                         <tr key={idx}>
                            <td className="py-6 font-black text-slate-900 text-xs italic uppercase">{item.itemName}</td>
                            <td className="py-6 text-center text-xs font-black text-slate-400">x{item.orderedQty}</td>
                            <td className="py-6 px-4">
                               <input 
                                  type="number" 
                                  className="w-20 bg-slate-50 border-none rounded-xl p-3 text-xs font-black text-center mx-auto block"
                                  value={item.receivedQty}
                                  onChange={(e) => {
                                     const newItems = [...grnItems];
                                     newItems[idx].receivedQty = Number(e.target.value);
                                     setGrnItems(newItems);
                                  }}
                               />
                            </td>
                            <td className="py-6 px-4">
                               <input 
                                  type="number" 
                                  className="w-20 bg-slate-50 border-none rounded-xl p-3 text-xs font-black text-center mx-auto block"
                                  value={item.rejectedQty}
                                  onChange={(e) => {
                                     const newItems = [...grnItems];
                                     newItems[idx].rejectedQty = Number(e.target.value);
                                     setGrnItems(newItems);
                                  }}
                               />
                            </td>
                            <td className="py-6">
                               <input 
                                  type="text" 
                                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold"
                                  placeholder="e.g. Damascus Variance"
                                  onChange={(e) => {
                                     const newItems = [...grnItems];
                                     newItems[idx].rejectionReason = e.target.value;
                                     setGrnItems(newItems);
                                  }}
                               />
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
                 <button onClick={() => setShowGRNModal(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-[10px]">Abort Sync</button>
                 <button 
                  onClick={handleReceive}
                  className="px-10 py-5 bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                 >
                    Establish Inventory Sync <Check size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PODetail;
