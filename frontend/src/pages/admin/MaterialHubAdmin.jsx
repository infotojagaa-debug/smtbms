import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Activity, ShieldCheck, Database, 
  Cpu, Zap, Send, Save, AlertTriangle, 
  CheckCircle2, Clock, Info, ArrowDownLeft,
  ChevronRight, RefreshCw, Layers, Terminal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import socketService from '../../utils/socketService';

const MaterialHubAdmin = () => {
  // --- STATE CORE ---
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState({
    totalAvailableStock: 0,
    todayGlobalConsumption: 0,
    totalPendingRequests: 0,
    systemStatus: 'Syncing...'
  });
  const [activityStream, setActivityStream] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef(null);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    hardwareNode: '',
    materialId: '',
    quantity: '',
    justification: ''
  });

  const [validationHint, setValidationHint] = useState(null);

  // --- SYSTEM NODES (Hardware Mocks) ---
  const operationalNodes = [
    { id: 'NODE-01', label: 'Primary Extraction Bay', status: 'Active' },
    { id: 'NODE-02', label: 'Secondary Assembly Line', status: 'Active' },
    { id: 'NODE-03', label: 'Site Bravo - Storage', status: 'Offline' },
    { id: 'NODE-04', label: 'R&D Lab Alpha', status: 'Active' },
  ];

  // --- TELEMETRY FETCH ---
  const fetchTelemetry = async () => {
    try {
      const [matRes, statsRes, usageRes] = await Promise.all([
        api.get('/api/materials'),
        api.get('/api/materials/activity/admin-stats'),
        api.get('/api/materials/activity/usage')
      ]);
      setMaterials(matRes.data.materials || []);
      setStats(statsRes.data);
      setActivityStream(usageRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('System Pulse Failed:', err);
      setStats(prev => ({ ...prev, systemStatus: 'Offline' }));
      toast.error('Strategic Telemetry Offline');
    }
  };

  useEffect(() => {
    fetchTelemetry();

    // Socket Synchronization
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('inventory:update', (data) => {
        setMaterials(prev => prev.map(m => m._id === data.materialId ? { ...m, quantity: data.newQuantity } : m));
        setStats(prev => ({ ...prev, totalAvailableStock: prev.totalAvailableStock + (data.delta || 0) })); // Simplified delta logic
      });

      socket.on('usage:new', (newUsage) => {
        setActivityStream(prev => [newUsage, ...prev].slice(0, 50));
        setStats(prev => ({ 
            ...prev, 
            todayGlobalConsumption: prev.todayGlobalConsumption + newUsage.quantityUsed 
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('inventory:update');
        socket.off('usage:new');
      }
    };
  }, []);

  // --- LOGIC: VALIDATION HINT ---
  useEffect(() => {
    if (formData.materialId && formData.quantity) {
      const selected = materials.find(m => m._id === formData.materialId);
      if (selected) {
        const remaining = selected.quantity - Number(formData.quantity);
        setValidationHint({
          remaining,
          status: remaining < 0 ? 'crit' : (remaining < (selected.minStockLevel || 10) ? 'warn' : 'ok')
        });
      }
    } else {
      setValidationHint(null);
    }
  }, [formData.materialId, formData.quantity, materials]);

  // --- ACTIONS ---
  const handleExecute = async (e) => {
    e.preventDefault();
    if (!formData.materialId || !formData.quantity) return toast.error('Incomplete Directives');
    
    try {
      setIsExecuting(true);
      await api.post('/api/materials/activity/usage', {
        materialId: formData.materialId,
        quantityUsed: Number(formData.quantity),
        purpose: `ADMIN_OVERRIDE: ${formData.hardwareNode} - ${formData.justification}`
      });
      
      toast.success('Operational Directive Executed');
      setFormData({ hardwareNode: '', materialId: '', quantity: '', justification: '' });
      fetchTelemetry(); // Re-sync stats
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution Failure');
    } finally {
      setIsExecuting(false);
    }
  };

  const StatCard = ({ label, value, icon: Icon, colorClass, status }) => (
    <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-lg text-white ${colorClass}`}>
             <Icon size={20} />
          </div>
          {status && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'Online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-xs font-semibold text-slate-600">{status}</span>
            </div>
          )}
       </div>
       <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
       <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );

  if (loading) return (
     <div className="h-full flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center animate-pulse">
                <Terminal className="text-indigo-600" size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500">Initializing Control Plane...</p>
        </div>
     </div>
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. TOP TELEMETRY HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Inventory" value={stats.totalAvailableStock} icon={Database} colorClass="bg-blue-500" />
        <StatCard label="Global Consumption Today" value={stats.todayGlobalConsumption} icon={Zap} colorClass="bg-amber-500" />
        <StatCard label="Pending Requisitions" value={stats.totalPendingRequests} icon={Clock} colorClass="bg-indigo-500" />
        <StatCard label="System Status" value={stats.systemStatus} icon={Activity} colorClass="bg-emerald-500" status={stats.systemStatus} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        
        {/* 2. SMART EXECUTION SYSTEM */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col h-full shadow-sm">
              <div className="mb-8 flex justify-between items-start">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">
                       Execution Core
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Matrix Direct Provisioning Node</p>
                 </div>
                 <div className="hidden md:flex gap-4">
                    <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 flex items-center gap-2">
                        <Cpu size={14} />
                        <span className="text-xs font-semibold">Active Auth</span>
                    </div>
                 </div>
              </div>

              <form onSubmit={handleExecute} className="space-y-6 flex-1 flex flex-col">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Node Selector */}
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-700">Hardware Target</label>
                       <div className="relative group">
                          <select 
                            value={formData.hardwareNode}
                            onChange={(e) => setFormData({...formData, hardwareNode: e.target.value})}
                            className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 font-medium appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                          >
                             <option value="" disabled>Select Operational Node</option>
                             {operationalNodes.map(node => (
                               <option key={node.id} value={node.id}>{node.label} [{node.id}]</option>
                             ))}
                          </select>
                          <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                       </div>
                    </div>

                    {/* Material Selector */}
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-700">Material SKU</label>
                       <div className="relative group">
                          <select 
                            value={formData.materialId}
                            onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                            className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 font-medium appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                          >
                             <option value="" disabled>Select Inventory Unit</option>
                             {materials.map(m => (
                               <option key={m._id} value={m._id}>{m.name} [{m.quantity} Unit Available]</option>
                             ))}
                          </select>
                          <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Quantity Input */}
                    <div className="md:col-span-4 space-y-2">
                       <label className="text-sm font-semibold text-slate-700">Allocation Quantity</label>
                       <input 
                         type="number"
                         placeholder="0"
                         value={formData.quantity}
                         onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                         className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-lg font-bold text-indigo-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                       />
                    </div>

                    {/* Justification Area */}
                    <div className="md:col-span-8 space-y-2">
                       <label className="text-sm font-semibold text-slate-700">Operational Justification</label>
                       <div className="relative">
                          <input 
                            type="text"
                            placeholder="Enter requisition context..."
                            value={formData.justification}
                            onChange={(e) => setFormData({...formData, justification: e.target.value})}
                            className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                          />
                          <Terminal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       </div>
                    </div>
                 </div>

                 {/* Validation Hint */}
                 {validationHint && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                        validationHint.status === 'crit' 
                        ? 'bg-rose-50 border-rose-200 text-rose-700' 
                        : (validationHint.status === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                    }`}>
                        {validationHint.status === 'crit' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                        <div>
                            <span className="text-xs font-bold block opacity-80">Inventory Forecast</span>
                            <p className="text-sm">
                                {validationHint.status === 'crit' 
                                    ? `STRATEGIC ERROR: Allocation exceeds total available stock by ${Math.abs(validationHint.remaining)} units.`
                                    : `Post-Allocation Balance: ${validationHint.remaining} units remaining.`}
                            </p>
                        </div>
                    </div>
                 )}

                 <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-auto">
                    <button 
                      type="submit"
                      disabled={isExecuting || (validationHint && validationHint.status === 'crit')}
                      className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                       {isExecuting ? <RefreshCw size={20} className="animate-spin" /> : <>Execute Directives <ArrowDownLeft size={18} /></>}
                    </button>
                    <button 
                      type="button" 
                      className="px-6 h-12 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                       Save Draft <Save size={18} />
                    </button>
                 </div>
              </form>
           </div>
        </div>

        {/* 3. LIVE FEEDBACK & ACTIVITY LEDGER */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           {/* Progress Panel */}
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Activity size={16} className="text-indigo-500" /> Flux Pulse
              </h3>
              <div className="space-y-4">
                  {materials.slice(0, 3).map(m => {
                    const perc = Math.min((m.quantity / 200) * 100, 100); 
                    return (
                        <div key={m._id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-600">
                                <span>{m.name}</span>
                                <span className={perc < 20 ? 'text-rose-600' : ''}>{m.quantity} Unit</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${perc < 20 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${perc}%` }} />
                            </div>
                        </div>
                    );
                  })}
              </div>
           </div>

           {/* Global Matrix Ledger */}
           <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col min-h-0 shadow-sm">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={16} className="text-indigo-500" /> Matrix Ledger
                 </h3>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-slate-500">Live Stream</span>
                 </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                 {activityStream.map((log, i) => (
                    <div key={i} className="bg-white hover:bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-all cursor-default">
                       <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${log.quantityUsed ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {log.quantityUsed ? <ArrowDownLeft size={16} /> : <Package size={16} />}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-900 truncate">{log.materialId?.name}</span>
                                <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.quantityUsed ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-indigo-700 bg-indigo-50 border border-indigo-200'}`}>
                                    {log.quantityUsed ? `Consumed: ${log.quantityUsed}` : 'Request: Init'}
                                </span>
                                <span className="text-xs text-slate-500 truncate">
                                    {log.purpose?.split('ADMIN_OVERRIDE:')[1] || 'Standard'}
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialHubAdmin;
