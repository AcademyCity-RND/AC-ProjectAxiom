import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, UserCheck, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { operatorName, operatorRole, isAuthenticated, openLoginModal } = useAuthStore();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('id-ID', { hour12: false }) +
          ' WIB'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#090D16]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Shield className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-[-0.02em] text-white text-lg">AXIOM</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] bg-red-500/10 text-red-400 border border-red-500/30 font-semibold font-mono">
              PUSSIBERAD
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-tight">
            Cognitive Domain Threat Intelligence & Astroturfing Detection
          </p>
        </div>
      </div>

      {/* Operational Stats & Indicators */}
      <div className="flex items-center gap-4">
        {/* Scraper Pool Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-[#0F172A] px-3 py-1.5 rounded border border-[#1E293B]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Scraper Pool:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Radio className="w-3 h-3" /> Online
          </span>
        </div>

        {/* Real-time System Clock */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono tabular-nums text-sky-400/90 bg-[#0F172A] px-3 py-1.5 rounded border border-[#1E293B]">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>{timeStr || 'Memuat waktu...'}</span>
        </div>

        {/* Interactive Operator Auth Badge */}
        <button
          type="button"
          onClick={openLoginModal}
          className="flex items-center gap-2.5 bg-[#1E293B]/70 hover:bg-[#1E293B] border border-[#1E293B] hover:border-sky-500/40 px-3 py-1.5 rounded transition-all text-left cursor-pointer group"
          title="Klik untuk membuka autentikasi / ganti akun operator"
        >
          <div className="w-6 h-6 rounded-full bg-sky-950/80 flex items-center justify-center text-sky-300 text-xs font-semibold border border-sky-500/30 group-hover:border-sky-400">
            {isAuthenticated ? <UserCheck className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
          </div>
          <div className="text-left">
            <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <span>{operatorName || 'Guest'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              ></span>
            </div>
            <div className="text-[10px] text-sky-400 font-mono tracking-tight uppercase">
              ROLE: {operatorRole || 'USER'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
