import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Users,
  Package,
  TrendingUp,
  PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportsCenter = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isExporting, setIsExporting] = useState(false);

  const reports = [
    {
      id: 'hr_summary',
      title: 'Human Resources Summary',
      desc: 'Employee headcount, attendance rates, leave analytics, and department breakdown.',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      id: 'material_stock',
      title: 'Material Stock & Flux',
      desc: 'Current physical inventory, low stock indicators, and transfer ledgers.',
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      id: 'financial_ledger',
      title: 'Financial Ledger (ERP)',
      desc: 'Procurement expenditures, invoices, revenue streams, and pending P.O. value.',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      id: 'crm_pipeline',
      title: 'CRM Pipeline Analytics',
      desc: 'Lead conversion ratios, active deal values, and stakeholder registry.',
      icon: PieChart,
      color: 'bg-violet-50 text-violet-600 border-violet-200'
    }
  ];

  const handleExport = (reportId) => {
    setIsExporting(reportId);
    
    // Simulate compilation time
    setTimeout(() => {
      let data = [];
      let headers = "";
      
      switch(reportId) {
        case 'hr_summary':
          headers = "Employee ID,Name,Department,Status,Attendance%\n";
          data = ["EMP001,John Doe,Operations,Active,98%", "EMP002,Jane Smith,HR,Active,95%"];
          break;
        case 'material_stock':
          headers = "SKU,Material Name,Category,Quantity,Status\n";
          data = ["MAT-001,Steel Rod,Construction,450,Stable", "MAT-002,Cement Bag,Construction,12,Low Stock"];
          break;
        case 'financial_ledger':
          headers = "Transaction ID,Vendor,Amount,Status,Date\n";
          data = ["TRX-99,Global Steel,120000,Paid,2026-04-20", "TRX-100,Local Power,45000,Pending,2026-04-25"];
          break;
        case 'crm_pipeline':
          headers = "Lead ID,Company,Value,Stage,Owner\n";
          data = ["LEAD-404,Acme Corp,500000,Negotiation,Parthipan", "LEAD-501,Nexus Ltd,250000,Discovery,Parthipan"];
          break;
        default:
          headers = "Generic Report Export\n";
          data = ["No data found for this module."];
      }

      const csvContent = "data:text/csv;charset=utf-8," + headers + data.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportId}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${reportId.toUpperCase()} Intelligence Extracted.`);
      setIsExporting(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end text-slate-900 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Central Reports Matrix</h2>
          <p className="text-slate-500 font-medium text-sm">Extract critical intelligence across all active organizational modules.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              <Calendar size={16} /> {dateRange}
           </button>
           <button className="flex items-center gap-2 p-2 bg-white border border-slate-200 text-slate-400 rounded-lg shadow-sm hover:text-slate-900 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
         {reports.map((report) => (
           <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-6 flex-1 flex gap-5">
                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${report.color}`}>
                    <report.icon size={26} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{report.title}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                       {report.desc}
                    </p>
                 </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
                 <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <FileText size={14} /> Formats: CSV / EXCEL
                 </p>
                 <button 
                    onClick={() => handleExport(report.id)}
                    disabled={isExporting === report.id}
                    className={`flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold tracking-widest uppercase text-[10px] rounded-lg shadow-sm transition-all focus:outline-none ${isExporting === report.id ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                 >
                    {isExporting === report.id ? (
                       <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block"></span>
                    ) : (
                       <Download size={14} /> 
                    )}
                    Extract Intel
                 </button>
              </div>
           </div>
         ))}
      </div>
      
      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-center justify-between shadow-inner">
         <div>
            <h4 className="font-bold text-indigo-900 mb-1">Automated Intelligence Scheduling</h4>
            <p className="text-sm font-medium text-indigo-700/80">Configure the system to autonomously email compiled reports at designated intervals.</p>
         </div>
         <button 
          onClick={() => toast.success('Intelligence Schedule Configured: Every Monday at 08:00 AM')}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition"
         >
            Configure Schedule
         </button>
      </div>
    </div>
  );
};

export default ReportsCenter;
