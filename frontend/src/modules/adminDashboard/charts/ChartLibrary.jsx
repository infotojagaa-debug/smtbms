import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

export const MaterialUsageChart = ({ data }) => {
  return (
    <div className="h-64 w-full mt-4">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
             <defs>
               <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
             <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
             <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
             <Area type="monotone" dataKey="usage" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
          </AreaChart>
       </ResponsiveContainer>
    </div>
  );
};

export const StockInOutChart = ({ data }) => {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          <Bar dataKey="in" fill="#10b981" radius={[4, 4, 0, 0]} name="Stock In" />
          <Bar dataKey="out" fill="#ef4444" radius={[4, 4, 0, 0]} name="Stock Out" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RevenueExpenseChart = ({ data }) => {
  return (
    <div className="h-64 w-full mt-4">
       <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
             <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
             <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(value) => [`₹${(value/1000).toFixed(1)}k`, 'Amount']} />
             <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Revenue" />
             <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Expense" />
          </LineChart>
       </ResponsiveContainer>
    </div>
  );
};

export const DistributionPie = ({ data, colors }) => {
  return (
    <div className="h-48 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
