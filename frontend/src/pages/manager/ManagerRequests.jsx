import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import api from '../../utils/api';
import { 
  PackageOpen, CheckCircle2, XCircle, Search, Clock, 
  FileText, Users, Building2, Filter, Plus, Truck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManagerRequests = () => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [newReq, setNewReq] = useState({
    requestType: 'internal',
    materialId: '',
    customerId: '',
    clientName: '',
    quantityRequested: '',
    reason: ''
  });

  // Load customers from Redux (same as CustomerList page — auth guaranteed)
  useEffect(() => { dispatch(fetchCustomers()); }, [dispatch]);

  const fetchRequests = async () => {
    try {
      // Load requests and usage — these MUST succeed to show the list
      const [reqsRes, usageRes] = await Promise.all([
        api.get('/api/materials/activity/requests'),
        api.get('/api/materials/activity/usage'),
      ]);

      const reqs = Array.isArray(reqsRes.data) ? reqsRes.data : [];
      const usages = (Array.isArray(usageRes.data) ? usageRes.data : []).map(u => ({
        ...u,
        quantityRequested: u.quantityUsed,
        reason: u.purpose,
        status: 'Consumed (Direct)',
        requestType: 'internal'
      }));
      const combined = [...reqs, ...usages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(combined);
    } catch (err) {
      toast.error('Failed to load requisitions');
    }

    // Load customers and materials separately — non-blocking
    try {
      const matRes = await api.get('/api/materials');
      setMaterials(Array.isArray(matRes.data) ? matRes.data : (matRes.data?.materials || []));
    } catch (err) {
      console.warn('Could not load materials list:', err.message);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleReview = async (id, status) => {
    try {
      const res = await api.put(`/api/materials/activity/request/${id}/review`, {
        status,
        reviewNotes: `Manager marked as ${status} at ${new Date().toLocaleTimeString()}`
      });
      toast.success(res.data.message);
      if (res.data.purchaseTriggered) {
        toast("Stock low — Purchase Order auto-drafted!", { icon: '📝', duration: 4000 });
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      const res = await api.put(`/api/materials/activity/request/${id}/deliver`, {
        deliveryNote: `Confirmed delivered by ${new Date().toLocaleString()}`
      });
      toast.success('✅ Marked as Delivered — Client received the material!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as delivered');
    }
  };

  const handleSubmitNew = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    // Validate required fields
    if (!newReq.materialId) { toast.error('Please select a material'); return; }
    if (!newReq.quantityRequested || newReq.quantityRequested < 1) { toast.error('Please enter a valid quantity'); return; }
    if (!newReq.reason.trim()) { toast.error('Please provide a reason'); return; }
    if (newReq.requestType === 'external' && !newReq.customerId && !newReq.clientName.trim()) {
      toast.error('Please select a client or type a client name'); return;
    }

    try {
      // If external, get client name from customer list if selected
      let clientName = newReq.clientName;
      if (newReq.requestType === 'external' && newReq.customerId) {
        const cust = customers.find(c => c._id === newReq.customerId);
        clientName = cust?.name || cust?.company || clientName;
      }

      await api.post('/api/materials/activity/request', {
        ...newReq,
        clientName
      });
      toast.success('Requisition submitted successfully!');
      setShowNewForm(false);
      setNewReq({ requestType: 'internal', materialId: '', customerId: '', clientName: '', quantityRequested: '', reason: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      !searchTerm ||
      r.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.materialId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerId?.company?.toLowerCase().includes(searchTerm.toLowerCase());

    // Old DB records may not have requestType — treat them as 'internal'
    const recordType = r.requestType || 'internal';
    const matchesType = filterType === 'all' || recordType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 fade-up">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Resource Requisitions</h2>
          <p className="font-medium text-slate-500">Manage material requests for internal team & external clients.</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-600 transition-all shadow-lg"
        >
          <Plus size={16} /> New Requisition
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Internal / External Filter */}
        <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm gap-1">
          {[
            { id: 'all', label: 'All Requests', icon: Filter },
            { id: 'internal', label: 'Internal Use', icon: Users },
            { id: 'external', label: 'External Client', icon: Building2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterType === tab.id 
                  ? tab.id === 'internal' ? 'bg-blue-600 text-white shadow-md' 
                  : tab.id === 'external' ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:border-primary-300 transition-colors flex-1 min-w-[240px] items-center gap-3 shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee, client, or material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full"
          />
        </div>
      </div>

      {/* New Requisition Form Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="px-8 pt-7 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black italic uppercase text-slate-900">New Requisition</h3>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-8 py-5 space-y-5">
              {/* Internal / External Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewReq({...newReq, requestType: 'internal', customerId: '', clientName: ''})}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    newReq.requestType === 'internal' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                    newReq.requestType === 'internal' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}><Users size={15} /></div>
                  <p className="font-black text-sm text-slate-900">Internal Use</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Employee / Team</p>
                </button>
                <button
                  onClick={() => setNewReq({...newReq, requestType: 'external'})}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    newReq.requestType === 'external' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                    newReq.requestType === 'external' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}><Building2 size={15} /></div>
                  <p className="font-black text-sm text-slate-900">External Client</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Client / Customer</p>
                </button>
              </div>

              <form onSubmit={handleSubmitNew}>
              {/* External Client Section */}
              {newReq.requestType === 'external' && (
                <div className="space-y-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Client / Customer</label>
                  <select
                    value={newReq.customerId}
                    onChange={(e) => setNewReq({...newReq, customerId: e.target.value})}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 outline-none"
                  >
                    <option value="">— Select Existing Client —</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name || c.company} {c.company && c.name ? `(${c.company})` : ''}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or type client name manually..."
                    value={newReq.clientName}
                    onChange={(e) => setNewReq({...newReq, clientName: e.target.value})}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material</label>
                <select
                  required
                  value={newReq.materialId}
                  onChange={(e) => setNewReq({...newReq, materialId: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold focus:border-slate-900 outline-none"
                >
                  <option value="">— Select Material —</option>
                  {materials.map(m => (
                    <option key={m._id} value={m._id}>{m.name} (Stock: {m.quantity} {m.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</label>
                <input
                  required type="number" min="1"
                  placeholder="How many units?"
                  value={newReq.quantityRequested}
                  onChange={(e) => setNewReq({...newReq, quantityRequested: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold focus:border-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason / Notes</label>
                <textarea
                  required
                  placeholder="Why is this needed?"
                  value={newReq.reason}
                  onChange={(e) => setNewReq({...newReq, reason: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold focus:border-slate-900 outline-none resize-none"
                  rows={2}
                />
              </div>
              </form>
            </div>{/* end scrollable body */}

            {/* Fixed Footer Buttons */}
            <div className="px-8 pb-6 pt-4 border-t border-slate-100 flex gap-3">
              <button type="button" onClick={() => setShowNewForm(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs rounded-xl hover:text-slate-900 transition-all">
                Cancel
              </button>
              <button type="button" onClick={handleSubmitNew}
                className="flex-[2] py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary-600 transition-all shadow-lg">
                Submit Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 border-b-2 border-slate-100 z-10">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / For</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Requester / Client Column */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-primary-400 flex items-center justify-center font-black text-sm">
                        {(req.requestType === 'external' || req.clientName) 
                          ? (req.clientName?.charAt(0) || req.customerId?.name?.charAt(0) || 'C')
                          : (req.employeeId?.name?.charAt(0) || '?')}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">
                          {(req.requestType === 'external' || req.clientName)
                            ? (req.clientName || req.customerId?.name || req.customerId?.company || 'Client')
                            : (req.employeeId?.name || 'Internal Request')}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                          {(req.requestType === 'external' || req.clientName) ? 'Client Requester' : (req.employeeId?.role || 'Staff')}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Context / Type Column */}
                  <td className="px-8 py-5">
                    {(req.requestType === 'external' || req.clientName || req.customerId?.name || req.customerId?.company) ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-[8px] font-black uppercase tracking-widest">
                          <Building2 size={8} /> External Client
                        </span>
                        {req.employeeId && (
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            Processed by: {req.employeeId.name}
                          </p>
                        )}
                        {req.customerId?.company && (
                          <p className="text-[9px] text-slate-400">{req.customerId.company}</p>
                        )}
                        {req.customerId?.phone && (
                          <p className="text-[9px] text-slate-400 font-medium">Tel: {req.customerId.phone}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-[8px] font-black uppercase tracking-widest">
                          <Users size={8} /> Internal Use
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Material */}
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-700 text-sm">{req.materialId?.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">Code: {req.materialId?.code}</p>
                    <p className="text-[10px] font-black text-emerald-600 mt-1">Stock: {req.materialId?.quantity}</p>
                  </td>

                  {/* Volume */}
                  <td className="px-8 py-5 text-right font-black text-slate-900 text-lg">
                    {req.quantityRequested}
                  </td>

                  {/* Reason */}
                  <td className="px-8 py-5 max-w-[200px]">
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-600 line-clamp-2">{req.reason}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-8 py-5 text-center">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        req.status === 'Delivered'      ? 'bg-teal-50 text-teal-600 border-teal-100' :
                        req.status === 'Approved'       ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        req.status === 'Rejected'       ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        req.status === 'Consumed (Direct)' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {req.status === 'Pending'           && <Clock size={10} />}
                        {req.status === 'Approved'          && <CheckCircle2 size={10} />}
                        {req.status === 'Delivered'         && <Truck size={10} />}
                        {req.status === 'Consumed (Direct)' && <CheckCircle2 size={10} />}
                        {req.status}
                      </span>
                      {req.status === 'Delivered' && req.deliveredAt && (
                        <p className="text-[9px] text-teal-500 font-bold">
                          {new Date(req.deliveredAt).toLocaleDateString()} {new Date(req.deliveredAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-5 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(req._id, 'Approved')}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white p-2 rounded-xl transition-all border border-emerald-100 hover:border-emerald-500"
                          title="Approve — This will deduct stock"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => handleReview(req._id, 'Rejected')}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white p-2 rounded-xl transition-all border border-rose-100 hover:border-rose-500"
                          title="Reject Request"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : req.status === 'Approved' ? (
                      // Approved — show Mark Delivered button for external, reviewed for internal
                      <div className="flex items-center justify-end gap-2">
                        {(req.requestType === 'external' || req.clientName) && (
                          <button
                            onClick={() => handleMarkDelivered(req._id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white rounded-xl transition-all border border-teal-100 hover:border-teal-500 text-[10px] font-black uppercase tracking-widest"
                            title="Confirm client received the material"
                          >
                            <Truck size={14} /> Delivered
                          </button>
                        )}
                        {!req.clientName && req.requestType !== 'external' && (
                          <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Reviewed</span>
                        )}
                      </div>
                    ) : req.status === 'Delivered' ? (
                      <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest flex items-center gap-1 justify-end">
                        <Truck size={12} /> Delivered
                      </span>
                    ) : req.status === 'Consumed (Direct)' ? (
                      <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest">Auto-logged</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-8 py-16 text-center text-slate-400">
                    <PackageOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">No requisitions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerRequests;
