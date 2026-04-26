import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Search, Filter, Upload, Eye, 
  Trash2, ArrowUpRight, FolderOpen, ShieldCheck, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentVault = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [uploadData, setUploadData] = useState({ name: '', file: null });

  const fetchEmployees = async () => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data.employees);
    } catch (err) {
      toast.error('Data Archive Access Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return toast.error('No file selected');

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('name', uploadData.name || 'Personal Document');

    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      await axios.post(`/api/hr/employees/${selectedEmp._id}/documents`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Document archived in vault');
      setUploadData({ name: '', file: null });
      fetchEmployees();
      setSelectedEmp(null);
    } catch (err) {
      toast.error('Archival Protocol Failed');
    }
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-3xl font-black italic uppercase tracking-tight">Personnel <span className="text-indigo-600">Document Vault</span></h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Immutable Digital Archive & Verification Console</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search Archive..." 
                className="w-full bg-slate-50 border-none pl-12 pr-4 py-3 rounded-xl text-xs font-bold outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Registry List */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
           <div className="px-10 py-8 bg-slate-900 border-b border-indigo-900 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Personnel Registry Status</h3>
              <FolderOpen size={18} className="text-indigo-400" />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="border-b border-slate-50">
                       <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                       <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Count</th>
                       <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</th>
                       <th className="px-10 py-6 text-right"></th>
                    </tr>
                 </thead>
                 <tbody>
                    {filtered.map((emp) => (
                       <tr key={emp._id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                   {emp.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-800">{emp.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{emp.employeeId}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-6">
                             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">
                                {emp.documents?.length || 0} Files
                             </span>
                          </td>
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className={emp.documents?.length > 0 ? "text-emerald-500" : "text-slate-300"} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${emp.documents?.length > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                                   {emp.documents?.length > 0 ? 'Tier 1 Verified' : 'Awaiting Docs'}
                                </span>
                             </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button 
                               onClick={() => setSelectedEmp(emp)}
                               className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                             >
                                <ArrowUpRight size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Right: Active Workspace */}
        <div className="lg:col-span-4 space-y-6">
           {selectedEmp ? (
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/5 animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h4 className="text-xl font-black italic leading-tight">{selectedEmp.name}</h4>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Active File Vault</p>
                   </div>
                   <button onClick={() => setSelectedEmp(null)} className="text-white/30 hover:text-white">&times;</button>
                </div>

                <div className="space-y-4 mb-10">
                   {selectedEmp.documents?.length > 0 ? (
                      selectedEmp.documents.map((doc, i) => (
                         <div key={i} className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                  <FileText size={16} />
                               </div>
                               <div className="overflow-hidden">
                                  <p className="text-[11px] font-bold truncate w-32">{doc.name}</p>
                                  <p className="text-[8px] font-semibold text-white/30 uppercase">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-white/30 hover:text-white transition-colors">
                               <Eye size={16} />
                            </a>
                         </div>
                      ))
                   ) : (
                      <div className="py-10 text-center">
                         <FolderOpen size={40} className="mx-auto text-white/10 mb-3" />
                         <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">No Documents Found</p>
                      </div>
                   )}
                </div>

                <div className="pt-8 border-t border-white/10">
                   <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 font-italic">Secure Archival Portal</h5>
                   <form onSubmit={handleUpload} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Document Name (e.g. ID Card)" 
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none text-white focus:border-indigo-500"
                        value={uploadData.name}
                        onChange={e => setUploadData({...uploadData, name: e.target.value})}
                      />
                      <div className="relative h-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group/up hover:border-indigo-500/50 hover:bg-white/5 transition-all">
                         <input 
                           type="file" 
                           className="absolute inset-0 opacity-0 cursor-pointer" 
                           onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                         />
                         <Upload size={20} className="text-white/20 group-hover/up:text-indigo-400 transition-colors" />
                         <p className="text-[10px] font-bold text-white/20 uppercase mt-2 tracking-widest">{uploadData.file ? uploadData.file.name : 'Select File node'}</p>
                      </div>
                      <button className="w-full py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-indigo-500 hover:shadow-xl transition-all active:scale-95">
                         Execute Archival
                      </button>
                   </form>
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[500px]">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                   <FolderOpen size={40} />
                </div>
                <div>
                   <h4 className="text-lg font-black italic uppercase tracking-tight text-slate-800">Select Personnel Node</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 leading-relaxed">
                      Initialize secure vault access to manage, <br/> verify, and archive digital documentation.
                   </p>
                </div>
                <div className="w-full h-[1px] bg-slate-50"></div>
                <div className="grid grid-cols-2 gap-4 w-full">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Clock size={16} className="text-indigo-500 mb-2" />
                      <p className="text-[8px] font-black text-slate-400 uppercase">Recent Files</p>
                      <p className="text-sm font-black text-slate-800 mt-1">24</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <ShieldCheck size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[8px] font-black text-slate-400 uppercase">Security</p>
                      <p className="text-sm font-black text-emerald-500 mt-1">AES-256</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
