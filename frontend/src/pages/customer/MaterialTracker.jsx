import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Map, Box, Radio, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const MaterialTracker = () => {
  const [activeOrder, setActiveOrder] = useState('ORD-77X');

  const orders = [
    { id: 'ORD-77X', item: 'Industrial Steel Tubing', items: 24, status: 'In Transit', currentStage: 2 },
    { id: 'ORD-82B', item: 'Copper Wiring Rolls', items: 5, status: 'Packed', currentStage: 1 },
    { id: 'ORD-91A', item: 'Aluminum Sheets', items: 10, status: 'Delivered', currentStage: 3 },
  ];

  const stages = [
    { title: 'Ordered', icon: Clock, desc: 'Order placed & confirmed' },
    { title: 'Packed', icon: Box, desc: 'Materials picked & packaged' },
    { title: 'In Transit', icon: Truck, desc: 'Handed over to logistics' },
    { title: 'Delivered', icon: CheckCircle, desc: 'Received by customer' }
  ];

  const currentOrderData = orders.find(o => o.id === activeOrder) || orders[0];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 fade-up px-4 md:px-0">
      
      {/* Hero Header Area */}
      <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-10 md:p-14 shadow-2xl border border-white/5 group">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-5 py-2 bg-white/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md flex items-center gap-2">
                    <Radio size={14} className="animate-pulse" /> LIVE LOGISTICS FEED
                  </span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase italic leading-none">Fleet <span className="text-emerald-500">Tracker</span></h2>
               <p className="text-slate-400 font-bold max-w-xl text-xs md:text-sm tracking-tight opacity-70 leading-relaxed">Real-time triangulation of your active material procurement streams and operational manifest status.</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                 <Truck size={28} />
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Order Selection Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col h-full relative group/sidebar">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
           
           <div className="p-10 border-b border-slate-50 relative z-10">
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Active Shipments</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Select manifest to triangulate</p>
           </div>
           
           <div className="p-6 space-y-4 relative z-10">
              {orders.map(order => (
                <button 
                  key={order.id}
                  onClick={() => setActiveOrder(order.id)}
                  className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-500 group/item relative overflow-hidden ${
                    activeOrder === order.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-2xl -translate-y-1' 
                      : 'bg-white border-slate-50 text-slate-500 hover:border-emerald-100'
                  }`}
                >
                  <div className="relative z-10 flex justify-between items-start mb-4">
                     <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeOrder === order.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                       #{order.id}
                     </p>
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                        order.status === 'Delivered' ? 'bg-emerald-500 text-white border-transparent' : 
                        order.status === 'In Transit' ? 'bg-white text-slate-900 border-slate-100' :
                        'bg-slate-100 text-slate-400 border-transparent'
                     }`}>
                        {order.status}
                     </span>
                  </div>
                  <p className={`font-black text-lg italic uppercase tracking-tight relative z-10 ${activeOrder === order.id ? 'text-white' : 'text-slate-900'}`}>{order.item}</p>
                  <div className="flex items-center gap-2 mt-4 opacity-60">
                     <Package size={12} />
                     <p className="text-[10px] font-black uppercase tracking-widest">{order.items} Units Bundled</p>
                  </div>
                  {activeOrder === order.id && (
                     <div className="absolute bottom-0 right-0 p-4 opacity-20">
                        <ArrowRight size={32} />
                     </div>
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* Tracking Visualization */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-slate-950 rounded-[3.5rem] p-12 md:p-16 shadow-2xl text-white relative overflow-hidden group/manifest">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
             <div className="absolute -right-20 -top-20 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
               <Map size={300} />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <p className="text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase">Authenticated Manifest Details</p>
               </div>
               <h3 className="text-4xl md:text-6xl font-black mb-2 italic tracking-tighter uppercase leading-none">#{currentOrderData.id}</h3>
               <div className="flex items-center gap-4 mt-6 mb-12">
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     {currentOrderData.item}
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                     {currentOrderData.items} Units Payload
                  </div>
               </div>

               {/* Progress UI */}
               <div className="relative pt-10 pb-6 px-4">
                  {/* Background Bar */}
                  <div className="absolute top-14 left-12 right-12 h-1.5 bg-white/5 rounded-full"></div>
                  {/* Active Bar */}
                  <div 
                    className="absolute top-14 left-12 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    style={{ width: `calc(${(currentOrderData.currentStage / 3) * 100}% - 4rem + min(${(currentOrderData.currentStage / 3) * 4}rem, 4rem))` }}
                  ></div>

                  <div className="relative flex justify-between">
                     {stages.map((stage, i) => {
                       const isCompleted = i <= currentOrderData.currentStage;
                       const isActive = i === currentOrderData.currentStage;
                       const Icon = stage.icon;
                       
                       return (
                         <div key={i} className="flex flex-col items-center w-24 group/step">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl relative z-10 ${
                             isActive ? 'bg-emerald-500 border-white scale-125 ring-8 ring-emerald-500/20' :
                             isCompleted ? 'bg-white border-white text-slate-900 group-hover/step:translate-y-1' : 
                             'bg-white/5 border-white/10 text-slate-600'
                           }`}>
                              <Icon size={24} className={isActive ? 'text-white animate-pulse' : ''} />
                           </div>
                           <p className={`mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors ${
                             isActive ? 'text-emerald-400' : isCompleted ? 'text-white' : 'text-slate-600'
                           }`}>
                             {stage.title}
                           </p>
                         </div>
                       );
                     })}
                  </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-12 md:p-16 relative group/timeline">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
             
             <div className="mb-12 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 italic uppercase">Logistics Matrix</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of deployment verification steps</p>
             </div>
             
             <div className="space-y-12 relative z-10 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                {[...Array(currentOrderData.currentStage + 1)].map((_, idx) => {
                  const stageInfo = stages[currentOrderData.currentStage - idx];
                  if(!stageInfo) return null;
                  
                  return (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl border-4 border-white bg-slate-900 text-emerald-500 shadow-2xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform duration-500">
                        <MapPin size={20} />
                      </div>
                      <div className="w-[calc(100%-4.5rem)] md:w-[calc(50%-3rem)] p-8 rounded-[2.5rem] border border-emerald-50 bg-[#F9FFF9] shadow-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="font-black text-slate-900 text-lg uppercase italic tracking-tight">{stageInfo.title}</div>
                          <time className="font-black text-[9px] text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Oct 14, 14:00</time>
                        </div>
                        <div className="text-slate-500 text-xs font-bold leading-relaxed border-l-2 border-emerald-500/20 pl-4">{stageInfo.desc}</div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MaterialTracker;
