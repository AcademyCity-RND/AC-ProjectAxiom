import React, { useState, useEffect } from 'react';
import { Radio, Activity, UserCheck, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const { operatorName, operatorRole, logout } = useAuthStore();
  const isAdmin = operatorRole?.toLowerCase() === 'admin';
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
    <header className="h-18 sm:h-20 shrink-0 border-b border-slate-800/80 bg-[#0A0E17]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 transition-colors">
      {/* Brand & Subtitle with Official Horizontal Dark Logo (Enlarged 2x) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-sky-400" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/axiom-logo.png"
            alt="AXIOM Forensic & Threat Intelligence"
            className="h-13 sm:h-15 object-contain"
          />
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-semibold font-mono shrink-0">
            PUSSIBERAD
          </span>
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
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-800/80 shadow-sm min-w-[210px] justify-center">
          <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{timeStr || 'Memuat waktu...'}</span>
        </div>

        {/* Operator Session Info & Dedicated Logout Button */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            /* Profil Khusus Administrator (Satgas Inti / PUSSIBERAD Root) */
            <div
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-slate-900/90 border border-amber-500/35 px-3 py-1.5 rounded-md shadow-sm transition-all"
              title="Akses: Administrator Inti (Full RBAC & Forensics Audit)"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 text-xs font-semibold border border-amber-500/50 shadow-inner">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="tracking-tight">{operatorName || 'admin'}</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-tight flex items-center gap-1">
                  <span className="text-slate-400">ROLE:</span>
                  <span className="text-amber-400 font-bold uppercase">ADMIN</span>
                  <span className="text-[8px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold tracking-wider">
                    ROOT
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Profil Standar Operator Analis Berstandar Militer Cyber PUSSIBERAD */
            <div
              className="flex items-center gap-2.5 bg-gradient-to-r from-sky-950/40 via-slate-900/90 to-slate-900/90 border border-sky-500/35 px-3 py-1.5 rounded-md shadow-sm transition-all"
              title="Akses: Analis Operasional (Penyelidikan & Analitik)"
            >
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 text-xs font-semibold border border-sky-500/50 shadow-inner">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="tracking-tight">{operatorName || 'Operator'}</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-tight flex items-center gap-1">
                  <span className="text-slate-400">ROLE:</span>
                  <span className="text-sky-400 font-bold uppercase">{operatorRole || 'USER'}</span>
                  <span className="text-[8px] px-1 py-0.2 bg-sky-500/20 text-sky-300 rounded border border-sky-500/30 font-semibold tracking-wider">
                    ANALIS
                  </span>
                </div>
              </div>
            </div>
          )}

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
