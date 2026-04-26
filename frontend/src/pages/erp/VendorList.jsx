import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Star,
  ShieldCheck,
  Building2,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const VendorList = () => {
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'blacklisted': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">Our Suppliers List</h2>
          <p className="text-slate-500 font-medium">Manage all your material suppliers and partners in one place.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
             <Download size={18} /> Download List
           </button>
           <Link 
            to="add"
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
           >
             <Plus size={18} /> Add New Supplier
           </Link>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full md:w-96 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search partners by ID or Identity..." 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm font-bold placeholder:text-slate-300"
              />
           </div>
           
           <div className="flex gap-3">
              <select className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500">
                 <option>All Categories</option>
                 <option>Raw Material</option>
                 <option>Services</option>
              </select>
              <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm"><Filter size={18} /></button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left font-bold text-slate-500">
              <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Rating</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {vendors.map(vendor => (
                   <tr key={vendor._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all shadow-sm">
                               <Building2 size={24} />
                            </div>
                            <div>
                               <p className="font-black text-slate-900 leading-tight uppercase text-xs">{vendor.name}</p>
                               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{vendor.vendorId}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="font-black text-slate-700 text-xs uppercase tracking-tight">{vendor.category}</p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mt-1 italic">₹{vendor.totalAmount.toLocaleString()} Lifetime Val</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < vendor.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                            <span className="text-[10px] font-black text-slate-400 ml-2 italic">{vendor.rating}.0</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border w-fit ${getStatusColor(vendor.status)}`}>
                           {vendor.status}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center justify-center gap-4">
                            <Link 
                              to={`${vendor._id}`}
                              className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all shadow-sm"
                            >
                               <Eye size={18} />
                            </Link>
                            <button className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all shadow-sm">
                               <Edit size={18} />
                            </button>
                            <button className="p-3 text-slate-300 hover:text-slate-600">
                               <MoreVertical size={20} />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
                 {vendors.length === 0 && (
                   <tr>
                      <td colSpan="5" className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-4">
                         <Building2 size={64} className="mx-auto" />
                         <p className="font-black uppercase tracking-[0.3em] text-xs">Supplier ecosystem awaiting initialization.</p>
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

export default VendorList;
