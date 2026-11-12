import { GithubIcon } from '../common/GithubIcon';
import React from 'react';
import { Shield, ArrowUp, LogIn } from 'lucide-react';

interface FooterSectionProps {
  onNavigateLogin: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onNavigateLogin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-slate-800/80 bg-slate-950 py-12 px-4 text-xs text-slate-400">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Military / Research Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">PROJECT AXIOM</div>
            <div className="text-[11px] text-slate-500">
              Satuan Tugas Operasi Siber, PUSSIBERAD © 2026. Hak Cipta Dilindungi.
            </div>
          </div>
        </div>

        {/* Center: System Status Node */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gateway Online</span>
          <span className="text-slate-600">•</span>
          <span>Node JKT-01</span>
        </div>

        {/* Right: Quick Links & Back to Top */}
        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <button
            onClick={onNavigateLogin}
            className="hover:text-sky-400 flex items-center gap-1 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Gerbang Masuk</span>
          </button>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Kembali ke puncak halaman"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Puncak</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
