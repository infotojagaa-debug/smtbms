import { useState } from 'react';
import { ShoppingCart, Package, Search, Plus, ArrowRight, Database, Zap, ShieldCheck } from 'lucide-react';

const ProductCatalog = () => {
  const [cart, setCart] = useState([]);
  
  const products = [
    { id: 'MAT-101', name: 'Industrial Steel Tubing', desc: 'High-grade carbon steel pipes. 20ft length.', stock: 1250, price: 185.00, category: 'Metals' },
    { id: 'MAT-214', name: 'Copper Wiring Rolls', desc: 'Electrical grade insulated copper wiring (100m).', stock: 450, price: 320.50, category: 'Electrical' },
    { id: 'MAT-088', name: 'Aluminum Sheets', desc: 'Standard 4x8 ft aluminum alloy structural sheets.', stock: 890, price: 85.00, category: 'Metals' },
    { id: 'MAT-332', name: 'PVC Industrial Pipes', desc: 'Heavy duty pressure pipes for plumbing.', stock: 3200, price: 42.00, category: 'Plumbing' },
    { id: 'MAT-419', name: 'Concrete Mix Bags', desc: 'Commercial grade fast-setting concrete (50lb).', stock: 500, price: 12.50, category: 'Construction' },
    { id: 'MAT-502', name: 'Reinforcement Rebar', desc: 'Grade 60 steel reinforcement rebar (10mm).', stock: 8400, price: 8.50, category: 'Construction' },
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 fade-up px-4 md:px-0">
      
      {/* Search & Intelligence Header */}
      <div className="flex justify-between items-center flex-wrap gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Database size={16} className="text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Inventory Access</p>
           </div>
           <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">Material <span className="text-emerald-500">Catalog</span></h2>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex bg-white border border-slate-100 rounded-2xl px-6 py-4 hover:border-emerald-500 transition-all w-80 items-center gap-4 shadow-xl shadow-slate-200/20 group/search">
             <Search size={18} className="text-slate-300 group-focus-within/search:text-emerald-500 transition-colors" />
             <input type="text" placeholder="Triangulate resources..." className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300" />
           </div>
           
           <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.25em] shadow-2xl shadow-slate-900/20 transition-all flex items-center gap-3 relative group/cart">
             <ShoppingCart size={18} className="group-hover/cart:rotate-12 transition-transform" /> 
             PROCUREMENT
             {cart.length > 0 && (
               <span className="absolute -top-3 -right-3 bg-emerald-500 text-white w-7 h-7 rounded-full text-[10px] flex items-center justify-center font-black animate-bounce shadow-lg border-4 border-white">
                 {cart.length}
               </span>
             )}
           </button>
        </div>
      </div>

      {/* Featured Global Hub Hero */}
      <div className="bg-slate-950 rounded-[3.5rem] p-12 md:p-20 shadow-2xl flex items-center justify-between text-white relative overflow-hidden group/hero">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-60 group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Package size={350} />
         </div>
         
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
               <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-emerald-500/20 backdrop-blur-md flex items-center gap-2">
                 <Zap size={14} className="animate-pulse" /> NETWORK COMMAND FEATURE
               </span>
            </div>
            <h3 className="text-4xl md:text-6xl font-black leading-tight mb-6 italic uppercase tracking-tighter">Bulk Supply <span className="text-emerald-500">Protocol</span> Active</h3>
            <p className="text-slate-400 font-bold text-sm md:text-lg mb-10 opacity-70 leading-relaxed max-w-lg">Implement heavy lifting procurement cycles with an automated <span className="text-white">15% markdown</span> on all regional construction assets above 100 base units.</p>
            <button className="bg-white text-slate-900 px-10 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-2 flex items-center gap-3 active:scale-95">
               EXECUTE SCAN <ArrowRight size={18} className="text-emerald-500" />
            </button>
         </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
         {products.map(product => (
           <div key={product.id} className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-2xl hover:shadow-emerald-500/10 transition-all group/card flex flex-col relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover/card:scale-150 transition-transform duration-1000"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover/card:bg-emerald-500 group-hover/card:text-white transition-all duration-500 shadow-inner">
                    <Package size={28} />
                 </div>
                 <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-100 shadow-sm">
                    {product.category}
                 </span>
              </div>
              
              <div className="relative z-10 flex-1">
                 <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <p className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase">{product.id}</p>
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-3 italic tracking-tight uppercase leading-none">{product.name}</h3>
                 <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed opacity-80">{product.desc}</p>
              </div>

              <div className="relative z-10 pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                 <div>
                    <h4 className="text-3xl font-black text-slate-900 leading-none tracking-tighter tabular-nums uppercase italic">
                       ${product.price.toFixed(2)}
                    </h4>
                    <p className="text-[9px] uppercase font-black tracking-[0.3em] text-emerald-600 mt-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       {product.stock} Units Level
                    </p>
                 </div>
                 <button 
                   onClick={() => addToCart(product)}
                   className="w-16 h-16 bg-slate-950 hover:bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl active:scale-90 group/plus"
                 >
                    <Plus size={24} className="group-hover/plus:rotate-90 transition-transform" />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
