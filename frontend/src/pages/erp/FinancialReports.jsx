import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  Calendar,
  IndianRupee,
  Filter,
  Users,
  Briefcase
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const FinancialReports = () => {
  const [data, setData] = useState({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
  const [expSummary, setExpSummary] = useState([]);
  const [deptSummary, setDeptSummary] = useState([]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const headers = { Authorization: `Bearer ${user.token}` };
        const resSum = await axios.get('/api/erp/budgets/summary', { headers });
        setData(resSum.data || { totalRevenue: 0, totalExpenses: 0, profit: 0 });
        const resExpS = await axios.get('/api/erp/expenses/summary', { headers });
        setExpSummary(resExpS.data || []);
        const resDeptS = await axios.get('/api/erp/budgets/vs-actual', { headers });
        setDeptSummary(resDeptS.data || []);
      } catch (error) {
        console.error('Fiscal Data Retrieval Failure:', error);
      }
    };
    loadReport();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial_Report");
    XLSX.writeFile(wb, "Gravity_Financial_Report_2024.xlsx");
  };

  return (
    <div className="space-y-12 pb-20 pt-4">
      <div className="flex justify-between items-end bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 opacity-20 blur-[100px]"></div>
         <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Money Dashboard</h2>
            <p className="text-white/50 font-medium tracking-tight">See your total sales income, expenses, and profits in one clear view.</p>
         </div>
         <div className="relative z-10 flex gap-4">
            <button onClick={exportExcel} className="p-5 bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 transition-all backdrop-blur-md">
               <Download size={22} className="text-primary-400" />
            </button>
            <button className="flex items-center gap-3 px-8 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-primary-700 transition-all active:scale-95">
               <FileText size={18} /> Export Full Audit (PDF)
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-4 group hover:-translate-y-2 transition-all">
            <div className="flex justify-between items-start">
               <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">+12.5% Growth</span>
            </div>
            <div>
               <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Total Sales Income</p>
               <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">₹{(data.totalRevenue || 0).toLocaleString()}</h3>
            </div>
         </div>
         <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-4 group hover:-translate-y-2 transition-all text-slate-900">
            <div className="flex justify-between items-start">
               <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><TrendingDown size={24} /></div>
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">-4.2% Control</span>
            </div>
            <div>
               <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Total Money Spent</p>
               <h3 className="text-4xl font-black italic tracking-tighter">₹{(data.totalExpenses || 0).toLocaleString()}</h3>
            </div>
         </div>
         <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-white space-y-4 group hover:-translate-y-2 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl"></div>
            <div className="flex justify-between items-start relative z-10">
               <div className="p-4 bg-white/5 text-emerald-400 rounded-2xl border border-white/10"><IndianRupee size={24} /></div>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Net Performance</span>
            </div>
            <div className="relative z-10">
               <p className="text-[11px] font-black uppercase text-white/40 tracking-widest leading-none mb-2">Total Net Profit</p>
               <h3 className="text-4xl font-black italic tracking-tighter text-emerald-400">₹{(data.profit || 0).toLocaleString()}</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
               <PieChartIcon size={18} className="text-primary-600" /> Categorical Spending Distribution
            </h4>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart shadow-xl>
                     <Pie 
                        data={expSummary} 
                        dataKey="amount" 
                        nameKey="_id" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        innerRadius={60} 
                        stroke="none"
                        paddingAngle={10}
                     >
                        {expSummary.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
               <BarChartIcon size={18} className="text-primary-600" /> Departmental Fiscal Utilization
            </h4>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptSummary} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} width={100} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="spent" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
      
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
         <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic text-slate-900">
               <Users size={18} className="text-primary-600" /> Strategic Partner Exposure
            </h4>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:gap-3 flex items-center transition-all">Audit Partners <TrendingUp size={14} className="ml-2" /></button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-xs text-primary-600 shadow-sm transition-all group-hover:bg-primary-600 group-hover:text-white">V{i}</div>
                 <div>
                    <p className="text-[11px] font-black uppercase text-slate-900 italic">Advanced Logistics Sol.</p>
                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-tighter">₹45,00,000 Portfolio</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default FinancialReports;
