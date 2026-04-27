import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterials, reset, deleteMaterial } from '../../redux/slices/materialSlice';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  ArrowRightLeft, 
  Eye, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const MaterialList = () => {
  const dispatch = useDispatch();
  const { materials, totalPages, currentPage, isLoading } = useSelector((state) => state.material);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    department: '',
    stockStatus: '',
    page: 1
  });

  useEffect(() => {
    dispatch(fetchMaterials(filters));
  }, [dispatch, filters]);

  const handleExport = () => {
    if (materials.length === 0) return toast.error('No data to export');
    
    const exportData = materials.map(m => ({
      'Code': m.code,
      'Name': m.name,
      'Category': m.category,
      'Department': m.department,
      'Quantity': m.quantity,
      'Unit': m.unit,
      'Location': m.location,
      'Supplier': m.supplierName
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel report generated');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to deactivate this material?')) {
      dispatch(deleteMaterial(id));
      toast.success('Material deactivated');
    }
  };

  const getStatusBadge = (qty, min) => {
    if (qty === 0) return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-widest">Out of Stock</span>;
    if (qty <= min) return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest">Low Stock</span>;
    return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">In Stock</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Company Stock List</h2>
          <p className="text-slate-500 font-medium mt-1">Monitor available stock levels and manage master data.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} /> Export
          </button>
          <Link 
            to="/inventory/add" 
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all"
          >
            <Plus size={20} /> Add Material
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl border border-slate-200 w-full md:w-[400px] shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by code or name..." 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm font-bold"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              />
           </div>
           
           <div className="flex gap-3 items-center">
              <select 
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm outline-none"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
              >
                 <option value="">All Categories</option>
                 <option value="Raw Materials">Raw Materials</option>
                 <option value="Packaging">Packaging</option>
                 <option value="Finished Goods">Finished Goods</option>
              </select>
              <select 
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm outline-none"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value, page: 1})}
              >
                 <option value="">All Departments</option>
                 <option value="Production">Production</option>
                 <option value="Storage">Storage</option>
                 <option value="Testing">Testing</option>
              </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-inter">
            <thead className="bg-slate-50/50">
               <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Metrics</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {isLoading ? (
                 <tr><td colSpan="5" className="px-8 py-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest text-[10px]">Processing global inventory records...</td></tr>
               ) : materials.map(item => (
                 <tr key={item._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <Package size={22} />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 group-hover:text-primary-600 transition-colors">{item.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.code}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/50">{item.department}</span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="font-black text-slate-800 text-base">{item.quantity} <span className="text-xs font-medium text-slate-400">{item.unit}</span></p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Min: {item.minStockLevel}</p>
                    </td>
                    <td className="px-8 py-5">
                       {getStatusBadge(item.quantity, item.minStockLevel)}
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-center gap-2">
                          <Link to={`/inventory/${item._id}`} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all shadow-sm">
                             <Eye size={18} />
                          </Link>
                          <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all shadow-sm" title="Transfer">
                             <ArrowRightLeft size={18} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
          {!isLoading && materials.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Registry is currently empty.</div>
          )}
        </div>

        {/* Improved Pagination Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-400">Showing page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span></p>
           <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setFilters({...filters, page: currentPage - 1})}
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                 <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setFilters({...filters, page: currentPage + 1})}
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                 <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialList;
