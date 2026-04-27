import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, ShieldAlert, Camera, UploadCloud, 
  CheckCircle2, AlertTriangle, AlertCircle, 
  X, ChevronRight, Save
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const FieldAudit = () => {
  const { user } = useSelector(state => state.auth);
  
  // State: GPS & Check-in
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [checkIn, setCheckIn] = useState(null); // { time, location, verified }
  
  // State: Form Data
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [checklist, setChecklist] = useState({
    branding: '',
    cleanliness: '',
    cleanlinessRemarks: '',
    competitorActivity: ''
  });
  
  // State: Evidence & Issues
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [flagIssue, setFlagIssue] = useState(false);
  const [issueDetails, setIssueDetails] = useState({
    title: '', severity: 'Medium', description: ''
  });
  const [issueFile, setIssueFile] = useState(null);
  
  // State: System
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save & offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load draft if exists
    const draft = localStorage.getItem('fieldAuditDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setStoreName(parsed.storeName || '');
        setChecklist(parsed.checklist || {});
        // Note: Files cannot be trivially restored from localStorage without converting to Base64, 
        // so we'll skip file restoration for the basic draft.
      } catch(e) {}
    }

    // Fetch Customers
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/api/crm/customers');
        setCustomers(res.data.customers || res.data);
      } catch (err) {
        console.error('Failed to load customers');
      }
    };
    fetchCustomers();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save draft periodically
  useEffect(() => {
    if (storeName || checklist.branding) {
      localStorage.setItem('fieldAuditDraft', JSON.stringify({
        storeName, checklist, timestamp: Date.now()
      }));
    }
  }, [storeName, checklist]);

  const syncOfflineData = async () => {
    // Basic sync logic (could be expanded to a dedicated background sync)
    const offlineAudits = JSON.parse(localStorage.getItem('offlineAudits') || '[]');
    if (offlineAudits.length > 0) {
      toast.loading(`Syncing ${offlineAudits.length} offline audits...`, { id: 'sync' });
      try {
         await api.post('/api/field-audit/sync', { audits: offlineAudits });
         localStorage.removeItem('offlineAudits');
         toast.success('Offline sync complete!', { id: 'sync' });
      } catch (error) {
         toast.error('Sync failed. Will retry later.', { id: 'sync' });
      }
    }
  };

  const captureLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        toast.success('Location acquired');
      },
      (error) => {
        toast.error('Unable to retrieve location: ' + error.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleStartAudit = async () => {
    if (!storeName) return toast.error('Please enter a store name');
    
    // Auto-capture location if not done manually
    if (!location) {
      captureLocation();
      return; // Will require user to click start again once located
    }

    const checkInData = {
      time: new Date(),
      location: location,
      verified: true // Assuming Ad-hoc is always verified for now. For assigned tasks, compare coords here.
    };
    
    setCheckIn(checkInData);
    toast.success('Audit started successfully');
  };

  const handleEvidenceUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEvidenceFiles(prev => [...prev, ...files]);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!checkIn) return toast.error('You must Start Audit to check-in first.');
    if (!checklist.branding || !checklist.cleanliness || !checklist.competitorActivity) {
       return toast.error('Please complete the Inspection Checklist');
    }
    if (evidenceFiles.length < 2) {
       return toast.error('Minimum 2 site evidence photos required');
    }

    setIsSubmitting(true);

    try {
      // Convert evidence files to Base64 strings for persistent storage
      const evidenceUrls = await Promise.all(
        evidenceFiles.map(async (f) => ({
          url: await convertFileToBase64(f),
          timestamp: new Date(),
          location: location
        }))
      );

      const formattedChecklist = [
        { question: 'Is Store Branding Present?', answer: checklist.branding },
        { question: 'Cleanliness Rating', answer: checklist.cleanliness, remarks: checklist.cleanlinessRemarks },
        { question: 'Competitor Activity Detected?', answer: checklist.competitorActivity }
      ];

      const issues = flagIssue && issueDetails.title ? [{
         ...issueDetails,
         photoUrl: issueFile ? await convertFileToBase64(issueFile) : null
      }] : [];

      const payload = {
        storeName,
        checkIn,
        checklist: formattedChecklist,
        evidence: evidenceUrls,
        issues,
        timeSpentMinutes: Math.round((new Date() - new Date(checkIn.time)) / 60000),
        offlineSyncId: `draft_${Date.now()}`
      };

    } catch (error) {
      setIsSubmitting(false);
      return toast.error('Failed to process images: ' + error.message);
    }

    if (isOffline) {
      // Save locally
      const offlineAudits = JSON.parse(localStorage.getItem('offlineAudits') || '[]');
      offlineAudits.push(payload);
      localStorage.setItem('offlineAudits', JSON.stringify(offlineAudits));
      
      toast.success('Offline mode: Audit saved locally. Will sync when online.');
      resetForm();
    } else {
      // Submit to backend
      try {
        await api.post('/api/field-audit/submit', payload);
        toast.success('Audit Report Submitted Successfully!');
        resetForm();
      } catch (error) {
        toast.error('Submission failed: ' + error.message);
      }
    }
    
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setStoreName('');
    setChecklist({ branding: '', cleanliness: '', cleanlinessRemarks: '', competitorActivity: '' });
    setEvidenceFiles([]);
    setFlagIssue(false);
    setIssueDetails({ title: '', severity: 'Medium', description: '' });
    setIssueFile(null);
    setCheckIn(null);
    localStorage.removeItem('fieldAuditDraft');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
           <AlertTriangle size={24} />
           <div>
              <p className="font-bold text-sm">Offline Mode Active</p>
              <p className="text-xs">Your audits will be saved locally and synchronized automatically when connection is restored.</p>
           </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="bg-indigo-400/10 p-8 border-b border-slate-200 flex gap-6 items-center">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Field Audit Report</h1>
            <p className="text-slate-500 font-medium mt-1">Enter store inspection details and capture site evidence.</p>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white">
          
          {/* Site Details */}
          <div>
            <h3 className="flex items-center gap-2 text-rose-500 font-bold text-lg mb-4">
              <MapPin size={20} /> Site Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-800">Select Client / Site <span className="text-rose-500">*</span></label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const cust = customers.find(c => c._id === e.target.value);
                    setSelectedCustomerId(e.target.value);
                    setStoreName(cust ? `${cust.name} (${cust.company})` : '');
                  }}
                  disabled={checkIn !== null}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-slate-900 disabled:opacity-50 appearance-none shadow-sm"
                >
                  <option value="">-- Choose Client --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} | {c.company} ({c.city || 'No Location'})
                    </option>
                  ))}
                </select>
                {selectedCustomerId && (
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest pl-1 animate-pulse">
                    Verified Customer Profile Linked ✓
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-800">GPS Location</label>
                <button 
                  onClick={captureLocation}
                  disabled={checkIn !== null}
                  className={`w-full px-4 py-3 border rounded-xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 ${
                    location ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MapPin size={18} className={isLocating ? 'animate-bounce' : ''} />
                  {isLocating ? 'Acquiring Signal...' : location ? 'Coordinates Tagged ✓' : 'Tag Coordinates'}
                </button>
              </div>
            </div>

            {/* Check-in Module */}
            <div className="mt-8">
               {!checkIn ? (
                 <button 
                    onClick={handleStartAudit}
                    className="w-full py-4 bg-[#111827] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl transition-all shadow-xl active:scale-[0.98]"
                 >
                    Start Audit (Check-In)
                 </button>
               ) : (
                 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><CheckCircle2 size={24} /></div>
                    <div>
                       <p className="text-sm font-black text-emerald-900">Checked in at: {checkIn.time.toLocaleTimeString()}</p>
                       <p className="text-xs font-bold text-emerald-700">Location Verified ✓ ({location?.lat.toFixed(4)}, {location?.lng.toFixed(4)})</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <hr className="border-slate-100 my-8" />

          {/* Inspection Checklist */}
          <div className={!checkIn ? 'opacity-50 pointer-events-none transition-all' : 'transition-all'}>
            <h3 className="flex items-center gap-2 text-rose-500 font-bold text-lg mb-6">
              <CheckCircle2 size={20} /> Inspection Checklist
            </h3>

            <div className="space-y-6">
              {/* Q1 */}
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                 <p className="font-black text-slate-800 mb-4 text-[15px]">Is Store Branding Present? <span className="text-rose-500">*</span></p>
                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                    {['Yes', 'No'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setChecklist({...checklist, branding: opt})}
                        className={`flex-1 py-3 border rounded-xl font-bold transition-all text-sm ${
                          checklist.branding === opt ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Q2 */}
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                 <p className="font-black text-slate-800 mb-4 text-[15px]">Cleanliness Rating <span className="text-rose-500">*</span></p>
                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                    {['Good', 'Average', 'Poor'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setChecklist({...checklist, cleanliness: opt})}
                        className={`flex-1 py-3 border rounded-xl font-bold transition-all text-sm ${
                          checklist.cleanliness === opt 
                            ? opt === 'Poor' ? 'bg-white border-rose-500 text-rose-700 shadow-sm ring-1 ring-rose-500' : 'bg-white border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
                 {/* Smart Logic Trigger */}
                 {checklist.cleanliness === 'Poor' && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                       <input 
                         type="text" 
                         placeholder="Please explain why cleanliness is poor..."
                         value={checklist.cleanlinessRemarks}
                         onChange={(e) => setChecklist({...checklist, cleanlinessRemarks: e.target.value})}
                         className="w-full px-4 py-3 border border-rose-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium text-slate-800"
                       />
                    </div>
                 )}
              </div>

              {/* Q3 */}
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                 <p className="font-black text-slate-800 mb-4 text-[15px]">Competitor Activity Detected? <span className="text-rose-500">*</span></p>
                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                    {['Yes', 'No'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setChecklist({...checklist, competitorActivity: opt})}
                        className={`flex-1 py-3 border rounded-xl font-bold transition-all text-sm ${
                          checklist.competitorActivity === opt ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Issue Flagging */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${flagIssue ? 'bg-amber-50/50 border-amber-200' : 'bg-orange-50/30 border-orange-100'}`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className={flagIssue ? 'text-amber-500' : 'text-orange-400'} size={24} />
                  <p className="font-bold text-slate-800">Manually Flag an Issue?</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setFlagIssue(true)} className={`px-6 py-2 rounded-lg font-bold border ${flagIssue ? 'bg-white border-amber-400 text-amber-700 shadow-sm ring-1 ring-amber-400' : 'bg-white border-slate-200 text-slate-500'}`}>Yes</button>
                   <button onClick={() => setFlagIssue(false)} className={`px-6 py-2 rounded-lg font-bold border ${!flagIssue ? 'bg-white border-indigo-400 text-indigo-700 shadow-sm ring-1 ring-indigo-400' : 'bg-slate-200/50 border-slate-200 text-slate-400'}`}>No</button>
                </div>
             </div>

             {flagIssue && (
               <div className="mt-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Issue Title</label>
                    <input type="text" value={issueDetails.title} onChange={e => setIssueDetails({...issueDetails, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="e.g. Broken Display" />
                  </div>
                  <div grid-cols-1 sm:grid-cols-2>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Severity</label>
                      <select value={issueDetails.severity} onChange={e => setIssueDetails({...issueDetails, severity: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700">
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High (Critical)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Attach Proof (Optional)</label>
                      <input type="file" onChange={e => setIssueFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Description</label>
                    <textarea value={issueDetails.description} onChange={e => setIssueDetails({...issueDetails, description: e.target.value})} rows="2" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Details..."></textarea>
                  </div>
               </div>
             )}
          </div>

          <hr className="border-slate-100" />

          {/* Site Evidence */}
          <div className={!checkIn ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="flex items-center gap-2 text-rose-500 font-bold text-lg mb-6">
              <Camera size={20} /> Site Evidence
            </h3>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden group">
               <input 
                 type="file" 
                 multiple 
                 accept="image/*" 
                 capture="environment" 
                 onChange={handleEvidenceUpload}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <UploadCloud size={48} className="text-indigo-400 group-hover:scale-110 transition-transform mb-4" />
               <p className="font-bold text-slate-700"><span className="text-rose-500">Tap to Camera</span> or Upload Images</p>
               <p className="text-xs font-medium text-slate-500 mt-2">JPG, PNG (Min 2 required)</p>
            </div>

            {evidenceFiles.length > 0 && (
              <div grid-cols-1 sm:grid-cols-2>
                {evidenceFiles.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                     <img src={URL.createObjectURL(f)} alt="evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[8px] font-black text-white">{new Date().toLocaleTimeString()}</p>
                        <p className="text-[8px] font-black text-white/80">{location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'No GPS'}</p>
                     </div>
                     <button 
                       onClick={() => setEvidenceFiles(prev => prev.filter((_, idx) => idx !== i))}
                       className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                     >
                       <X size={12} />
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-8">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !checkIn}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Audit Report <ChevronRight size={20} /></>
              )}
            </button>
            <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
               {isOffline ? 'Will save to local encrypted vault' : 'Requires active internet connection'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FieldAudit;
