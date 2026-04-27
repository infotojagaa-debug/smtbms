import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchMaterials, transferMaterial, reset } from '../../redux/slices/materialSlice';
import { ArrowRightLeft, Send, Users, MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const TransferForm = () => {
  const { register, handleSubmit, reset: resetForm, watch } = useForm();
  const dispatch = useDispatch();
  const { materials, isSuccess, isError, message, isLoading } = useSelector((state) => state.material);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const watchMaterialId = watch('materialId');

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (watchMaterialId) {
      setSelectedMaterial(materials.find(m => m._id === watchMaterialId));
    }
  }, [watchMaterialId, materials]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Material transferred successfully');
      resetForm();
      dispatch(reset());
    }
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, resetForm]);

  const onSubmit = (data) => {
    dispatch(transferMaterial(data));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightLeft className="text-primary-600" />
          Material Transfer
        </h2>
        <p className="text-slate-500">Record material movement between departments.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select Material *</label>
            <select 
              {...register('materialId', { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white"
            >
              <option value="">-- Choose Material --</option>
              {materials.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.sku})</option>
              ))}
            </select>
          </div>

          {selectedMaterial && (
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Package size={20} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available Stock</p>
                  <p className="font-bold text-slate-900">{selectedMaterial.stock} {selectedMaterial.unit}</p>
                </div>
              </div>
            </div>
          )}

          <div grid-cols-1 sm:grid-cols-2>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">From Department *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  {...register('fromDepartment', { required: true })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Storage"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">To Department *</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  {...register('toDepartment', { required: true })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Production"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Quantity to Move *</label>
            <input 
              type="number"
              {...register('quantity', { required: true, min: 1 })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-lg"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Remarks</label>
            <textarea 
              {...register('remarks')}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Reason for transfer..."
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
        >
          {isLoading ? 'Processing...' : (
            <>
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Complete Transfer
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransferForm;
