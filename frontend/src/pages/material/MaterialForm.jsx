import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createMaterial, reset } from '../../redux/slices/materialSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Save, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const MaterialForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuccess, isError, message, isLoading } = useSelector((state) => state.material);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Material added successfully!');
      navigate('/inventory');
      dispatch(reset());
    }
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(createMaterial(data));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add New Material</h2>
          <p className="text-slate-500">Create a new item in the central catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="col-span-full border-b border-slate-50 pb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              General Information
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Material Name *</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-primary-500 outline-none transition-all`}
              placeholder="e.g. Copper Wire 5mm"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">SKU / Code *</label>
            <input 
              {...register('sku', { required: 'SKU is required' })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.sku ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono`}
              placeholder="CP-WRE-005"
            />
            {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Category *</label>
            <select 
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white"
            >
              <option value="">Select Category</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electronics">Electronics</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Tools">Tools</option>
            </select>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Unit *</label>
            <input 
              {...register('unit', { required: 'Unit is required' })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. kg, meters, pcs"
            />
          </div>

          {/* Logistics */}
          <div className="col-span-full border-b border-slate-50 pb-4 mt-4">
            <h3 className="font-bold text-lg text-slate-800">Inventory & Pricing</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Unit Price ($) *</label>
            <input 
              type="number" step="0.01"
              {...register('price', { required: 'Price is required' })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Initial Stock</label>
            <input 
              type="number"
              {...register('stock')}
              defaultValue={0}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Low Stock Threshold *</label>
            <input 
              type="number"
              {...register('threshold', { required: 'Threshold is required' })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Alert when stock falls below..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
          <button 
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-10 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2"
          >
            {isLoading ? 'Saving...' : <><Save size={18} /> Create Material</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;
