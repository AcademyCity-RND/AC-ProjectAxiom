import React, { useState, useEffect } from 'react';
import { SplashTransition } from './SplashTransition';
import { AdaptiveNavbar } from './AdaptiveNavbar';
import { HeroSection } from './HeroSection';
import { GuestDemoSandbox } from './GuestDemoSandbox';
import { AboutManifestoSection } from './AboutManifestoSection';
import { TeamSection } from './TeamSection';
import { CoreFeaturesSection } from './CoreFeaturesSection';
import { VisualWorkflowSection } from './VisualWorkflowSection';
import { DocumentationViewer } from './DocumentationViewer';
import { FAQSection } from './FAQSection';
import { FooterSection } from './FooterSection';
import { LegalModal, type LegalModalType } from './LegalModal';
import { ChangelogModal } from './ChangelogModal';

interface LandingPageProps {
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin }) => {
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [changelogModalOpen, setChangelogModalOpen] = useState<boolean>(false);

  // Bidirectional Direction-Aware Scroll Reveal using IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // Masuk viewport (baik dari atas maupun dari bawah): kembali ke posisi normal dan opasitas 100
            el.classList.remove(
              'opacity-0',
              'opacity-10',
              'translate-y-10',
              '-translate-y-10',
              'translate-y-8',
              '-translate-y-8'
            );
            el.classList.add('opacity-100', 'translate-y-0');
          } else {
            // Meninggalkan viewport (dua arah):
            el.classList.remove('opacity-100', 'translate-y-0');

            // Deteksi arah keluar berdasarkan posisi terhadap viewport:
            if (entry.boundingClientRect.top < 0) {
              // Elemen berada di ATAS layar (user scroll ke bawah melewati elemen)
              // Saat user scroll balik ke atas, elemen akan muncul turun dari ATAS ke BAWAH (-translate-y-10 -> 0)
              el.classList.remove('translate-y-10', 'translate-y-8');
              el.classList.add('opacity-10', '-translate-y-10');
            } else {
              // Elemen berada di BAWAH layar (user scroll ke atas melewati elemen)
              // Saat user scroll turun, elemen akan muncul naik dari BAWAH ke ATAS (translate-y-10 -> 0)
              el.classList.remove('-translate-y-10', '-translate-y-8');
              el.classList.add('opacity-10', 'translate-y-10');
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 selection:bg-sky-500/20 selection:text-sky-300 relative overflow-x-hidden">
      {/* 1. Brief Splash Screen (800ms) */}
      <SplashTransition />

      {/* 2. Adaptive Sticky Floating Pill Navbar */}
      <AdaptiveNavbar
        onNavigateLogin={onNavigateLogin}
        onOpenChangelog={() => setChangelogModalOpen(true)}
      />

      {/* 3. Hero Section (Value Proposition) - Beranda */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-100 translate-y-0">
        <HeroSection />
      </div>

      {/* 4. Live Guest Demo Sandbox (Early Priority) - Demo */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <GuestDemoSandbox onNavigateLogin={onNavigateLogin} />
      </div>

      {/* 5. About Axiom & Forensic Integrity - Tentang */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <AboutManifestoSection />
      </div>

      {/* 6. Author & Development Team (AcademyCity-RND) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <TeamSection />
      </div>

      {/* 7. Core Features Section - Fitur */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <CoreFeaturesSection />
      </div>

      {/* 8. Visual Workflow Section - Alur */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <VisualWorkflowSection />
      </div>

      {/* 9. Documentation & Installation Guide - Dokumentasi */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <DocumentationViewer />
      </div>

      {/* 10. Frequently Asked Questions (FAQ) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <FAQSection />
      </div>

      {/* 11. Minimalist Footer with Privacy, Terms, and Changelog */}
      <FooterSection
        onNavigateLogin={onNavigateLogin}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenChangelog={() => setChangelogModalOpen(true)}
      />

      {/* 12. Legal Modal (Privacy Policy & Terms of Service) */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        onSwitchType={(t) => setLegalModalType(t)}
      />

      {/* 13. Changelog Pop-up Modal */}
      <ChangelogModal
        isOpen={changelogModalOpen}
        onClose={() => setChangelogModalOpen(false)}
      />
    </div>
  );
};
