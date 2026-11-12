import React from 'react';
import { GitCommit, History, CheckCircle2 } from 'lucide-react';

export const ChangelogTimeline: React.FC = () => {
  const versions = [
    {
      version: 'v1.0.0-rc',
      date: 'November 2026',
      badge: 'Rilis Terkini',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      highlights: [
        'Retraining model XGBoost pada 271 dataset kasus nyata Indonesia dengan akurasi 5-fold CV 99.73% dan Macro F1 98.95%.',
        'Penerapan Public Landing Page & Interactive Guest Demo Sandbox tanpa friksi registrasi.',
        'Integrasi scraper multi-platform: X/Twitter, Instagram Reels/Posts, dan komentar YouTube.',
        'Dual-Tier Forensic Ledger dengan rantai barang bukti digital berstempel SHA-256.',
        'Endpoint akumulasi Master Retraining Dataset CSV untuk pelatihan ulang berkelanjutan.',
      ],
    },
    {
      version: 'v0.9.0',
      date: 'Oktober 2026',
      badge: 'Tonggak Penting',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      highlights: [
        'Implementasi Explainable AI (XAI) berbasis kontribusi fitur SHAP untuk transparansi keputusan model.',
        'Migrasi ke mesin embedding semantik lokal all-MiniLM-L6-v2 untuk efisiensi CPU tanpa latensi jaringan.',
        'Visualisasi heatmap ritme sirkadian 24/7 dan polaritas entropi teks postingan.',
      ],
    },
    {
      version: 'v0.5.0',
      date: 'September 2026',
      badge: 'Fondasi Awal',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      highlights: [
        'Perancangan arsitektur investigasi berbasis kasus (Case-Centric Intelligence Architecture).',
        'Integrasi algoritma deteksi bot ensemble (heuristik rasio pertemanan, entropi, dan aktivitas nokturnal).',
        'Manajemen pengguna berbasis peran (Role-Based Access Control) dan buku besar audit aktivitas.',
      ],
    },
  ];

  return (
    <section id="changelog" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <History className="w-3.5 h-3.5" />
            <span>Rekam Jejak Riset & Stabilitas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Riwayat Rilis & Perkembangan Platform
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Dokumentasi evolusi sistem Project Axiom dari pembuktian konsep awal hingga kesiapan
            operasional pertahanan siber.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative border-l border-slate-800 ml-4 sm:ml-8 space-y-10">
          {versions.map((ver) => (
            <div key={ver.version} className="relative pl-6 sm:pl-8 group">
              {/* Dot Icon */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-sky-400 group-hover:text-sky-400 transition-colors">
                <GitCommit className="w-4 h-4" />
              </div>

              {/* Version Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-mono text-base font-bold text-slate-100">{ver.version}</span>
                <span className="text-xs text-slate-500 font-mono">• {ver.date}</span>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${ver.badgeColor}`}
                >
                  {ver.badge}
                </span>
              </div>

              {/* Version Highlights Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {ver.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
