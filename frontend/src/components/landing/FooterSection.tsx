import React from 'react';
import { ArrowUp, LogIn, History } from 'lucide-react';
import { GithubIcon } from '../common/GithubIcon';

interface FooterSectionProps {
  onNavigateLogin: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenChangelog?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onNavigateLogin,
  onOpenPrivacy,
  onOpenTerms,
  onOpenChangelog,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-slate-800/80 bg-slate-950 py-12 px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Brand, Copyright & Tactical Subtitle (per reference) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/axiom-logo-dark.png"
              alt="Project Axiom Forensic & Threat Intelligence"
              className="h-7 sm:h-8 object-contain"
            />
          </div>

          <div className="text-slate-300 font-medium">
            &copy; 2026 Project Axiom.
          </div>

          <div className="text-[11px] text-slate-500">
            Indikator Risiko Amplifikasi Terkoordinasi &amp; Pertahanan Domain Kognitif.
          </div>
        </div>

        {/* Right: GitHub, Changelog, Privacy Policy, Terms of Service, Login & Scroll-to-Top */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium">
          <a
            href="https://github.com/AcademyCity-RND/AC-ProjectAxiom"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <GithubIcon className="w-4 h-4 text-slate-300" />
            <span>GitHub</span>
          </a>

          {onOpenChangelog && (
            <button
              type="button"
              onClick={onOpenChangelog}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Changelog</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={onOpenTerms}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Terms of Service
          </button>

          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Gerbang Masuk</span>
          </button>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Kembali ke atas"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Atas</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
