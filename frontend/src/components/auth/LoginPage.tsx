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
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginPageProps {
  backendStatus?: 'checking' | 'online' | 'offline';
}

export const LoginPage: React.FC<LoginPageProps> = ({ backendStatus = 'online' }) => {
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
        <div className="w-full max-w-lg space-y-6">
          {/* Identity & Badge Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-sky-950/50 border border-sky-500/40 text-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.15)] mb-1">
              <Shield className="w-7 h-7 text-sky-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-[10px] font-mono font-semibold text-red-400 uppercase tracking-widest mb-1">
                SATGAS OPERASI SIBER KOGNITIF
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                PROJECT AXIOM
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
                Cognitive Domain Threat Intelligence & Astroturfing/CIB Detection Platform
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="cyber-card p-6 border border-[#1E293B] bg-[#0F172A]/90 backdrop-blur-md shadow-2xl space-y-5">
            {/* Header Form */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.05em] text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                OTENTIKASI PERSONEL SATGAS
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                {backendStatus === 'online' ? 'BACKEND ONLINE' : 'CONNECTING...'}
              </div>
            </div>

            {/* Evaluation Quick Presets (1-Click Fill) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                PILIH PERAN OPERATOR (PINTASAN EVALUASI):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('admin', 'AxiomAdmin2026!')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    username === 'admin'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                      : 'border-[#1E293B] bg-[#131C2E] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>admin</span>
                    <span className="text-[10px] font-mono text-sky-400 px-1 py-0.2 bg-sky-500/20 rounded">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    AxiomAdmin2026!
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('user01', 'AxiomUser2026!')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    username === 'user01'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                      : 'border-[#1E293B] bg-[#131C2E] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>user01</span>
                    <span className="text-[10px] font-mono text-amber-400 px-1 py-0.2 bg-amber-500/20 rounded">
                      OPERATOR
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    AxiomUser2026!
                  </div>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-100">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                  NRP / Username Personel
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username personel..."
                    className="w-full bg-[#090D16] border border-[#1E293B] rounded px-3 py-2.5 pl-9 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                  Kata Sandi Akses
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full bg-[#090D16] border border-[#1E293B] rounded px-3 py-2.5 pl-9 pr-9 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                  className="w-full bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 disabled:opacity-50 font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-sky-500/10"
                >
                  {isLoading ? (
                    <>
                      <KeyRound className="w-4 h-4 animate-spin" />
                      <span>MEMVERIFIKASI OTORITAS SIBER...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>AUTENTIKASI & MASUK SISTEM</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Operational Legal Warning */}
            <div className="p-3 bg-[#090D16]/70 border border-[#1E293B] rounded text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Protokol Keamanan Akses Terpusat:
              </div>
              <p className="leading-relaxed text-[10px] text-slate-400">
                Setiap permintaan dilindungi token JWT Bearer (Masa kedaluwarsa 24 jam). Sesi akses dan IP dicatat dalam log audit forensik militer.
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
