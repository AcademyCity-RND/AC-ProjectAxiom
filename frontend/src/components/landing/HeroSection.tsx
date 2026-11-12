import { GithubIcon } from '../common/GithubIcon';
import React from 'react';
import { ArrowDown, FileCode2, CheckCircle2, ShieldAlert } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 pt-32 pb-16 overflow-hidden">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Tactical Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-8 shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-200">
            Sistem Intelijen Aktif
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[11px] text-sky-400">Model XGBoost v1.0.0-rc</span>
        </div>

        {/* Primary Value Proposition Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50 leading-[1.15]">
          Investigasi Domain Kognitif & <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-200">
            Deteksi Rekayasa Opini Siber
          </span>
        </h1>

        {/* Concise Subtitle without Buzzwords */}
        <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl leading-relaxed font-normal">
          Platform forensik siber untuk membedah akun buzzer terkoordinasi (CIB), sindikat bot
          astroturfing, dan anomali pergeseran narasi media sosial menggunakan 21 parameter perilaku
          terkalibrasi.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => scrollTo('demo')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Coba Live Demo</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollTo('documentation')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-colors"
          >
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span>Dokumentasi & Arsitektur</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Repositori</span>
          </a>
        </div>

        {/* Verifiable Proof Strip (Real Metrics, No Fake Stats) */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">271 Dataset Kasus Riil</div>
              <div className="text-[11px] text-slate-500">Hasil pelabelan akun media sosial Indonesia</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">99.73% Akurasi 5-Fold CV</div>
              <div className="text-[11px] text-slate-500">Evaluasi model XGBoost tri-class tervalidasi</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Dual-Tier Ledger SHA-256</div>
              <div className="text-[11px] text-slate-500">Rantai integritas bukti digital untuk BAP hukum</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
