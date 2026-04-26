import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBudgets } from '../../redux/slices/budgetSlice';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  Plus, 
  Search, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Briefcase,
  Layers,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BudgetManagement = () => {
  const dispatch = useDispatch();
  const { budgets, loading } = useSelector((state) => state.budgets);
  const [activeTab, setActiveTab] = useState('Overview');
  const [expenses, setExpenses] = useState([]);
  const [vsActualData, setVsActualData] = useState([]);

  useEffect(() => {
    dispatch(fetchBudgets());
    const loadExtra = async () => {
       const user = JSON.parse(sessionStorage.getItem('user'));
       const resExp = await axios.get('/api/erp/expenses', { headers: { Authorization: `Bearer ${user.token}` } });
       setExpenses(resExp.data);
       const resVa = await axios.get('/api/erp/budgets/vs-actual', { headers: { Authorization: `Bearer ${user.token}` } });
       setVsActualData(resVa.data);
    };
    loadExtra();
  }, [dispatch]);

  const handleApproveExpense = async (id) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
       await axios.put(`/api/erp/expenses/${id}/approve`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
       toast.success('Expenditure Authorized. Budget Synchronization Complete.');
       dispatch(fetchBudgets());
       const resExp = await axios.get('/api/erp/expenses', { headers: { Authorization: `Bearer ${user.token}` } });
       setExpenses(resExp.data);
    } catch (err) { toast.error('Financial Authorization Failure'); }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic">Treasury Oversight</h2>
          <p className="text-slate-500 font-medium tracking-tight">Departmental allocation thresholds, expenditure velocity, and budgetary compliance monitoring.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
             <Plus size={18} /> Initialize Budget
           </button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-slate-100 mb-10 overflow-x-auto scroller-hide">
         {['Overview', 'Utilization Analysis', 'Expenditure Requests'].map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`py-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0 ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
               {tab}
               {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
            </button>
         ))}
      </div>

      {activeTab === 'Overview' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {budgets.map(b => {
               const percentage = Math.min((b.spentAmount / b.allocatedAmount) * 100, 100);
               return (
                 <div key={b._id} className="p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all"><Briefcase size={22} /></div>
                          <div>
                             <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{b.department}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.category} • {b.year}</p>
                          </div>
                       </div>
                       <span className={`px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-tighter ${percentage > 90 ? 'bg-red-50 text-red-600' : ''}`}>{b.status}</span>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-2xl font-black text-slate-900">₹{b.spentAmount.toLocaleString()}<span className="text-xs text-slate-300 font-bold ml-1 italic">/ ₹{b.allocatedAmount.toLocaleString()}</span></p>
                          <p className={`text-[10px] font-black italic ${percentage > 90 ? 'text-red-600' : 'text-primary-600'}`}>{percentage.toFixed(1)}%</p>
                       </div>
                       <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                          <div className={`h-full rounded-full transition-all duration-1000 ${percentage > 90 ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${percentage}%` }}></div>
                       </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-6 border-t border-slate-50">
                       <span className="text-slate-400">Available Depth</span>
                       <span className="text-emerald-500 italic">₹{(b.allocatedAmount - b.spentAmount).toLocaleString()}</span>
                    </div>
                 </div>
               );
            })}
         </div>
      )}

      {activeTab === 'Utilization Analysis' && (
         <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
               <Layers size={18} className="text-primary-600" /> Cross-Departmental Utilization Dynamics
            </h4>
            <div className="h-[500px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vsActualData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f8fafc'}} />
                     <Legend verticalAlign="top" height={36} />
                     <Bar dataKey="allocated" fill="#f1f5f9" radius={[12, 12, 0, 0]} barSize={40} name="Authorized Limit" />
                     <Bar dataKey="spent" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={40} name="Physical Expenditure" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      )}

      {activeTab === 'Expenditure Requests' && (
         <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden">
            <table className="w-full text-left font-bold text-slate-500">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Identity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departmental Hub</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (₹)</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Authorization</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {expenses.map(exp => (
                    <tr key={exp._id} className="hover:bg-slate-50 transition-all group">
                       <td className="px-10 py-8">
                          <p className="font-black text-slate-900 text-xs italic uppercase leading-none">{exp.expenseId}</p>
                          <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mt-2">{exp.category} • {exp.description}</p>
                       </td>
                       <td className="px-10 py-8">
                          <p className="font-black text-slate-700 text-[11px] uppercase italic">{exp.department}</p>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border mx-auto w-fit ${
                            exp.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {exp.status}
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <p className="text-sm font-black text-slate-900 italic">₹{exp.amount.toLocaleString()}</p>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex justify-center gap-4">
                             {exp.status === 'pending' ? (
                               <>
                                 <button onClick={() => handleApproveExpense(exp._id)} className="p-3 bg-white border border-slate-100 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm"><CheckCircle2 size={18} /></button>
                                 <button className="p-3 bg-white border border-slate-100 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"><XCircle size={18} /></button>
                               </>
                             ) : (
                               <div className="p-3 text-slate-200"><FileText size={18} /></div>
                             )}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}
    </div>
  );
};

export default BudgetManagement;
