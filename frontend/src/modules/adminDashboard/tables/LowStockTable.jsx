import { AlertCircle } from 'lucide-react';

const LowStockTable = ({ data }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Item</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">SKU</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Quantity</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-3 border-b border-slate-50 group-last:border-0 pl-2">
                  <span className="text-sm font-bold text-slate-800">{item.name}</span>
                </td>
                <td className="py-3 border-b border-slate-50 group-last:border-0">
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.sku}</span>
                </td>
                <td className="py-3 border-b border-slate-50 group-last:border-0 text-center">
                  <span className="text-sm font-black text-rose-500 tabular-nums">{item.quantity}</span>
                  <span className="text-xs font-semibold text-slate-400 ml-1">/ {item.minLevel}</span>
                </td>
                <td className="py-3 border-b border-slate-50 group-last:border-0 pr-2 relative text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <AlertCircle size={12} strokeWidth={3} />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-6 text-center text-slate-400 text-sm font-medium">
             No low stock alerts detected.
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockTable;
