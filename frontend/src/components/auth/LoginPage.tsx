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
  Terminal,
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
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Classification Header Strip */}
      <div className="border-b border-[#1E293B] bg-[#0A0E18] px-6 py-2 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-red-400 font-semibold uppercase tracking-wider">
            KLASIFIKASI: RAHASIA // PUSSIBERAD TNI AD
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-500">
          <span>PORTAL OPERASI INTELIJEN SIBER KOGNITIF</span>
          <span>ZONE: KARTIKA-CYBER-2026</span>
        </div>
      </div>

      {/* Main Centered Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-5">
          {/* Back Navigation Button */}
          {onNavigateBack && (
            <div>
              <button
                type="button"
                onClick={onNavigateBack}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-sky-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Halaman Publik &amp; Demo Tamu</span>
              </button>
            </div>
          )}

          {/* Identity & Badge Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 shadow-sm mb-1">
              <Shield className="w-7 h-7 text-sky-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[10px] font-mono font-semibold text-red-400 uppercase tracking-widest mb-1">
                SATGAS OPERASI SIBER KOGNITIF
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                PROJECT AXIOM
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
                Cognitive Domain Threat Intelligence &amp; Astroturfing/CIB Detection Platform
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="cyber-card p-6 sm:p-7 border border-slate-800/90 bg-slate-900/80 backdrop-blur-md shadow-xl space-y-5 rounded-lg">
            {/* Header Form */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                AUTENTIKASI PERSONEL SATGAS
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendStatus === 'online' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                ></span>
                {backendStatus === 'online' ? 'BACKEND ONLINE' : 'CONNECTING...'}
              </div>
            </div>

            {/* Closed System Notice */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
              <span className="text-amber-400 font-semibold">• SISTEM INTERNAL TERTUTUP:</span> Tidak
              ada pendaftaran publik. Kredensial dinas diterbitkan langsung oleh Administrator PUSSIBERAD.
            </div>

            {/* Evaluation Quick Presets (1-Click Fill) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                PILIH PERAN OPERATOR (PINTASAN EVALUASI):
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('admin', 'AxiomAdmin2026!')}
                  className={`p-3 rounded-md border text-left transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer shadow-sm ${
                    username === 'admin'
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
                    <span>ADMINISTRATOR</span>
                    {username === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Akses Penuh Audit &amp; Dataset</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('operator', 'AxiomOperator2026!')}
                  className={`p-3 rounded-md border text-left transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer shadow-sm ${
                    username === 'operator'
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
                    <span>ANALIS SIBER</span>
                    {username === 'operator' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Investigasi Kasus Taktis</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-300 font-medium block">
                  IDENTITAS PERSONEL (USERNAME):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username operator..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2.5 pl-9 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 shadow-inner transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-300 font-medium block">
                  KATA SANDI OTORITAS:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2.5 pl-9 pr-9 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 shadow-inner transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Single Solid Primary CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <KeyRound className="w-4 h-4 animate-spin" />
                      <span>MEMVERIFIKASI OTORITAS SIBER...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>AUTENTIKASI &amp; MASUK SISTEM</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Operational Legal Warning */}
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-md text-[11px] text-slate-400 space-y-1 shadow-inner">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                PROTOKOL KEAMANAN AKSES TERPUSAT:
              </div>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Setiap permintaan dilindungi token JWT Bearer (Masa kedaluwarsa 24 jam). Sesi akses
                dan IP dicatat dalam log audit forensik militer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Strip */}
      <footer className="border-t border-[#1E293B] bg-[#0A0E18] px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>&copy; 2026 Pusat Sandi dan Siber TNI AD (PUSSIBERAD).</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline font-mono">Kartika Cyber Hackathon 2026</span>
        </div>
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
