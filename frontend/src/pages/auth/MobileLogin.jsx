import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../redux/slices/authSlice';
import { Mail, Lock, Loader2, Package, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const MobileLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter credentials');
    }
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Branding Section */}
      <div className="pt-16 pb-12 px-8 flex flex-col items-center relative z-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 mb-6">
          <Package size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">SMTBMS</h1>
        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-80">
          Enterprise Control
        </p>
      </div>

      {/* Login Card (Bottom Sheet Style) */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-2xl rounded-t-[3rem] border-t border-white/10 px-8 pt-10 pb-12 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Please authenticate to access your terminal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
            <div className="relative flex items-center group">
              <div className="absolute left-4 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smtbms.com"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative flex items-center group">
              <div className="absolute left-4 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 active:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" className="text-xs font-bold text-blue-500/80 uppercase tracking-wider">
              Forgot Key?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 flex justify-center items-center gap-2 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.97] disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="uppercase tracking-widest text-sm">Validating...</span>
              </>
            ) : (
              <span className="uppercase tracking-[0.15em] text-sm font-black">Access Terminal</span>
            )}
          </button>
        </form>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/30 rounded-full border border-white/5">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Secure Enterprise Auth</span>
          </div>
          <p className="text-[10px] font-medium text-slate-600 text-center px-4">
            Unauthorized access is strictly prohibited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
