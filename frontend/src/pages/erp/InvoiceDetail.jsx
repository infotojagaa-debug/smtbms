import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Printer, 
  Send, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import toast from 'react-hot-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [inv, setInv] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const slipRef = useRef();

  const loadInvoice = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const res = await axios.get(`/api/erp/invoices/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setInv(res.data);
    setPaymentAmount(res.data.totalAmount - res.data.paidAmount);
  };

  useEffect(() => { loadInvoice(); }, [id]);

  const handleRecordPayment = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    try {
      await axios.post(`/api/erp/payments`, {
        invoiceId: id,
        amount: paymentAmount,
        paymentType: inv.invoiceType === 'purchase' ? 'outgoing' : 'incoming',
        paymentMethod: 'bank-transfer'
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Fiscal Settlement Synchronized.');
      setShowPaymentModal(false);
      loadInvoice();
    } catch (err) { toast.error('Settlement Failure'); }
  };

  const downloadPDF = async () => {
    const element = slipRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${inv.invoiceNumber}.pdf`);
  };

  if (!inv) return <div className="p-20 text-center font-black animate-pulse uppercase">Retrieving Fiscal Registry...</div>;

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
        <div className="flex items-center gap-6">
           <Link to="/erp/invoices" className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={22} />
           </Link>
           <div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-4 italic uppercase">
                 {inv.invoiceNumber} <span className={`px-3 py-1 border rounded-xl text-[10px] uppercase font-black ${
                   inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                 }`}>{inv.status}</span>
              </h2>
              <p className="text-slate-500 font-medium">Lifecycle document recognized on {new Date(inv.issueDate).toLocaleDateString()}</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
           {inv.status !== 'paid' && (
             <button 
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
             >
               <CreditCard size={18} /> Record Settlement
             </button>
           )}
           <button onClick={downloadPDF} className="p-4 bg-white border border-slate-200 text-slate-400 rounded-3xl hover:text-slate-900 transition-all shadow-sm">
             <Download size={20} />
           </button>
           <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-3xl hover:text-slate-900 transition-all shadow-sm">
             <Send size={20} />
           </button>
        </div>
      </div>

      <div ref={slipRef} className="bg-white p-20 rounded-[4rem] border border-slate-100 shadow-2xl space-y-16 text-slate-900">
         <div className="flex justify-between items-start">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic">G</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Gravity Enterprise Hub</h3>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                  128 Corporate Plaza, Unit 12-A<br />
                  Fiscal District, Global City
               </p>
            </div>
            <div className="text-right space-y-2">
               <h4 className="text-xl font-black uppercase tracking-tight text-primary-600 italic">Official Fiscal Invoice</h4>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registry ID: {inv.invoiceNumber}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-12 border-t border-b border-slate-50 py-12">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Origin / From</p>
               <p className="font-black text-xs uppercase italic">{inv.invoiceType === 'sale' ? 'Gravity Enterprise Hub' : (inv.vendorId?.name || 'Partner Entity')}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">ID: {inv.vendorId?.vendorId || 'ENT-001'}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Destination / To</p>
               <p className="font-black text-xs uppercase italic">{inv.invoiceType === 'purchase' ? 'Gravity Enterprise Hub' : (inv.customerId?.name || 'Client Entity')}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Due Date: {new Date(inv.dueDate).toLocaleDateString()}</p>
            </div>
         </div>

         <div className="space-y-8">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase">Description of Service/Goods</th>
                     <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                     <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Unit Price (₹)</th>
                     <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Yield (₹)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {inv.items.map((item, idx) => (
                    <tr key={idx}>
                       <td className="py-6">
                          <p className="font-black text-slate-900 text-xs italic uppercase">{item.itemName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{item.description || 'Standard Fulfillment Row'}</p>
                       </td>
                       <td className="py-6 text-center text-xs font-black text-slate-900 uppercase">x{item.quantity} {item.unit}</td>
                       <td className="py-6 text-center text-xs font-black text-slate-400">₹{item.unitPrice.toLocaleString()}</td>
                       <td className="py-6 text-right font-black text-slate-900 italic text-xs">₹{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="flex justify-end pt-10 border-t border-slate-50">
            <div className="w-80 space-y-6">
               <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Subtotal Yield</span>
                  <span className="text-slate-900 italic">₹{inv.subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Incentive Discount</span>
                  <span className="text-emerald-500 italic">-₹{inv.discountAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Statutory Tax</span>
                  <span className="text-red-500 italic">₹{inv.taxAmount.toLocaleString()}</span>
               </div>
               <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-2 leading-none">Net Payable Yield</p>
                     <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">₹{inv.totalAmount.toLocaleString()}</h3>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-500 flex flex-col relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-10 right-10 p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all"><XCircle size={24} /></button>
              
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                    <CreditCard size={32} className="text-primary-600" /> Record Settlement
                 </h3>
                 <p className="text-slate-500 font-medium tracking-tight">Synchronize physical payment with organizational ledger.</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Authorized Amount (₹)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border-none rounded-2xl p-5 text-xl font-black italic text-slate-900 shadow-sm"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                 </div>
                 <div className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest items-center flex justify-center gap-2 italic">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Auto-transitioning to {paymentAmount >= (inv.totalAmount - inv.paidAmount) ? 'Paid' : 'Partial'} status
                 </div>
              </div>

              <button 
               onClick={handleRecordPayment}
               className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl shadow-2xl hover:bg-primary-600 transition-all active:scale-95"
              >
                 Authorize Settlement Sequence
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
