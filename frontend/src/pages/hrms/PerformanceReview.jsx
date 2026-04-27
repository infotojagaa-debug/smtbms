import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Search, 
  Plus, 
  Star, 
  Zap, 
  Award, 
  ChevronRight,
  User,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const PerformanceReview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [ratings, setRatings] = useState({ productivity: 3, quality: 3, teamwork: 3, punctuality: 3 });
  const [comments, setComments] = useState({ period: '', strengths: '', improvements: '', goals: '' });

  const loadInitial = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get('/api/hr/employees', { headers: { Authorization: `Bearer ${user.token}` } });
    setEmployees(res.data.employees);
  };

  const loadReviews = async (id) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get(`/api/hr/performance/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    setReviews(res.data);
  };

  useEffect(() => { loadInitial(); }, []);

  const handleSelect = (emp) => {
    setSelectedEmp(emp);
    loadReviews(emp._id);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.post('/api/hr/performance', {
        employeeId: selectedEmp._id,
        reviewPeriod: comments.period,
        categories: ratings,
        strengths: comments.strengths,
        improvements: comments.improvements,
        goals: comments.goals
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Performance Matrix Uploaded');
      loadReviews(selectedEmp._id);
      setShowForm(false);
    } catch (err) {
      toast.error('Protocol Error');
    }
  };

  const radarData = [
    { subject: 'Productivity', A: ratings.productivity, fullMark: 5 },
    { subject: 'Quality', A: ratings.quality, fullMark: 5 },
    { subject: 'Teamwork', A: ratings.teamwork, fullMark: 5 },
    { subject: 'Punctuality', A: ratings.punctuality, fullMark: 5 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Performance Analytics Hub</h2>
          <p className="text-slate-500 font-medium">Evaluate personnel aptitude, visualize growth vectors, and set organizational benchmarks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col gap-6">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
               <Search size={16} className="text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Locate Personnel..." 
                  className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
               {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                 <button 
                  key={emp._id}
                  onClick={() => handleSelect(emp)}
                  className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all border ${
                    selectedEmp?._id === emp._id ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-50 hover:bg-slate-50'
                  }`}
                 >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                       {emp.employeeId.slice(-3)}
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black text-slate-900 uppercase leading-none">{emp.name}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{emp.department}</p>
                    </div>
                 </button>
               ))}
            </div>
         </div>

         <div className="lg:col-span-3 space-y-10 focus:outline-none">
            {!selectedEmp ? (
              <div className="h-full bg-white rounded-[4rem] border border-slate-100 flex flex-col items-center justify-center text-center p-20 opacity-30 gap-6">
                 <Activity size={80} strokeWidth={1} />
                 <p className="font-black uppercase tracking-[0.4em] text-xs">Select a personnel sequence to initialize metrics.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-10">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                          {selectedEmp.photo ? <img src={selectedEmp.photo} className="w-full h-full object-cover rounded-[2rem]" /> : selectedEmp.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">{selectedEmp.name}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aptitude Portfolio Ledger</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowForm(!showForm)}
                      className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all"
                    >
                       <Plus size={18} /> New Review Sequence
                    </button>
                 </div>

                 {showForm && (
                   <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                         <div className="space-y-8">
                            <h4 className="font-black text-[11px] uppercase tracking-widest text-primary-600 border-b border-primary-50 pb-4">Variable Ratings</h4>
                            {Object.keys(ratings).map(cat => (
                              <div key={cat} className="space-y-3">
                                 <div className="flex justify-between font-black uppercase text-[10px] text-slate-400 tracking-tighter">
                                    <span>{cat} index</span>
                                    <span className="text-primary-600">{ratings[cat]} / 5</span>
                                 </div>
                                 <input 
                                    type="range" min="1" max="5" 
                                    value={ratings[cat]} 
                                    onChange={(e) => setRatings({...ratings, [cat]: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                 />
                              </div>
                            ))}
                         </div>
                         <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Aptitude Radar</h5>
                            <div className="h-64 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                     <PolarGrid stroke="#e2e8f0" />
                                     <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                     <Radar name="Ratings" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                  </RadarChart>
                               </ResponsiveContainer>
                            </div>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Review Period</label>
                            <input 
                              type="text" placeholder="e.g. Q1 2024" 
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold"
                              onChange={(e) => setComments({...comments, period: e.target.value})}
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Strategic Goals</label>
                            <input 
                              type="text" placeholder="Future vector targets" 
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold"
                              onChange={(e) => setComments({...comments, goals: e.target.value})}
                            />
                         </div>
                      </div>

                      <div className="flex justify-end gap-4">
                         <button onClick={() => setShowForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-[10px]">Cancel Protocol</button>
                         <button 
                           onClick={handleSubmit}
                           className="px-10 py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-primary-700 transition-all active:scale-95"
                         >
                            Finalize Review
                         </button>
                      </div>
                   </div>
                 )}

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {reviews.map(rev => (
                      <div key={rev._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all space-y-6">
                         <div className="flex justify-between items-center">
                            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic">{rev.reviewPeriod}</span>
                            <div className="flex items-center gap-1 text-primary-500">
                               <Star size={14} className="fill-primary-500" />
                               <span className="font-black text-xs italic">{rev.rating}</span>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest uppercase">Lead Reviewer</p>
                            <p className="font-bold text-xs text-slate-900 uppercase">{rev.reviewedBy?.name}</p>
                         </div>
                         <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                            <button className="text-[9px] font-black uppercase text-primary-600 hover:gap-2 transition-all flex items-center gap-1">Deep Dive <ChevronRight size={12} /></button>
                            <p className="text-[9px] font-bold text-slate-300 italic">{new Date(rev.reviewDate).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))}
                    {reviews.length === 0 && !showForm && (
                      <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center opacity-30 gap-4">
                         <Zap size={32} />
                         <p className="text-[10px] font-black uppercase tracking-widest italic">Historical analytics awaited.</p>
                      </div>
                    )}
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PerformanceReview;
