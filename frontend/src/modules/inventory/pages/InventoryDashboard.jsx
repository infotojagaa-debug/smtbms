import React, { useState, useEffect } from 'react';
import { getItems, getStockHistory } from '../api/inventoryApi';
import { Package, AlertTriangle, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });

  useEffect(() => {
    Promise.all([getItems(), getStockHistory()]).then(([itemsData, historyData]) => {
      setItems(itemsData);
      setHistory(historyData);
      
      const low = itemsData.filter(i => i.status === 'LOW STOCK').length;
      const out = itemsData.filter(i => i.status === 'OUT OF STOCK').length;
      setStats({ total: itemsData.length, lowStock: low, outOfStock: out });
    }).catch(console.error);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inventory Command Center</h1>
          <p className="text-slate-500 mt-1">Real-time ATUM-level material tracking and stock logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Materials</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Out of Stock</p>
            <p className="text-2xl font-bold text-rose-600">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Stock Activity</h2>
          <div className="space-y-4">
            {history.slice(0, 5).map(log => (
              <div key={log._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${log.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {log.type === 'IN' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{log.materialId?.name || 'Unknown Item'}</p>
                    <p className="text-sm text-slate-500">By {log.handledBy?.name || 'System'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.type === 'IN' ? '+' : '-'}{log.quantity}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(log.date).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="text-slate-500 text-center py-4">No recent stock movements.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Critical Items</h2>
          <div className="space-y-4">
            {items.filter(i => i.status !== 'IN STOCK').slice(0, 5).map(item => (
              <div key={item._id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500 cursor-pointer">Ref: {item._id.substring(0, 8)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.status === 'OUT OF STOCK' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.stockQuantity} / {item.minStockLevel} {item.unit}
                </span>
              </div>
            ))}
            {items.filter(i => i.status !== 'IN STOCK').length === 0 && (
              <p className="text-sm text-emerald-600 font-medium bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                All materials are sufficiently stocked.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
