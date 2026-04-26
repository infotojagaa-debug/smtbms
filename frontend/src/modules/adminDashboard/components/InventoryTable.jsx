const InventoryTable = ({ stockData }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="pb-4 text-xs font-bold text-slate-400 font-sans border-b border-slate-100">Item</th>
              <th className="pb-4 text-xs font-bold text-slate-400 font-sans border-b border-slate-100">SKU</th>
              <th className="pb-4 text-xs font-bold text-slate-400 font-sans border-b border-slate-100 text-center">Quantity</th>
              <th className="pb-4 text-xs font-bold text-slate-400 font-sans border-b border-slate-100 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item, index) => (
              <tr key={item.id} className="group">
                <td className="py-4 text-sm font-bold text-[#2B3674] border-b border-slate-50 group-last:border-0">{item.name}</td>
                <td className="py-4 text-sm font-bold text-slate-500 border-b border-slate-50 group-last:border-0">{item.sku}</td>
                <td className="py-4 text-sm font-bold text-[#2B3674] border-b border-slate-50 group-last:border-0 text-center">{item.quantity}</td>
                <td className="py-4 border-b border-slate-50 group-last:border-0 relative">
                  <div className="flex justify-center">
                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${item.status === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
