import { GithubIcon } from '../common/GithubIcon';
import React, { useState, useEffect } from 'react';
import {
  Shield,
  ChevronDown,
  LogIn,
  Menu,
  X,
  Layers,
  Clock,
  TrendingUp,
  FileText,
  Terminal,
  Server,
  Code2,
  Database,
} from 'lucide-react';

interface AdaptiveNavbarProps {
  onNavigateLogin: () => void;
}

export const AdaptiveNavbar: React.FC<AdaptiveNavbarProps> = ({ onNavigateLogin }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<'features' | 'docs' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out flex justify-center ${
          isScrolled ? 'pt-3 px-4' : 'pt-0 px-0'
        }`}
      >
        <div
          className={`w-full transition-all duration-300 ease-out flex items-center justify-between ${
            isScrolled
              ? 'max-w-5xl rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-5 py-2.5 shadow-2xl shadow-black/50'
              : 'max-w-7xl mx-auto px-6 py-4 bg-transparent border-b border-transparent'
          }`}
        >
          {/* Brand Logo & Name */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-lg px-1.5 py-1"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 group-hover:border-sky-400 transition-colors">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-100 text-sm sm:text-base flex items-center gap-1.5">
                AXIOM
                <span className="hidden sm:inline-block font-mono text-[9px] uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                  Intel
                </span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-300">
            {/* Live Demo Anchor */}
            <button
              onClick={() => scrollToSection('demo')}
              className="px-3 py-1.5 rounded-full hover:text-slate-50 hover:bg-slate-800/60 transition-colors"
            >
              Live Demo
            </button>

            {/* Fitur Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('features')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                  activeDropdown === 'features'
                    ? 'text-sky-400 bg-slate-800/60'
                    : 'hover:text-slate-50 hover:bg-slate-800/60'
                }`}
                aria-expanded={activeDropdown === 'features'}
              >
                <span>Fitur</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {activeDropdown === 'features' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => scrollToSection('features')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <Layers className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Deteksi Jaringan CIB</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Analisis klaster copypasta semantik</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('features')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <Clock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Ritme Sirkadian 24/7</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Pola jam biologis vs otomasi bot</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('features')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Pergeseran Narasi</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Deteksi akun yang beralih peran</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('features')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <FileText className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Dual-Tier Ledger Forensik</div>
                      <div className="text-[11px] text-slate-400 leading-tight">100% audit riwayat komentator</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Workflow Anchor */}
            <button
              onClick={() => scrollToSection('workflow')}
              className="px-3 py-1.5 rounded-full hover:text-slate-50 hover:bg-slate-800/60 transition-colors"
            >
              Alur Pipeline
            </button>

            {/* Dokumentasi Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('docs')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                  activeDropdown === 'docs'
                    ? 'text-sky-400 bg-slate-800/60'
                    : 'hover:text-slate-50 hover:bg-slate-800/60'
                }`}
                aria-expanded={activeDropdown === 'docs'}
              >
                <span>Dokumentasi</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {activeDropdown === 'docs' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => scrollToSection('documentation')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <Terminal className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Panduan Cepat (Quickstart)</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Instalasi & konfigurasi lingkungan</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('documentation')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <Server className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Penerapan Docker</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Docker compose untuk produksi</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('documentation')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Spesifikasi REST API</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Endpoint investigasi & export</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('documentation')}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <Database className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">Kamus 21-Fitur ML</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Definisi fitur & retraining model</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Changelog & About */}
            <button
              onClick={() => scrollToSection('changelog')}
              className="px-3 py-1.5 rounded-full hover:text-slate-50 hover:bg-slate-800/60 transition-colors"
            >
              Changelog
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="px-3 py-1.5 rounded-full hover:text-slate-50 hover:bg-slate-800/60 transition-colors"
            >
              Tentang
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <button
              onClick={onNavigateLogin}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden flex flex-col justify-start pt-20 px-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
            <button
              onClick={() => scrollToSection('demo')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              Live Demo Sandbox
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              Fitur Forensik & CIB
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              Arsitektur Pipeline
            </button>
            <button
              onClick={() => scrollToSection('documentation')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              Dokumentasi & Instalasi
            </button>
            <button
              onClick={() => scrollToSection('changelog')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              Riwayat Rilis (Changelog)
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              Tentang & Etika
            </button>

            <div className="border-t border-slate-800 pt-3 mt-1 flex flex-col gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-800 bg-slate-800/60 text-slate-300 text-sm font-medium"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Repositori GitHub</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateLogin();
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500 text-slate-950 text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span>Gerbang Masuk Staf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
