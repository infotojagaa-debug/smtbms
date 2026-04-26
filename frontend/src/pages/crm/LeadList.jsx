import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeadPipeline } from '../../redux/slices/leadSlice';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Grid, 
  List as ListIcon, 
  Target, 
  Trophy, 
  XSquare,
  Clock,
  Briefcase,
  User,
  ArrowRight,
  TrendingUp,
  Layout
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LeadList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pipeline, loading } = useSelector((state) => state.leads);
  // pipeline structure: { new: {leads:[], count:0, totalValue:0}, contacted: {...}, ... }
  const safePipeline = pipeline || {};
  const [viewMode, setViewMode] = useState('pipeline');

  useEffect(() => {
    dispatch(fetchLeadPipeline());
  }, [dispatch]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      await api.put(`/api/crm/leads/${draggableId}/status`, { status: destination.droppableId });
      toast.success(`Lead transitioned to ${destination.droppableId.toUpperCase()}`);
      dispatch(fetchLeadPipeline());
    } catch (err) {
      toast.error('Pipeline Transition Failure');
    }
  };

  const stages = [
    { id: 'new', label: 'New Inquiry' },
    { id: 'contacted', label: 'Talked to Client' },
    { id: 'qualified', label: 'Project Confirmed' },
    { id: 'proposal-sent', label: 'Quotation Given' },
    { id: 'won', label: 'Deal Secured' },
    { id: 'lost', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-slate-900">New Business Inquiries</h2>
          <p className="text-slate-500 font-medium tracking-tight">Track all your new customer inquiries and business leads from start to finish.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><ListIcon size={18} /></button>
              <button onClick={() => setViewMode('pipeline')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><Layout size={18} /></button>
           </div>
            <button 
              onClick={() => navigate('add')}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
            >
              <Plus size={18} /> Add New Inquiry
            </button>
        </div>
      </div>

      {viewMode === 'pipeline' ? (
        <DragDropContext onDragEnd={onDragEnd}>
           <div className="flex gap-8 overflow-x-auto pb-10 scroller-hide min-h-[600px]">
              {stages.map(stageObj => (
                 <Droppable key={stageObj.id} droppableId={stageObj.id}>
                    {(provided, snapshot) => (
                       <div 
                         {...provided.droppableProps} 
                         ref={provided.innerRef}
                         className={`w-84 shrink-0 space-y-6 p-4 rounded-[3rem] transition-all ${snapshot.isDraggingOver ? 'bg-primary-50/50' : ''}`}
                       >
                          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4 ml-4">
                             <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 italic">{stageObj.label}</h4>
                                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-1">
                                   ₹{(safePipeline[stageObj.id]?.totalValue || 0).toLocaleString()}
                                </p>
                             </div>
                             <span className="text-[9px] font-black bg-slate-100 px-3 py-1 rounded-lg">
                                {safePipeline[stageObj.id]?.count || 0}
                             </span>
                          </div>
                          <div className="space-y-6 min-h-[200px]">
                             {(safePipeline[stageObj.id]?.leads || []).map((lead, index) => (
                                <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                   {(provided, snapshot) => (
                                      <div 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-6 mb-6 bg-white rounded-3xl border-2 border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group ${snapshot.isDragging ? 'shadow-2xl border-primary-300 ring-4 ring-primary-50' : ''}`}
                                      >
                                         <p className="text-xs font-black text-slate-900 uppercase italic mb-1 leading-tight">{lead.title}</p>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-4">{lead.customerId?.company}</p>
                                         
                                         <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                                            <div>
                                               <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Yield Value</p>
                                               <p className="text-sm font-black italic text-slate-900 tracking-tighter">₹{(lead.value || 0).toLocaleString()}</p>
                                            </div>
                                             <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <Link to={`${lead._id}`}><ArrowRight size={14} /></Link>
                                             </div>
                                         </div>
                                      </div>
                                   )}
                                </Draggable>
                             ))}
                             {provided.placeholder}
                          </div>
                       </div>
                    )}
                 </Droppable>
              ))}
           </div>
        </DragDropContext>
      ) : (
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden p-32 text-center">
           <ListIcon size={64} className="mx-auto text-slate-100 mb-6" />
           <p className="font-black uppercase tracking-[0.4em] text-[10px] text-slate-300">Detailed Acquisition Ledger (List Mode) Incoming</p>
        </div>
      )}
    </div>
  );
};

export default LeadList;
