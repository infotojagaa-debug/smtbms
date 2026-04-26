import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, MapPin, Clock, Camera, 
  AlertTriangle, CheckCircle2, XCircle, Search, 
  ExternalLink, ChevronRight, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FieldAuditReview = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await api.get('/api/field-audit/all');
      setAudits(res.data);
    } catch (error) {
      toast.error('Failed to load field audits');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (id, status) => {
    try {
      await api.put(`/api/field-audit/${id}/review`, { status: status === 'approved' ? 'Reviewed' : 'Rejected' });
      toast.success(`Audit marked as ${status}`);
      setAudits(audits.map(a => a._id === id ? { ...a, status: status === 'approved' ? 'Reviewed' : 'Rejected' } : a));
      setSelectedAudit(null);
    } catch (error) {
      toast.error('Failed to update audit status');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Intelligence...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-end bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
        <div>
           <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             <ShieldCheck className="text-indigo-400" size={40} /> Audit Command Center
           </h1>
           <p className="text-slate-400 font-medium mt-2">Review field reports, verify coordinates, and assess flagged anomalies.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-indigo-400">{audits.filter(a => a.status === 'Submitted').length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Audit List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-b from-white to-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-2xl shadow-slate-200/60 flex flex-col justify-center items-center text-center relative overflow-hidden">
           <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-20"></div>
           <ShieldCheck size={80} className="text-slate-200 mb-6 drop-shadow-sm" strokeWidth={1} />
            <input type="text" placeholder="Search stores or employees..." className="w-full text-sm font-medium outline-none bg-transparent" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[700px] scroller-hide pr-2">
            {audits.map(audit => (
              <div 
                key={audit._id}
                onClick={() => setSelectedAudit(audit)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                  selectedAudit?._id === audit._id ? 'bg-[#5B4DFC] text-white border-[#5B4DFC] shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-black text-lg truncate">{audit.storeName}</h3>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                     audit.status === 'Submitted' ? (selectedAudit?._id === audit._id ? 'bg-white/20' : 'bg-amber-100 text-amber-700') : 
                     (selectedAudit?._id === audit._id ? 'bg-[#43D8B0] text-emerald-900 shadow-sm' : 'bg-emerald-100 text-emerald-700')
                   }`}>
                     {audit.status}
                   </span>
                </div>
                <div className={`text-xs font-bold mb-4 ${selectedAudit?._id === audit._id ? 'text-indigo-100' : 'text-slate-500'}`}>
                  By: <span className="uppercase tracking-wider">{audit.employee?.name || 'Unknown Agent'}</span>
                </div>
                <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-wider ${selectedAudit?._id === audit._id ? 'text-indigo-200' : 'text-slate-400'}`}>
                   <span className="flex items-center gap-1"><Clock size={12} /> {new Date(audit.checkIn?.time || audit.createdAt).toLocaleDateString()}</span>
                   {audit.issues?.length > 0 && (
                     <span className={`flex items-center gap-1 ${selectedAudit?._id === audit._id ? 'text-rose-300' : 'text-rose-500'}`}>
                       <AlertTriangle size={12} /> {audit.issues.length} Issues
                     </span>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Audit Detail */}
        <div className="lg:col-span-2">
          {selectedAudit ? (
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-[#5B4DFC] to-[#43D8B0] left-0"></div>
              
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b-2 border-slate-50 gap-6">
                   <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">{selectedAudit.storeName}</h2>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          <MapPin size={16} className="text-[#5B4DFC]" /> 
                          <span className="text-sm font-black text-slate-700 tracking-wider">
                            {selectedAudit.checkIn?.location?.lat.toFixed(4)}, {selectedAudit.checkIn?.location?.lng.toFixed(4)} 
                          </span>
                        </div>
                        {selectedAudit.checkIn?.verified && (
                          <span className="text-[#059669] text-xs font-black bg-[#D1FAE5] px-3 py-1.5 rounded-lg border border-[#A7F3D0] shadow-sm uppercase tracking-widest">
                            ✓ Verified Target
                          </span>
                        )}
                        {selectedAudit.checkIn?.location && (
                          <button 
                            onClick={() => setShowMap(true)}
                            className="text-xs font-black text-white uppercase tracking-widest bg-gradient-to-r from-[#5B4DFC] to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
                          >
                            View on Map <ExternalLink size={14} />
                          </button>
                        )}
                      </div>
                   </div>
                   <div className="text-left md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px]">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Agent</p>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-3">{selectedAudit.employee?.name}</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-500 flex items-center justify-start md:justify-end gap-1.5"><Clock size={12}/> Time Spent: {selectedAudit.timeSpentMinutes} mins</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedAudit.checkIn?.time).toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   {/* Checklist Array */}
                   <div>
                      <h4 className="flex items-center gap-2 font-black text-slate-800 text-lg mb-6"><CheckCircle2 size={24} className="text-emerald-500 drop-shadow-sm" /> Inspection Checklist</h4>
                      <div className="space-y-4">
                         {selectedAudit.checklist.map((item, i) => (
                           <div key={i} className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-[#5B4DFC] transition-colors"></div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{item.question}</p>
                              <p className="font-black text-slate-900 text-xl flex items-center gap-2 tracking-tight">
                                {item.answer}
                                {(item.answer === 'No' || item.answer === 'Poor') && <AlertCircle size={20} className="text-rose-500 animate-pulse" />}
                              </p>
                              {item.remarks && <p className="text-xs font-bold text-rose-700 mt-3 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 shadow-inner">"{item.remarks}"</p>}
                           </div>
                         ))}
                      </div>
                   </div>
                   {/* Flagged Issues & Evidence Array */}
                   <div className="space-y-10">
                      <div>
                         <h4 className="flex items-center gap-2 font-black text-slate-800 text-lg mb-6"><AlertTriangle size={24} className="text-rose-500 drop-shadow-sm" /> Flagged Issues</h4>
                         {selectedAudit.issues?.length > 0 ? (
                           <div className="space-y-4">
                             {selectedAudit.issues.map((issue, i) => (
                               <div key={i} className="bg-gradient-to-r from-rose-50 to-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                                      issue.severity === 'High' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 
                                      issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                    }`}>{issue.severity} Priority</span>
                                  </div>
                                  <p className="font-black text-slate-900 text-lg mb-1 leading-tight">{issue.description}</p>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{issue.category}</p>
                               </div>
                             ))}
                           </div>
                         ) : (
                            <div className="bg-gradient-to-br from-emerald-50 to-[#ebfef5] border-2 border-emerald-200 p-8 rounded-[2rem] text-center shadow-inner">
                              <p className="text-emerald-700 font-black text-lg">No anomalies detected.</p>
                              <p className="text-emerald-600/70 text-xs font-bold uppercase tracking-widest mt-1">Matrix is clear.</p>
                           </div>
                         )}
                      </div>

                      <div>
                         <h4 className="flex items-center gap-2 font-black text-slate-800 text-lg mb-6"><Camera size={24} className="text-indigo-500 drop-shadow-sm" /> Site Evidence</h4>
                         {selectedAudit.evidence?.length > 0 ? (
                           <div className="grid grid-cols-2 gap-4">
                              {selectedAudit.evidence.map((ev, i) => (
                                <div key={i} className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-square shadow-md border border-slate-200">
                                   <img src={ev.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                     <p className="text-white text-[10px] font-black uppercase tracking-widest">{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'No Timestamp'}</p>
                                     <p className="text-white/70 text-[8px] font-bold mt-1 uppercase tracking-widest">VERIFIED CAPTURE</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                         ) : (
                           <p className="text-sm font-bold text-slate-400 italic bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">No media attached to this transmission.</p>
                         )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Review Actions */}
              {selectedAudit.status === 'Submitted' && (
                <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
                   <button 
                     onClick={() => handleReviewAction(selectedAudit._id, 'approved')}
                     className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 size={20} /> Approve Audit
                   </button>
                   <button 
                     onClick={() => handleReviewAction(selectedAudit._id, 'rejected')}
                     className="flex-1 py-4 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-black uppercase tracking-widest border border-rose-200 rounded-xl transition-all flex items-center justify-center gap-2"
                   >
                     <XCircle size={20} /> Reject & Reassign
                   </button>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 bg-slate-50/50">
               <ShieldCheck size={64} className="mb-4 text-slate-300" strokeWidth={1} />
               <p className="text-lg font-bold text-slate-500">Select an audit report to review</p>
               <p className="text-sm font-medium">Coordinate data and evidence matrices will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showMap && selectedAudit?.checkIn?.location && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                 <div>
                    <h3 className="font-black text-xl text-slate-900">Site Location Analysis</h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">{selectedAudit.storeName} ({selectedAudit.checkIn.location.lat.toFixed(4)}, {selectedAudit.checkIn.location.lng.toFixed(4)})</p>
                 </div>
                 <button 
                   onClick={() => setShowMap(false)}
                   className="p-3 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-colors font-bold flex items-center gap-2"
                 >
                   <X size={20} /> Close Map
                 </button>
              </div>
              <div className="flex-1 w-full bg-slate-100 relative z-0">
                 <MapContainer 
                   center={[selectedAudit.checkIn.location.lat, selectedAudit.checkIn.location.lng]} 
                   zoom={16} 
                   scrollWheelZoom={true}
                   className="absolute inset-0 w-full h-full"
                 >
                   <TileLayer
                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                   />
                   <Marker position={[selectedAudit.checkIn.location.lat, selectedAudit.checkIn.location.lng]}>
                   </Marker>
                 </MapContainer>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={16} /> Secure Verification Vector
                 </p>
                 <button onClick={() => setShowMap(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">
                    Return to Dashboard
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FieldAuditReview;
