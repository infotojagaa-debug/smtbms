import React, { useState, useEffect } from 'react';
import { getItems, addStock, removeStock } from '../api/inventoryApi';
import { PackagePlus, PackageMinus, Save } from 'lucide-react';

const StockManagement = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ materialId: '', quantity: '', notes: '', type: 'IN' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    getItems().then(setItems).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialId || !formData.quantity || formData.quantity <= 0) {
      setMessage({ text: 'Please select a material and enter a valid quantity.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      if (formData.type === 'IN') {
        await addStock(formData);
        setMessage({ text: 'Stock added successfully.', type: 'success' });
      } else {
        await removeStock(formData);
        setMessage({ text: 'Stock removed successfully.', type: 'success' });
      }
      setFormData({ ...formData, quantity: '', notes: '' }); // reset only form data
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Transaction failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Stock Adjustment</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'IN'})}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'IN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
            >
              <PackagePlus size={32} />
              <span className="font-bold">Stock In (Receive)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'OUT'})}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'OUT' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
            >
              <PackageMinus size={32} />
              <span className="font-bold">Stock Out (Dispense)</span>
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Material</label>
              <select 
                value={formData.materialId}
                onChange={e => setFormData({...formData, materialId: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 bg-slate-50"
              >
                <option value="">-- Choose Item --</option>
                {items.map(i => (
                  <option key={i._id} value={i._id}>{i.name} (Current Stock: {i.stockQuantity} {i.unit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity Adjustment</label>
              <input 
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 bg-slate-50"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Notes</label>
              <input 
                type="text"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 bg-slate-50"
                placeholder="Reason for adjustment (e.g. Received PO-102)"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Processing...' : 'Confirm Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockManagement;
