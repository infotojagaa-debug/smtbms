import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, convertLead, reset } from '../../redux/slices/crmSlice';
import { 
  Plus, 
  Search, 
  Target, 
  Zap, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2,
  Filter,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadManagement = () => {
  const dispatch = useDispatch();
  const { leads, isLoading, isError, message } = useSelector((state) => state.crm);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchLeads());
    if (isError) toast.error(message);
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  const handleConvert = (id) => {
    if (window.confirm('Executing Lead-to-Customer conversion protocol. This will initialize a new deal in the pipeline. Confirm?')) {
      dispatch(convertLead(id));
      toast.success('Lead Qualified: Corporate Record Initialized');
      setTimeout(() => dispatch(fetchLeads()), 1000); // Refresh list
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Lead Capture Terminal</h2>
          <p className="text-slate-500 font-medium">Manage top-of-funnel acquisition sequences and conversion protocols.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95">
          <Plus size={18} /> Register Lead
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center bg-white px-5 py-3 rounded-2xl border-2 border-slate-300 w-full md:w-96 shadow-sm focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Find leads..." 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm font-bold text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-3">
              <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm"><Filter size={18} /></button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prospect Persona</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Scope</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredLeads.map(lead => (
                   <tr key={lead._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all shadow-sm">
                               <Building2 size={24} />
                            </div>
                            <div>
                               <p className="font-black text-slate-900 leading-tight uppercase text-xs">{lead.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{lead.company || 'Enterprise'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="space-y-1">
                            <div className="flex items-center gap-3 text-slate-500">
                               <Mail size={14} className="text-slate-300" />
                               <span className="text-xs font-bold">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                               <Phone size={14} className="text-slate-300" />
                               <span className="text-xs font-bold">{lead.phone || 'No Data'}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border w-fit ${
                           lead.status === 'Qualified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                         }`}>
                           {lead.status}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center justify-center gap-3">
                            {lead.status !== 'Qualified' ? (
                              <button 
                                onClick={() => handleConvert(lead._id)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-primary-600 transition-all active:scale-95"
                              >
                                 <Zap size={14} className="text-primary-400" /> Qualify Lead
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 font-black uppercase text-[10px] tracking-widest rounded-xl border border-emerald-100">
                                 Portfolio Active
                              </div>
                            )}
                            <button className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-slate-600 rounded-xl transition-all shadow-sm">
                               <MoreVertical size={18} />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {filteredLeads.length === 0 && (
             <div className="p-32 flex flex-col items-center justify-center space-y-4 opacity-30">
                <Target size={64} className="text-slate-300" />
                <p className="font-black uppercase tracking-[0.3em] text-xs text-center">Awaiting prospect identification sequences.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default LeadManagement;
