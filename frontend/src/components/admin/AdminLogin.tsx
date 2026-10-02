import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../api';

interface AdminLoginProps {
  onLoginSuccess: (session: any) => void;
  onNavigateMarketplace: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateMarketplace }) => {
  const [email, setEmail] = useState('admin@tnest.com');
  const [password, setPassword] = useState('AdminPass123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await api.login({ email: email.trim(), password });
      
      // Strict role check: only Admin role can access
      if (session.user.role !== 'Admin') {
        throw new Error('Access Denied: This portal requires elevated ADMIN privileges. Normal client and doer accounts cannot log into the Admin Console.');
      }

      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials. Please check your access privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = () => {
    setEmail('admin@tnest.com');
    setPassword('AdminPass123!');
    setTimeout(() => {
      handleSubmit();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top navigation back to marketplace */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onNavigateMarketplace}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition backdrop-blur shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TNEST Marketplace
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-rose-500/30 mb-4 shadow-xl shadow-rose-950/40">
            <ShieldCheck className="w-9 h-9 text-rose-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            TNEST <span className="bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">Admin Console</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Privileged access for platform governance, moderation, and system settings.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Authentication Failed</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tnest.com"
                  style={{
                    backgroundColor: '#030712',
                    color: '#FFFFFF',
                    borderColor: '#1E293B'
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Secret Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    backgroundColor: '#030712',
                    color: '#FFFFFF',
                    borderColor: '#1E293B'
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm placeholder-slate-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                boxShadow: '0 4px 18px rgba(225, 29, 72, 0.45), 0 1px 3px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
              className="w-full mt-2 py-3.5 px-4 hover:brightness-110 active:scale-[0.99] text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.01em' }}>
                    Sign In as Administrator
                  </span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Admin Demo Login Button */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 mb-3 text-center flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Developer & Demo Instant Access</span>
            </div>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={loading}
              style={{
                backgroundColor: '#1E293B',
                color: '#F1F5F9',
                borderColor: '#334155',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              className="w-full py-3 px-3 hover:bg-slate-700/90 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span style={{ color: '#F8FAFC', fontWeight: 600 }}>1-Click Admin Quick Login (admin@tnest.com)</span>
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Protected by AES-256 JWT Bearer & Argon2id Policy Enforcement</span>
        </div>
      </div>
    </div>
  );
};
