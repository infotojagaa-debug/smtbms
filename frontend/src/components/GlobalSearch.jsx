import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { 
  Search, 
  X, 
  Package, 
  Users, 
  Briefcase, 
  Target, 
  FileText, 
  Command,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const performSearch = useCallback(
    debounce(async (q) => {
      if (!q.trim()) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/analytics/search?query=${q}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search Failure:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleResultClick = (link) => {
    navigate(link);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 backdrop-blur-xl bg-slate-900/40">
      <div className="fixed inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex items-center gap-6">
           <Search size={24} className="text-primary-600" />
           <input 
             autoFocus
             type="text" 
             placeholder="Search across all organizational nodes..."
             className="flex-1 bg-transparent border-none outline-none text-lg font-black text-slate-900 placeholder:text-slate-200 uppercase italic tracking-tight"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
           <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
              <X size={20} />
           </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-4 scroller-hide">
           {loading && (
             <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse italic">
                Scanning Enterprise Registry...
             </div>
           )}

           {results && Object.keys(results).some(k => results[k].length > 0) ? (
             <div className="space-y-8 p-4">
                {results.materials?.length > 0 && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2 px-4">
                        <Package size={14} /> Materials Index
                     </p>
                     {results.materials.map((m, i) => (
                        <button key={i} onClick={() => handleResultClick(`/inventory/${m._id}`)} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl hover:bg-primary-600 hover:text-white transition-all group">
                           <div className="flex items-center gap-4">
                              <p className="text-xs font-black uppercase italic">{m.name}</p>
                              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{m.code}</span>
                           </div>
                           <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all mr-2" />
                        </button>
                     ))}
                  </div>
                )}

                {results.employees?.length > 0 && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2 px-4">
                        <Users size={14} /> Workforce Hub
                     </p>
                     {results.employees.map((e, i) => (
                        <button key={i} onClick={() => handleResultClick(`/hrms/employees/${e._id}`)} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all group">
                           <div className="flex items-center gap-4">
                              <p className="text-xs font-black uppercase italic">{e.name}</p>
                              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{e.employeeId}</span>
                           </div>
                           <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all mr-2" />
                        </button>
                     ))}
                  </div>
                )}

                {results.customers?.length > 0 && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2 px-4">
                        <Briefcase size={14} /> CRM Stakeholders
                     </p>
                     {results.customers.map((c, i) => (
                        <button key={i} onClick={() => handleResultClick(`/crm/customers/${c._id}`)} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl hover:bg-amber-600 hover:text-white transition-all group">
                           <div className="flex items-center gap-4">
                              <p className="text-xs font-black uppercase italic">{c.name}</p>
                              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{c.company}</span>
                           </div>
                           <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all mr-2" />
                        </button>
                     ))}
                  </div>
                )}
             </div>
           ) : !loading && query && (
              <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-200 italic">
                 No artifacts matched the specified query.
              </div>
           )}

           {!query && (
             <div className="py-20 text-center space-y-6">
                <Command size={48} className="mx-auto text-slate-100" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Awaiting Search Protocol Deployment</p>
                <div className="flex justify-center flex-wrap gap-3">
                   {['Materials', 'Employees', 'Invoices', 'Support Tickets'].map(t => (
                     <span key={t} className="px-4 py-2 bg-slate-50 text-slate-300 rounded-full text-[8px] font-black uppercase tracking-widest">{t}</span>
                   ))}
                </div>
             </div>
           )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400">
           <div className="flex gap-6">
              <span><Command size={10} className="inline mr-1" /> + K Search</span>
              <span><ArrowRight size={10} className="inline mr-1 rotate-90" /> Navigate</span>
           </div>
           <span>Enterprise Search Alpha v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
