import React, { useEffect } from 'react';
import { SplashTransition } from './SplashTransition';
import { AdaptiveNavbar } from './AdaptiveNavbar';
import { HeroSection } from './HeroSection';
import { GuestDemoSandbox } from './GuestDemoSandbox';
import { CoreFeaturesSection } from './CoreFeaturesSection';
import { VisualWorkflowSection } from './VisualWorkflowSection';
import { DocumentationViewer } from './DocumentationViewer';
import { ChangelogTimeline } from './ChangelogTimeline';
import { TeamSection } from './TeamSection';
import { AboutManifestoSection } from './AboutManifestoSection';
import { FooterSection } from './FooterSection';

interface LandingPageProps {
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin }) => {
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
      <AdaptiveNavbar onNavigateLogin={onNavigateLogin} />

      {/* 3. Hero Section (Value Proposition) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-100 translate-y-0">
        <HeroSection />
      </div>

      {/* 4. Live Guest Demo Sandbox (Early Priority) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <GuestDemoSandbox onNavigateLogin={onNavigateLogin} />
      </div>

      {/* 5. Core Features Section */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <CoreFeaturesSection />
      </div>

      {/* 6. Visual Workflow Section */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <VisualWorkflowSection />
      </div>

      {/* 7. Documentation & Installation Guide (Laravel Docs-Style) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <DocumentationViewer />
      </div>

      {/* 8. Project Changelog & Roadmap */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <ChangelogTimeline />
      </div>

      {/* 9. Author & Development Team (AcademyCity-RND) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <TeamSection />
      </div>

      {/* 10. About Axiom & Forensic Integrity */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-10">
        <AboutManifestoSection />
      </div>

      {/* 11. Minimalist Footer */}
      <FooterSection onNavigateLogin={onNavigateLogin} />
    </div>
  );
};
