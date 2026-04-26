import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, resethr } from '../../redux/slices/hrSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronRight,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const dispatch = useDispatch();
  const { employees, loading, error } = useSelector((state) => state.hr);

  useEffect(() => {
    dispatch(fetchEmployees());
    if (error) toast.error(error);
  }, [dispatch, error]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'On Leave': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Terminated': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Personnel Directory</h2>
          <p className="text-slate-500 font-medium">Global workforce repository with role-based visibility and lifecycle actions.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
             <Download size={18} /> Export Index
           </button>
           <Link 
            to="/hr/employees/add"
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
           >
             <Plus size={18} /> Onboard Personnel
           </Link>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full md:w-96 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources by name or ID..." 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm font-bold"
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
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Persona</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departmental Unit</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joining Ledger</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {employees.map(emp => (
                   <tr key={emp._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all shadow-sm">
                               {emp.photo ? <img src={emp.photo} alt="" className="w-full h-full object-cover rounded-2xl" /> : <User size={24} />}
                            </div>
                            <div>
                               <p className="font-black text-slate-900 leading-tight uppercase text-xs">{emp.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.employeeId}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="font-black text-slate-700 text-xs uppercase">{emp.department}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{emp.designation}</p>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-xs font-black text-slate-900 italic">{new Date(emp.joiningDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border w-fit ${getStatusColor(emp.status)}`}>
                           {emp.status}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center justify-center gap-4">
                            <Link 
                              to={`/hr/employees/${emp._id}`}
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
              </tbody>
           </table>
           {employees.length === 0 && (
             <div className="p-32 flex flex-col items-center justify-center space-y-4 opacity-30 text-center">
                <User size={64} className="text-slate-300" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">Directory awaiting personnel initialization.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
