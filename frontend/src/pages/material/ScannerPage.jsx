import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  ArrowLeft, 
  Scan, 
  Search, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [manualId, setManualId] = useState('');
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    let scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 300, height: 300 },
      fps: 15,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(result) {
      scanner.clear();
      setScanResult(result);
      toast.success('Resource Identity Locked');
      
      setTimeout(() => {
        navigate(`/inventory/list?search=${result}`);
      }, 1000);
    }

    function onScanError(err) {
      // Silently continue
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [navigate]);

  const handleManualSearch = () => {
    if (!manualId) return toast.error('Please enter a Material ID');
    navigate(`/inventory/list?search=${manualId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col">
       <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Vision Intelligence</h2>
            <p className="text-slate-500 font-medium">Scan any Material QR Passport or Barcode for instant access.</p>
          </div>
       </div>

       <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-slate-800 flex flex-col items-center justify-center p-8">
             <div id="reader" className="w-full h-full overflow-hidden rounded-3xl border-2 border-primary-500/20 bg-slate-950"></div>
             
             {!scanResult && (
               <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center space-y-4">
                  <div className="w-64 h-64 border-2 border-primary-400/30 rounded-3xl relative">
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl"></div>
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl"></div>
                     <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl"></div>
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl"></div>
                     <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-500/50 animate-scanner-scan shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                  </div>
                  <p className="px-6 py-2 bg-primary-600/20 backdrop-blur-md rounded-full text-primary-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 border border-primary-500/30">
                     <Zap size={14} className="animate-pulse" /> Alignment active
                  </p>
               </div>
             )}

             {scanResult && (
               <div className="absolute inset-0 bg-primary-600/95 flex flex-col items-center justify-center text-white z-20 space-y-6 text-center p-10">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                     <Scan size={40} />
                  </div>
                  <div>
                     <h3 className="text-4xl font-black tracking-tight mb-2 uppercase">Identity Locked</h3>
                     <p className="font-mono text-xl opacity-80">{scanResult}</p>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Redirecting to Stock Ledger...</p>
               </div>
             )}
          </div>

          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                <h4 className="font-black uppercase tracking-widest text-[11px] text-slate-400 flex items-center gap-2">
                   <AlertTriangle size={14} className="text-amber-500" />
                   Scanning protocol
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                   Point the camera at any SMTBMS generated tag. Ensure proper lighting for high-speed identification.
                </p>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h4 className="font-black uppercase tracking-widest text-[11px] text-slate-400 flex items-center gap-2">
                   <Search size={14} className="text-primary-500" />
                   Manual override
                </h4>
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Type Resource ID</p>
                   <input 
                     type="text"
                     value={manualId}
                     onChange={(e) => setManualId(e.target.value)}
                     placeholder="e.g. MAT-8829"
                     className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-mono"
                   />
                </div>
                <button 
                  onClick={handleManualSearch}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                >
                   Locate Material
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ScannerPage;
