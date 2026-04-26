import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Paperclip, 
  ShoppingBag, 
  Star, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import axios from 'axios';

const VendorProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Details');
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get(`/api/erp/vendors/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setData(res.data);
    };
    loadData();
  }, [id]);

  if (!data) return <div className="p-20 text-center font-black animate-pulse">SYNCHRONIZING SUPPLIER DATA...</div>;

  const { vendor, orders } = data;
  const tabs = ['Details', 'Bank Info', 'Documents', 'Order History'];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center gap-4">
         <Link to="/erp/vendors" className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <ArrowLeft size={20} />
         </Link>
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
               {vendor.name} <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-lg text-[10px] uppercase font-black tracking-widest">{vendor.status}</span>
            </h2>
            <p className="text-slate-500 font-medium">Global identification registry for {vendor.vendorId} ({vendor.category})</p>
         </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
         <div className="px-10 py-2 border-b border-slate-50 bg-slate-50/50">
            <div className="flex gap-10">
               {tabs.map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                 </button>
               ))}
            </div>
         </div>

         <div className="p-12">
            {activeTab === 'Details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Communication Hub</p>
                    <div className="space-y-3 font-bold text-slate-900 text-sm">
                       <p className="flex items-center gap-3"><Mail size={16} className="text-primary-500" /> {vendor.email}</p>
                       <p className="flex items-center gap-3"><Phone size={16} className="text-primary-500" /> {vendor.phone}</p>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Nexus Location</p>
                    <div className="space-y-3 font-bold text-slate-900 text-sm">
                       <p className="flex items-center gap-3"><MapPin size={16} className="text-primary-500" /> {vendor.address}, {vendor.city}</p>
                       <p className="ml-7 text-xs text-slate-400 font-black uppercase">{vendor.state}, {vendor.country}</p>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Tax Identities</p>
                    <div className="space-y-3 font-black text-slate-900 text-xs">
                       <p className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <span>GST NO</span> <span className="text-primary-600">{vendor.gstNumber || 'UNAVAILABLE'}</span>
                       </p>
                       <p className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <span>PAN NO</span> <span className="text-primary-600">{vendor.panNumber || 'UNAVAILABLE'}</span>
                       </p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'Bank Info' && (
               <div className="max-w-xl bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 opacity-20 blur-3xl"></div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 mb-8 italic flex items-center gap-2">
                     <ShieldCheck size={16} /> Secure Treasury Link
                  </h5>
                  <div className="space-y-8 relative z-10">
                     <div>
                        <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Account Holder</p>
                        <p className="text-lg font-black italic uppercase">{vendor.bankDetails?.accountName || vendor.name}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        <div>
                           <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Account Number</p>
                           <p className="text-xs font-black font-mono tracking-widest">{vendor.bankDetails?.accountNo || 'XXXXXXXXXXXX'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Bank / IFSC</p>
                           <p className="text-xs font-black uppercase italic">{vendor.bankDetails?.bankName} ({vendor.bankDetails?.ifsc})</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'Order History' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {orders.map(order => (
                        <div key={order._id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <h6 className="font-black text-slate-900 uppercase italic text-sm">{order.poNumber}</h6>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">{order.status}</span>
                           </div>
                           <div className="space-y-4">
                              <p className="text-xl font-black text-slate-900 italic">₹{order.totalAmount.toLocaleString()}</p>
                              <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary-600">
                                 <span>{order.items.length} Acquisition Items</span>
                                 <Link to={`/erp/purchase-orders/${order._id}`} className="hover:gap-2 flex items-center transition-all">Audit <ChevronRight size={14} /></Link>
                              </div>
                           </div>
                        </div>
                     ))}
                     {orders.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-20 italic font-black uppercase tracking-[0.4em] text-xs">
                           No historical acquisition cycles found for this partner.
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default VendorProfile;
