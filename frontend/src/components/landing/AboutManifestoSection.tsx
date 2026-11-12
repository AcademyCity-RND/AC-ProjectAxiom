import React from 'react';
import { ShieldCheck, Scale, Award, EyeOff } from 'lucide-react';

export const AboutManifestoSection: React.FC = () => {
  return (
    <section id="about" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Filosofi & Komitmen Etika</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Tentang Project Axiom & Manifesto Anti-Slop
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Prinsip perancangan platform intelijen siber kognitif yang memprioritaskan akurasi,
            transparansi bukti, dan keselamatan ruang informasi publik.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-100 mb-2">
                Pertahanan Domain Kognitif
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Operasi astroturfing dan manipulasi opini siber bertujuan melumpuhkan daya nalar
                kritis masyarakat. Project Axiom hadir untuk memberikan kejelasan forensik melalui data
                perilaku yang terukur.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 font-mono text-[11px] text-sky-400">
              Operasi Kognitif Taktis
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-100 mb-2">
                Kedaulatan & Etika OSINT
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Sistem tidak melakukan peretasan sistem privat. Seluruh data dikumpulkan secara pasif
                dari ranah publik terbuka (Open Source Intelligence) dan mematuhi asas forensik hukum
                digital.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 font-mono text-[11px] text-emerald-400">
              Kepatuhan Hukum Digital
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-100 mb-2">
                Standar Anti-Slop UI & Copy
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Bebas dari ilusi pemasaran AI, gradien ungu palsu, atau klaim statistik tanpa dasar.
                Setiap angka, grafik, dan baris kode dirancang untuk fungsionalitas murni analis
                intelijen.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 font-mono text-[11px] text-amber-400">
              Evidence Over Claims
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
