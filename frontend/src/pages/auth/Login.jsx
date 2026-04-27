import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../redux/slices/authSlice';
import { Mail, Lock, Loader2, Package, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import MobileLogin from './MobileLogin';

const Login = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter both email and password');
    }
    dispatch(login({ email, password }));
  };

  if (isMobile) {
    return <MobileLogin />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl z-10 mx-4">
        
        {/* Left Side Branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={280} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-white mb-2">
              <Package size={32} className="stroke-2" />
              <h1 className="text-3xl font-extrabold tracking-tight">SMTBMS</h1>
            </div>
            <h2 className="text-blue-200 text-sm tracking-widest font-medium uppercase mt-1 mb-8 opacity-80">
              Enterprise Control Portal
            </h2>
          </div>

          <div className="relative z-10 space-y-4">
            <h3 className="text-4xl font-black text-white leading-tight">
              Synchronize your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Global Operations.</span>
            </h3>
            <p className="text-blue-100/80 leading-relaxed text-sm max-w-sm font-medium">
              A unified platform to manage logistics, scale human capital, orchestrate acquisitions, and streamline procurement with real-time intelligence.
            </p>
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 relative z-10 bg-slate-900/50">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Please authenticate to continue to your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1 relative group">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@smtbms.com"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 flex justify-center items-center gap-2 rounded-2xl transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Access Terminal</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center items-center gap-2 text-slate-500 focus-within:outline-none flex-col text-sm">
               <p className="font-medium">System strictly monitored. Authorized access only.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
