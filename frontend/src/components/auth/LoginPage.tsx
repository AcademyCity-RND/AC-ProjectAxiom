import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginPageProps {
  backendStatus?: 'checking' | 'online' | 'offline';
  onNavigateBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  backendStatus = 'online',
  onNavigateBack,
}) => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('AxiomAdmin2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-300 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header Navigation Strip */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        {onNavigateBack ? (
          <button
            type="button"
            onClick={onNavigateBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>Kembali ke Beranda &amp; Demo Publik</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <img
              src="/axiom-logo.png"
              alt="Project Axiom"
              className="h-7 sm:h-8 object-contain"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="text-[11px] uppercase">
            {backendStatus === 'online' ? 'Gateway Online' : 'Connecting...'}
          </span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Identity Header with Official Horizontal Logo */}
          <div className="text-center space-y-2.5">
            <div className="flex justify-center mb-1">
              <img
                src="/axiom-logo.png"
                alt="Axiom Forensic & Threat Intelligence"
                className="h-12 sm:h-14 object-contain drop-shadow-[0_4px_24px_rgba(56,189,248,0.2)]"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Gerbang Personel Satgas</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Otorisasi analis intelijen siber kognitif &amp; investigasi terkoordinasi CIB PUSSIBERAD
            </p>
          </div>

          {/* Login Card (Matches Landing Page Aesthetic) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
            {/* System Notice */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-mono">
              <span className="text-amber-400 font-semibold">• Sistem Internal Tertutup:</span> Akses
              khusus personel dinas terdaftar. Tidak ada registrasi mandiri publik.
            </div>

            {/* Quick Role Presets (1-Click Fill) */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                Pilih Akun Personel (Pintasan Evaluasi):
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('admin', 'AxiomAdmin2026!')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    username === 'admin'
                      ? 'border-sky-500/60 bg-sky-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-white">admin</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      ADMIN ROOT
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">AxiomAdmin2026!</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('analis', 'AxiomUser2026!')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    username === 'analis' || username === 'user' || username === 'analisis_siber'
                      ? 'border-sky-500/60 bg-sky-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-white">analis</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      ANALIS SIBER
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">AxiomUser2026!</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Identitas Personel (Username):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username operator/analis..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Kata Sandi Otoritas:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Solid Primary Button Matching Landing Page */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-400 hover:bg-sky-300 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <KeyRound className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Otoritas...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Autentikasi &amp; Masuk Sistem</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Protocol Security Notice */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                SESI JWT TERENKRIPSI:
              </div>
              <p className="leading-relaxed">
                Setiap sesi dilindungi token JWT Bearer (kadaluwarsa 24 jam). Sesi dan alamat IP dicatat
                dalam log audit forensik militer.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Minimalist Footer Strip */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 z-10">
        <div>&copy; 2026 Project Axiom • PUSSIBERAD Intelligence Suite.</div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <Activity className="w-3 h-3" /> TLS/SHA-256 SECURED
          </span>
          <span className="text-slate-600">•</span>
          <span>AIR-GAPPED COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
};
