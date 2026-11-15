import React from 'react';
import { Network, Database, Cpu, Share2, ShieldCheck, ArrowRight } from 'lucide-react';

export const VisualWorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Ingestion & Scraping',
      desc: 'Pemanenan profil dan cuitan dari platform X, Instagram, dan YouTube tanpa ketergantungan API komersial berbayar.',
      icon: Database,
      tag: 'Multi-Platform',
      color: 'text-sky-400',
    },
    {
      num: '02',
      title: 'Rekayasa 21-Fitur',
      desc: 'Transformasi raw text menjadi 21 vektor perilaku: rasio follow, sirkadian malam, entropi konten, dan repetisi.',
      icon: Cpu,
      tag: 'Feature Engineering',
      color: 'text-emerald-400',
    },
    {
      num: '03',
      title: 'Inferensi Model XGBoost',
      desc: 'Klasifikasi presisi 3 kelas (HUMAN, BUZZER, BOT) menggunakan model yang dilatih pada 271 dataset nyata Indonesia.',
      icon: Network,
      tag: 'CV 99.73%',
      color: 'text-amber-400',
    },
    {
      num: '04',
      title: 'Analisis Graf CIB & SNA',
      desc: 'Pemetaan klaster koordinasi copypasta narasi dan hubungan interaksi antar aktor menggunakan Social Network Analysis.',
      icon: Share2,
      tag: 'Cosine > 0.85',
      color: 'text-indigo-400',
    },
    {
      num: '05',
      title: 'Chain of Custody SHA-256',
      desc: 'Penerbitan dossier intelijen terenkripsi dan buku besar komentator 100% untuk pembuktian hukum dan laporan dinas.',
      icon: ShieldCheck,
      tag: 'BAP Bukti Digital',
      color: 'text-purple-400',
    },
  ];

  return (
    <section id="workflow" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <Network className="w-3.5 h-3.5" />
            <span>Transparansi Arsitektur</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Alur Pipeline Forensik End-to-End
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Proses sistematis dari pemanenan data mentah OSINT hingga menjadi berkas dossier intelijen
            resmi yang sah secara hukum.
          </p>
        </div>

        {/* Steps Horizontal / Vertical Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative group hover:border-slate-700 transition-colors shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-500">{step.num}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {step.tag}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl bg-slate-950/80 w-fit mb-3 border border-slate-800 ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600 pointer-events-none">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
