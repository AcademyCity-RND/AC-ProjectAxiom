import React, { useState, useEffect } from 'react';
import { Shield, Radio } from 'lucide-react';

interface SplashTransitionProps {
  onFinish?: () => void;
}

export const SplashTransition: React.FC<SplashTransitionProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 600ms display, lalu mulai fade-out 300ms, total < 950ms
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
        {/* Radar Ring Glow Effect */}
        <div className="absolute w-24 h-24 rounded-full border border-sky-500/20 animate-ping" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <Shield className="w-8 h-8 text-sky-400" />
          <Radio className="w-3.5 h-3.5 text-emerald-400 absolute top-2 right-2 animate-pulse" />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
            Project Axiom
          </h2>
          <p className="mt-1 font-mono text-[11px] text-sky-400 tracking-wider">
            KERNEL READY • V1.0.0-RC
          </p>
        </div>
      </div>
    </div>
  );
};
