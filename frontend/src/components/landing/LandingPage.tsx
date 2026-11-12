import React, { useEffect } from 'react';
import { SplashTransition } from './SplashTransition';
import { AdaptiveNavbar } from './AdaptiveNavbar';
import { HeroSection } from './HeroSection';
import { GuestDemoSandbox } from './GuestDemoSandbox';
import { CoreFeaturesSection } from './CoreFeaturesSection';
import { VisualWorkflowSection } from './VisualWorkflowSection';
import { DocumentationViewer } from './DocumentationViewer';
import { ChangelogTimeline } from './ChangelogTimeline';
import { AboutManifestoSection } from './AboutManifestoSection';
import { FooterSection } from './FooterSection';

interface LandingPageProps {
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin }) => {
  // Bidirectional Scroll Reveal using IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            entry.target.classList.add('opacity-100', 'translate-y-0');
          } else {
            // Memudar lembut saat ditinggalkan (dua arah)
            entry.target.classList.remove('opacity-100', 'translate-y-0');
            entry.target.classList.add('opacity-10', 'translate-y-8');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px',
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
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-8">
        <GuestDemoSandbox onNavigateLogin={onNavigateLogin} />
      </div>

      {/* 5. Core Features Section */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-8">
        <CoreFeaturesSection />
      </div>

      {/* 6. Visual Workflow Section */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-8">
        <VisualWorkflowSection />
      </div>

      {/* 7. Documentation & Installation Guide (Laravel Docs-Style) */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-8">
        <DocumentationViewer />
      </div>

      {/* 8. Project Changelog & Roadmap */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-8">
        <ChangelogTimeline />
      </div>

      {/* 9. About Axiom & Anti-Slop Manifesto */}
      <div className="reveal-section transition-all duration-700 ease-out opacity-0 translate-y-8">
        <AboutManifestoSection />
      </div>

      {/* 10. Minimalist Footer */}
      <FooterSection onNavigateLogin={onNavigateLogin} />
    </div>
  );
};
