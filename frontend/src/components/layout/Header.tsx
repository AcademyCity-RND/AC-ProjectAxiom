import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, UserCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { operatorName, operatorRole, logout } = useAuthStore();
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
    <header className="h-16 border-b border-slate-800/80 bg-[#0A0E17]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-sm shrink-0">
          <Shield className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-white text-base sm:text-lg">AXIOM</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-semibold font-mono">
              PUSSIBERAD
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-tight hidden sm:block">
            Cognitive Domain Threat Intelligence &amp; Astroturfing Detection
          </p>
        </div>
      </div>

      {/* Operational Stats & Indicators */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Scraper Pool Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-800/80 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Scraper Pool:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
            <Radio className="w-3 h-3" /> Online
          </span>
        </div>

        {/* Real-time System Clock */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-800/80 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>{timeStr || 'Memuat waktu...'}</span>
        </div>

        {/* Operator Session Info & Dedicated Logout Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800/90 px-3 py-1.5 rounded-md shadow-sm">
            <div className="w-6 h-6 rounded-full bg-sky-950/80 flex items-center justify-center text-sky-300 text-xs font-semibold border border-sky-500/30">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <span>{operatorName || 'Operator'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                ROLE: <span className="text-sky-400 font-semibold">{operatorRole || 'USER'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="p-2 bg-slate-900/80 hover:bg-rose-500/10 border border-slate-800/90 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-md transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer shadow-sm"
            title="Keluar dari Sesi (Logout ke Halaman Utama)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
