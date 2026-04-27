import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Search, 
  Star, 
  Award, 
  Activity, 
  Users,
  Target,
  BarChart3,
  ThumbsUp,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const PerformanceRadar = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  const fetchEmployees = async () => {
    try {
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data.employees);
    } catch (err) {
      toast.error('Performance Matrix sync failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const selectEmployee = async (emp) => {
    setSelectedEmp(emp);
    // Mocking Performance Radar Data for HR visualization
    setPerformanceData([
      { subject: 'Reliability', A: 80 + Math.random() * 20, fullMark: 100 },
      { subject: 'Technical', A: 70 + Math.random() * 30, fullMark: 100 },
      { subject: 'Comms', A: 60 + Math.random() * 40, fullMark: 100 },
      { subject: 'Efficiency', A: 90, fullMark: 100 },
      { subject: 'Innovation', A: 50 + Math.random() * 50, fullMark: 100 },
    ]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personnel List */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-2xl flex flex-col min-h-[700px]">
           <div className="mb-10">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                 Talent Grid <BarChart3 size={24} className="text-indigo-600" />
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Observing workforce caliber</p>
           </div>

           <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search Talent Node..." 
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl pl-12 outline-none font-bold text-sm text-slate-900 placeholder-slate-300 transition-all focus:bg-white focus:border-indigo-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {employees.filter(e => e.userId?.role?.toLowerCase() !== 'admin' && e.name.toLowerCase().includes(search.toLowerCase())).map((emp) => (
                 <button 
                   key={emp._id}
                   onClick={() => selectEmployee(emp)}
                   className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all border-2 ${
                     selectedEmp?._id === emp._id 
                     ? 'bg-indigo-600 text-white border-indigo-700 shadow-xl scale-[1.02]' 
                     : 'bg-white border-slate-50 text-slate-900 hover:bg-slate-50 hover:border-slate-200 hover:shadow-lg'
                   }`}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-md ${selectedEmp?._id === emp._id ? 'bg-indigo-500' : 'bg-slate-900 text-white'}`}>
                          {emp.name.charAt(0)}
                       </div>
                       <div className="text-left overflow-hidden">
                          <p className="text-xs font-black uppercase italic truncate max-w-[120px]">{emp.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedEmp?._id === emp._id ? 'text-indigo-300' : 'text-slate-400'}`}>{emp.designation}</p>
                       </div>
                    </div>
                    <Star size={16} className={`${selectedEmp?._id === emp._id ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                 </button>
              ))}
           </div>
        </div>

        {/* Right Column: Visualization Radar */}
        <div className="lg:col-span-8 space-y-8">
           {selectedEmp ? (
              <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                 <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Award size={120} className="text-indigo-600" /></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10">
                       <div className="w-full md:w-[400px] h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                   name="Capability"
                                   dataKey="A"
                                   stroke="#6366f1"
                                   strokeWidth={4}
                                   fill="#6366f1"
                                   fillOpacity={0.15}
                                />
                             </RadarChart>
                          </ResponsiveContainer>
                       </div>

                       <div className="flex-1 space-y-8 text-center md:text-left">
                          <div>
                             <h4 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-4">{selectedEmp.name}</h4>
                             <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic flex items-center gap-2">
                                   <Zap size={14} className="fill-indigo-600" /> Top Performer
                                </span>
                                <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic flex items-center gap-2">
                                   <ThumbsUp size={14} className="fill-emerald-600" /> High Reliability
                                </span>
                             </div>
                          </div>

                          <div grid-cols-1 sm:grid-cols-2>
                             <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 mb-2">Aggregate Rating</p>
                                <div className="flex items-end gap-2">
                                   <span className="text-4xl font-black italic">4.8</span>
                                   <span className="text-xs font-black text-slate-400 mb-2">/ 5.0</span>
                                </div>
                             </div>
                             <div className="p-6 bg-white border-4 border-slate-50 rounded-[2rem] shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2">Project Velocity</p>
                                <h4 className="text-4xl font-black italic text-slate-900 leading-none">92%</h4>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Historical Impact */}
                 <div className="bg-slate-950 p-10 rounded-[4rem] text-white overflow-hidden relative group border border-slate-800 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent"></div>
                    <div className="relative flex justify-between items-center mb-8">
                       <h5 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-3">
                          Value Contribution Index <Activity size={20} className="text-indigo-400 animate-pulse" />
                       </h5>
                    </div>
                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={[
                              { name: 'Jan', val: 4000 },
                              { name: 'Feb', val: 3000 },
                              { name: 'Mar', val: 5000 },
                              { name: 'Apr', val: 8000 },
                           ]}>
                              <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                              <Area type="monotone" dataKey="val" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                           </AreaChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-full bg-white rounded-[4rem] border border-slate-200 flex flex-col items-center justify-center p-20 text-center opacity-30 shadow-sm">
                 <Target size={80} className="text-slate-300 mb-8" />
                 <h4 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-400 italic">Select Talent Node</h4>
                 <p className="text-sm font-bold text-slate-500 mt-4 max-w-sm">Synchronize with a specific personnel identity to generate comprehensive capability radar and performance telemetry.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceRadar;
