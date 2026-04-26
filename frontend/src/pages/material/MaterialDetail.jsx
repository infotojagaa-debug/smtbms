import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterialById, fetchHistory, reset } from '../../redux/slices/materialSlice';
import { 
  ArrowLeft, 
  Download, 
  History, 
  MapPin, 
  Package, 
  Truck, 
  User, 
  Calendar,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMaterial, movementHistory, isLoading } = useSelector((state) => state.material);

  useEffect(() => {
    dispatch(fetchMaterialById(id));
    dispatch(fetchHistory(id));
    return () => dispatch(reset());
  }, [dispatch, id]);

  const downloadImage = (base64Data, filename) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    link.click();
    toast.success(`${filename} download started`);
  };

  if (isLoading || !selectedMaterial) {
    return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-xs">Accessing Ledger...</div>;
  }

  const isLowStock = selectedMaterial.quantity <= selectedMaterial.minStockLevel;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedMaterial.name}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{selectedMaterial.code}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all">
             <ArrowRightLeft size={18} />
             Transfer Stock
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10 relative overflow-hidden">
              {isLowStock && (
                <div className="absolute top-0 right-0 px-8 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-2">
                   <AlertTriangle size={12} /> Low Stock Alert
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Stock Level</p>
                    <h4 className={`text-3xl font-black ${isLowStock ? 'text-red-500' : 'text-slate-900'}`}>{selectedMaterial.quantity} <span className="text-sm text-slate-400">{selectedMaterial.unit}</span></h4>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Category</p>
                    <h4 className="text-lg font-bold text-slate-900">{selectedMaterial.category}</h4>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Department</p>
                    <h4 className="text-lg font-bold text-slate-900">{selectedMaterial.department}</h4>
                 </div>
              </div>

              <div className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                       <MapPin size={18} className="text-slate-300" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Storage Location</p>
                          <p className="font-bold">{selectedMaterial.location || 'Not Specified'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                       <Truck size={18} className="text-slate-300" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Preferred Supplier</p>
                          <p className="font-bold">{selectedMaterial.supplierName || 'System Default'}</p>
                       </div>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-slate-400 uppercase tracking-widest">Min threshold</span>
                       <span className="text-slate-900">{selectedMaterial.minStockLevel} {selectedMaterial.unit}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                       <div className="bg-primary-500 h-full" style={{ width: `${Math.min(100, (selectedMaterial.quantity / selectedMaterial.minStockLevel) * 50)}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Movement History */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                   <History size={16} className="text-primary-500" />
                   Movement History
                 </h4>
              </div>
              <div className="p-8 space-y-6">
                 {movementHistory.length === 0 ? (
                    <p className="text-center text-slate-400 italic py-10">No movements recorded yet.</p>
                 ) : movementHistory.map((move, idx) => (
                    <div key={move._id} className="flex gap-6 relative">
                       {idx !== movementHistory.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100"></div>}
                       <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                          <ArrowRightLeft size={18} />
                       </div>
                       <div className="flex-1 pb-8">
                          <div className="flex justify-between items-start mb-1">
                             <p className="font-black text-slate-900 text-sm italic underline decoration-primary-200 underline-offset-4">{move.fromDepartment} → {move.toDepartment}</p>
                             <span className="text-[10px] font-bold text-slate-400">{new Date(move.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mb-3">Transferred {move.quantity} units — "{move.reason}"</p>
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 w-fit px-2 py-0.5 rounded-lg border border-slate-100">
                             <User size={10} /> {move.movedBy?.name}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Tags & Actions */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center space-y-8">
              <div className="space-y-4 w-full text-center">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Material QR Passport</p>
                 <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 group relative cursor-pointer mx-auto w-fit overflow-hidden">
                    <img src={selectedMaterial.qrCode} alt="QR Code" className="w-48 h-48 object-contain mix-blend-multiply" />
                    <button 
                      onClick={() => downloadImage(selectedMaterial.qrCode, `${selectedMaterial.code}_QR.png`)}
                      className="absolute inset-0 bg-primary-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
                    >
                       <Download size={24} />
                       Download Tag
                    </button>
                 </div>
              </div>

              <div className="space-y-4 w-full text-center">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Universal Barcode</p>
                 <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 group relative cursor-pointer mx-auto w-fit overflow-hidden">
                    <img src={selectedMaterial.barcodeImage} alt="Barcode" className="max-w-[200px] object-contain mix-blend-multiply" />
                    <button 
                      onClick={() => downloadImage(selectedMaterial.barcodeImage, `${selectedMaterial.code}_Barcode.png`)}
                      className="absolute inset-0 bg-slate-900/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
                    >
                       <Download size={24} />
                       Download Code
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500 opacity-20 blur-3xl"></div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                 <Calendar size={18} className="text-primary-400" />
                 Ledger Activity
              </h4>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Added to System</span>
                    <span className="font-mono">{new Date(selectedMaterial.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Last Updated</span>
                    <span className="font-mono">{new Date(selectedMaterial.updatedAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
