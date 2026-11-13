import React, { useState, useEffect } from 'react';
import { LogIn, Menu, X, History } from 'lucide-react';
import { GithubIcon } from '../common/GithubIcon';

interface AdaptiveNavbarProps {
  onNavigateLogin: () => void;
  onOpenChangelog?: () => void;
}

interface NavItem {
  id: string;
  label: string;
}

// User-ordered navigation items: Beranda Demo Tentang Fitur Alur Dokumentasi FAQ
const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Beranda' },
  { id: 'demo', label: 'Demo' },
  { id: 'about', label: 'Tentang' },
  { id: 'features', label: 'Fitur' },
  { id: 'workflow', label: 'Alur' },
  { id: 'documentation', label: 'Dokumentasi' },
  { id: 'faq', label: 'FAQ' },
];

// Mapping for section probe so Team section in page correctly maps to 'about' in navbar
const SECTIONS_TO_PROBE = [
  { elId: 'hero', navId: 'hero' },
  { elId: 'demo', navId: 'demo' },
  { elId: 'about', navId: 'about' },
  { elId: 'team', navId: 'about' },
  { elId: 'features', navId: 'features' },
  { elId: 'workflow', navId: 'workflow' },
  { elId: 'documentation', navId: 'documentation' },
  { elId: 'faq', navId: 'faq' },
];

export const AdaptiveNavbar: React.FC<AdaptiveNavbarProps> = ({
  onNavigateLogin,
  onOpenChangelog,
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Scroll listener for sticky floating transition & active section tracking using getBoundingClientRect
  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      // 1. Scrolled state toggle (pill vs transparent header)
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // 2. Reactive active section detection using getBoundingClientRect
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      // Special case: at the very top of the page
      if (scrollY < 80) {
        setActiveSection('hero');
        ticking = false;
        return;
      }

      // Special case: near or at the bottom of the page -> activate last item 'faq'
      if (windowHeight + scrollY >= scrollHeight - 80) {
        setActiveSection('faq');
        ticking = false;
        return;
      }

      // Reading probe threshold from top of viewport:
      // ~220px or 35% of viewport height provides natural user focus alignment
      const probeY = Math.min(240, windowHeight * 0.35);

      // Find the last section whose top edge has passed or reached the probe line
      let matchedSection = 'hero';
      for (const item of SECTIONS_TO_PROBE) {
        const el = document.getElementById(item.elId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= probeY) {
            matchedSection = item.navId;
          }
        }
      }

      setActiveSection(matchedSection);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to determine initial section
    updateActiveSection();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const navbarOffset = 80; // Account for floating navbar height
      const targetY = element.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
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
              ? 'max-w-5xl rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-5 py-2 shadow-2xl shadow-black/50'
              : 'max-w-7xl mx-auto px-6 py-4 bg-transparent border-b border-transparent'
          }`}
        >
          {/* Brand Logo (Official Horizontal Transparent Logo - 2x Larger) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero');
            }}
            className="flex items-center gap-2 group outline-none focus:outline-none focus:ring-0 active:outline-none border-0"
            title="Project Axiom - Kembali ke Beranda"
          >
            <img
              src="/axiom-logo.png"
              alt="Project Axiom Forensic & Threat Intelligence"
              className={`transition-all duration-300 object-contain ${
                isScrolled ? 'h-9 sm:h-11' : 'h-13 sm:h-16'
              }`}
            />
          </a>

          {/* Desktop Navigation Menu (Reordered: Beranda, Demo, Tentang, Fitur, Alur, Dokumentasi, FAQ) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* GitHub Repo Button */}
            <a
              href="https://github.com/AcademyCity-RND/AC-ProjectAxiom"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
              title="Kunjungi Repositori GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            {/* Changelog Pop-up Icon Button (History Icon per Screenshot) */}
            <button
              type="button"
              onClick={onOpenChangelog}
              className="w-8 h-8 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Riwayat Pembaruan & Changelog"
              aria-label="Lihat Changelog & Riwayat Rilis"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Login Button */}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="border-t border-slate-800 pt-3 mt-2 flex flex-col gap-2">
              {/* Changelog in mobile */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChangelog?.();
                }}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors text-left"
              >
                <History className="w-4 h-4 text-sky-400" />
                <span>Riwayat Rilis (Changelog)</span>
              </button>

              <a
                href="https://github.com/AcademyCity-RND/AC-ProjectAxiom"
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
