import React, { useState, useEffect } from 'react';

interface SplashTransitionProps {
  onFinish?: () => void;
}

export const SplashTransition: React.FC<SplashTransitionProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 650ms display, lalu mulai fade-out 300ms, total < 950ms
    const timerFade = setTimeout(() => {
      setIsFading(true);
    }, 650);

    const timerDone = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, 950);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsVisible(false);
        onFinish?.();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0E17] transition-all duration-300 ease-out cursor-pointer ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="status"
      aria-label="Memuat Project Axiom"
    >
      <div className="relative flex flex-col items-center">
        {/* Radar Ring Glow Effect (Enlarged 2x) */}
        <div className="absolute w-44 h-44 rounded-full border border-sky-500/20 animate-ping" />
        <div className="relative flex items-center justify-center w-32 h-32 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5">
          <img
            src="/axiom-icon.png"
            alt="Axiom Emblem"
            className="w-full h-full object-contain drop-shadow-[0_8px_32px_rgba(56,189,248,0.35)]"
          />
        </div>

        <div className="mt-6 text-center flex flex-col items-center">
          <img
            src="/axiom-logo.png"
            alt="Project Axiom"
            className="h-14 sm:h-16 object-contain mb-2"
          />
          <p className="font-mono text-[11px] text-sky-400 tracking-wider">
            KERNEL READY • V1.0.0-RC
          </p>
        </div>
      </div>
    </div>
  );
};
