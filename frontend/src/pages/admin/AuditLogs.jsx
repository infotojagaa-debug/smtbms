import { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Database,
  User as UserIcon,
  RefreshCcw,
  Eye
} from 'lucide-react';
import axios from 'axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({ module: '', action: '', userId: '' });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get('/api/audit/logs', {
        headers: { Authorization: `Bearer ${user.token}` },
        params: filters
      });
      setLogs(res.data.logs);
    } catch (err) {
      console.error('Audit Load Failure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'DELETE': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-end text-slate-900 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Enterprise Audit Ledger</h2>
          <p className="text-slate-500 font-medium text-sm">Mission-critical immutable registry of all state-modifying operational protocols.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           <button 
             onClick={loadLogs}
             className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
           >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
             <Download size={16} /> Export Forensic Artifacts
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
         <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <div className="flex gap-8">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Module Protocol</span>
                  <select 
                    className="bg-white border border-slate-200 rounded outline-none text-sm font-medium text-slate-900 px-2 py-1"
                    onChange={(e) => setFilters({...filters, module: e.target.value})}
                  >
                     <option value="">Global Matrix</option>
                     <option value="material">Material Flux</option>
                     <option value="hrms">Workforce Node</option>
                     <option value="erp">Fiscal Stream</option>
                     <option value="crm">Stakeholder Interaction</option>
                  </select>
               </div>
               <div className="flex items-center gap-2 border-l border-slate-300 pl-8">
                  <span className="text-xs font-semibold text-slate-500">Action Logic</span>
                  <select 
                    className="bg-white border border-slate-200 rounded outline-none text-sm font-medium text-slate-900 px-2 py-1"
                    onChange={(e) => setFilters({...filters, action: e.target.value})}
                  >
                     <option value="">All Objectives</option>
                     <option value="CREATE">Creation Node</option>
                     <option value="UPDATE">Update Protocol</option>
                     <option value="DELETE">Deletion Delta</option>
                  </select>
               </div>
            </div>
            <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm">
               <Search size={16} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Locate Artifact ID..." 
                 className="bg-transparent border-none outline-none ml-2 text-sm font-medium w-48 text-slate-900 placeholder-slate-400"
               />
            </div>
         </div>

         <div className="overflow-y-auto flex-1">
            <table className="w-full text-left bg-white border-collapse">
               <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Temporal Node</th>
                     <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Operational Executor</th>
                     <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Protocol Matrix</th>
                     <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Artifact Summary</th>
                     <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Data Diff</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {logs.map((log, i) => (
                    <>
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 align-top">
                          <div className="flex items-start gap-3">
                             <div className="p-2 bg-slate-50 border border-slate-200 rounded shrink-0 text-slate-500"><Clock size={16} /></div>
                             <div>
                                <p className="text-sm font-semibold text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 align-top">
                          <div>
                             <p className="text-sm font-semibold text-slate-900">{log.userName}</p>
                             <p className="text-xs font-semibold text-indigo-600 mt-0.5 bg-indigo-50 border border-indigo-100 w-fit px-1.5 py-0.5 rounded">{log.userRole}</p>
                          </div>
                       </td>
                       <td className="px-6 py-4 align-top">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold border mb-1 block w-fit ${getActionColor(log.action)}`}>
                             {log.action}
                          </span>
                          <span className="text-xs font-medium text-slate-500">{log.module} system</span>
                       </td>
                       <td className="px-6 py-4 align-top max-w-sm">
                          <p className="text-sm text-slate-700"><span className="font-semibold">[{log.resourceType}]</span> {log.description}</p>
                       </td>
                       <td className="px-6 py-4 text-center align-top">
                          <button 
                            onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                            className={`p-2 rounded transition-colors border ${
                              expandedRow === i ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'
                            }`}
                          >
                             {expandedRow === i ? <ChevronUp size={18} /> : <Eye size={18} />}
                          </button>
                       </td>
                    </tr>
                    {expandedRow === i && (
                      <tr>
                        <td colSpan="5" className="px-6 py-6 bg-slate-50 border-b border-t border-slate-200">
                           <div grid-cols-1 sm:grid-cols-2>
                              <div className="space-y-4">
                                 <h5 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Database size={16} /> Original Artifact State [pre-execution]
                                 </h5>
                                 <pre className="p-4 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 overflow-x-auto scroller-hide max-h-60">
                                    {JSON.stringify(log.oldData, null, 2) || "// PROTOCOL INITIATED WITHOUT PREVIOUS NODE"}
                                 </pre>
                              </div>
                              <div className="space-y-4">
                                 <h5 className="text-xs font-bold text-indigo-600 flex items-center gap-2">
                                    <ShieldCheck size={16} /> Modified Artifact State [post-execution]
                                 </h5>
                                 <pre className="p-4 bg-white rounded-lg border border-indigo-100 text-xs text-indigo-700 overflow-x-auto scroller-hide max-h-60">
                                    {JSON.stringify(log.newData, null, 2) || "// PROTOCOL RESULTED IN NODE DELETION"}
                                 </pre>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                    </>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AuditLogs;
