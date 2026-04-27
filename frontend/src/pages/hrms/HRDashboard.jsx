import { useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  BarChart as BarChartIcon, 
  Gift, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const HRDashboard = () => {
  const stats = [
    { label: 'Total Employees', value: '450', icon: Users, color: 'blue' },
    { label: 'Present Today', value: '412', icon: UserCheck, color: 'green' },
    { label: 'On Leave Today', value: '18', icon: Clock, color: 'amber' },
    { label: 'Leave Requests', value: '12', icon: Calendar, color: 'purple' },
  ];

  const deptData = [
    { name: 'Production', count: 180 },
    { name: 'Storage', count: 120 },
    { name: 'Quality', count: 80 },
    { name: 'Testing', count: 70 },
  ];

  const empTypeData = [
    { name: 'Full-time', value: 350 },
    { name: 'Contract', value: 80 },
    { name: 'Part-time', value: 20 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Workforce Intelligence</h2>
          <p className="text-slate-500 font-medium">Global organizational demographics and personnel performance analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-3xl`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
             <BarChartIcon size={16} className="text-primary-500" />
             Personnel Allocation by Unit
           </h4>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={deptData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                 <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Operational Events</h4>
           <div className="space-y-6">
              <div className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center">
                    <Gift size={22} className="text-white" />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-tight">Birthdays Today</p>
                    <p className="text-[10px] text-white/50 font-bold">John Doe, Sarah Mike</p>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/10 space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Critical Leave Approvals</h5>
              <div className="space-y-4">
                 {[1,2].map(i => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black text-[10px]">MD</div>
                         <div>
                            <p className="text-[11px] font-black">Mike Dave</p>
                            <p className="text-[9px] text-white/40 uppercase">Sick Leave • 2d</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1.5 bg-emerald-500 rounded-lg"><CheckCircle size={14} /></button>
                         <button className="p-1.5 bg-red-500 rounded-lg"><XCircle size={14} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
