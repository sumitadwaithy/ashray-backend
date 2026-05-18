import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { dbService } from '../services/db';
import { AppSettings } from '../types';

// Custom decorative Swastika for Login
const LoginSwastika = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L20 2" />
    <path d="M12 2L12 22" />
    <path d="M12 22L4 22" />
    <path d="M2 12L22 12" />
    <path d="M22 12L22 22" />
    <path d="M2 12L2 2" />
    <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="17" cy="17" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="7" cy="17" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    dbService.getSettings().then(setSettings).catch(err => {
      console.error('Failed to load settings:', err);
      setError('Failed to load system settings.');
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (
        (userId === 'admin' && password === (process.env.ADMIN_PASSWORD || 'ashray123')) || 
        (userId === (settings.adminId || process.env.ADMIN_ID || 'admin') && password === (settings.adminPassword || process.env.ADMIN_PASSWORD || 'ashray123'))
      ) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', 'admin');
        window.location.reload();
      } else {
        setError('Invalid ID or Password');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fcfae6] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#022c22] to-[#064e3b]"></div>
      
      {/* Decorative Yellow Ribbon for Flanking Elements */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-32 bg-spiritual-gold hidden lg:block border-y-4 border-brand-700/10 pointer-events-none z-0 shadow-lg"></div>
      
      <div className="relative z-10 w-full max-w-sm">
        {/* Spiritual Flanking Elements for Desktop */}
        <div className="absolute right-full mr-12 top-1/2 -translate-y-1/2 hidden lg:block select-none pointer-events-none animate-in fade-in slide-in-from-right-12 duration-1000">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-800/60 to-transparent rounded-full"></div>
            <span className="text-7xl font-bold text-red-800 font-hindi tracking-wider filter drop-shadow-md transform hover:scale-110 transition-transform">शुभ</span>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-800/60 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="absolute left-full ml-12 top-1/2 -translate-y-1/2 hidden lg:block select-none pointer-events-none animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-800/60 to-transparent rounded-full"></div>
            <span className="text-7xl font-bold text-red-800 font-hindi tracking-wider filter drop-shadow-md transform hover:scale-110 transition-transform">लाभ</span>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-800/60 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden relative border border-slate-200">
          <div className="p-8">

          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-spiritual-gold rounded-xl flex items-center justify-center shadow-lg mb-4 border border-brand-200">
              <LoginSwastika className="w-10 h-10 text-red-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ashray Group</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* USER ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Login ID
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-all shadow-md flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Shree Ganesh'
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Secure Local Access • Ashray Group Ledger
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
);
};