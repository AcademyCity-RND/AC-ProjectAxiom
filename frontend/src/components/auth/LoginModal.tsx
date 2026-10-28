import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isModalOpen,
    isLoading,
    error,
    login,
    logout,
    closeLoginModal,
    clearError,
  } = useAuthStore();

  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('AxiomAdmin2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    await login(username.trim(), password);
  };

  const handleSelectPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    clearError();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#090D16] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden">
        {/* Header Strip */}
        <div className="px-5 py-4 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-[-0.01em] text-white">
                  OTENTIKASI SATGAS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  PUSSIBERAD
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Akses Terproteksi Role-Based Access Control (RBAC)
              </p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Active Session Card (If Authenticated) */}
          {isAuthenticated && user && (
            <div className="p-3 bg-[#131C2E] border border-emerald-500/30 rounded flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{user.username}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Sesi Aktif Terverifikasi (JWT Bearer)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 rounded flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          )}

          {/* Quick-Preset Selector */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-2">
              PINTASAN KREDENSIAL EVALUASI:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('admin', 'AxiomAdmin2026!')}
                className={`p-2.5 rounded border text-left transition-all ${
                  username === 'admin'
                    ? 'border-sky-500/60 bg-sky-500/10 text-sky-300'
                    : 'border-[#1E293B] bg-[#0F172A] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>admin</span>
                  <span className="text-[10px] font-mono text-sky-400">ADMIN</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">AxiomAdmin2026!</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('user01', 'AxiomUser2026!')}
                className={`p-2.5 rounded border text-left transition-all ${
                  username === 'user01'
                    ? 'border-sky-500/60 bg-sky-500/10 text-sky-300'
                    : 'border-[#1E293B] bg-[#0F172A] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>user01</span>
                  <span className="text-[10px] font-mono text-amber-400">USER</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">AxiomUser2026!</div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                Username Operator
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau user01"
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded px-3 py-2 pl-9 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                Kata Sandi Sesi
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded px-3 py-2 pl-9 pr-9 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Action: EXACTLY ONE SOLID PRIMARY CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 disabled:opacity-50 font-medium py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <KeyRound className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi Token JWT...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isAuthenticated ? 'Ganti Sesi Operator' : 'Masuk ke Sistem Axiom'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 border-t border-[#1E293B] bg-[#0A0E18] text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            SHA-256 HMAC JWT Encryption
          </span>
          <span className="font-mono">PUSSIBERAD CYBER DEFENSE</span>
        </div>
      </div>
    </div>
  );
};
