import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  User, 
  Building2, 
  Phone, 
  Briefcase,
  FileUp,
  Grid,
  List,
  Mail,
  ArrowRightCircle,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading } = useSelector((state) => state.customers);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const getIndustryColor = (industry) => {
    switch(industry) {
      case 'IT': return 'bg-blue-50 text-blue-600';
      case 'manufacturing': return 'bg-amber-50 text-amber-600';
      case 'retail': return 'bg-emerald-50 text-emerald-600';
      case 'healthcare': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-slate-900">Our Customer List</h2>
          <p className="text-slate-500 font-medium tracking-tight">View and manage all your clients and their business profiles.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
             <FileUp size={18} /> Import Data
           </button>
           <button 
            onClick={() => navigate('add')}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
           >
             <Plus size={18} /> Add New Customer
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
         <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center flex-wrap gap-6 bg-slate-50/30">
            <div className="flex items-center gap-6">
               <div className="flex items-center bg-white px-5 py-3 rounded-2xl border-2 border-slate-300 shadow-sm w-80 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                  <Search size={16} className="text-slate-400" />
                  <input type="text" placeholder="Search by name, email or company..." className="bg-transparent border-none outline-none ml-4 text-[10px] font-black uppercase tracking-widest w-full text-slate-900" />
               </div>
               <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 shadow-sm hover:text-slate-900 transition-all"><Filter size={18} /></button>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><List size={18} /></button>
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><Grid size={18} /></button>
               </div>
               <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 shadow-sm hover:text-slate-900 transition-all"><Download size={18} /></button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left font-bold text-slate-500">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Spending Score</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {customers.map(cust => (
                    <tr key={cust._id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary-500 overflow-hidden relative group-hover:bg-primary-600 transition-all">
                                {cust.photo ? <img src={cust.photo} className="w-full h-full object-cover" /> : <User size={24} className="group-hover:text-white" />}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                   <p className="font-black text-slate-900 uppercase text-xs italic leading-none">{cust.name}</p>
                                   {cust.isStrategicPartner && (
                                     <span className="bg-amber-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm animate-pulse italic">Partner</span>
                                   )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 tracking-tight uppercase"><Mail size={12} className="text-primary-400" /> {cust.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <p className="font-black text-slate-700 text-xs uppercase italic flex items-center gap-2"><Building2 size={14} className="text-slate-300" /> {cust.company}</p>
                          <p className="text-[10px] font-black text-slate-400 mt-2 tracking-widest uppercase italic">{cust.designation}</p>
                       </td>
                       <td className="px-10 py-8">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mb-2 ${getIndustryColor(cust.industry)}`}>
                             {cust.industry}
                          </div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Type: {cust.customerType}</p>
                       </td>
                       <td className="px-10 py-8">
                          <p className="text-sm font-black text-slate-900 italic tracking-tighter">₹{cust.totalRevenue.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{cust.totalDeals} Finalized Deals</p>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center justify-center gap-4">
                             <Link 
                               to={`${cust._id}`}
                               className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all shadow-sm"
                             >
                                <ArrowRightCircle size={20} />
                             </Link>
                             <button className="p-3 text-slate-300 hover:text-slate-600"><MoreVertical size={20} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {customers.length === 0 && (
           <div className="p-32 text-center opacity-30 flex flex-col items-center justify-center gap-6">
              <Users size={80} strokeWidth={1} />
              <p className="font-black uppercase tracking-[0.4em] text-xs">Stakeholder registry awaiting organizational data induction.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default CustomerList;
