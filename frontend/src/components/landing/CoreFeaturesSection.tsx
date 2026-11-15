import React from 'react';
import { Layers, Clock, TrendingUp, FileCheck2, Cpu, Sparkles } from 'lucide-react';

export const CoreFeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Kapabilitas Forensik Siber</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Pilar Rekayasa Fitur & Deteksi Intelijen
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Kombinasi analisis pemrosesan bahasa alami (NLP), pemodelan graf relasi sosial, dan
            evaluasi statistik perilaku.
          </p>
        </div>

        {/* Feature Grid with Non-Uniform Hierarchy */}
        <div className="space-y-6">
          {/* 1. Flagship Feature: Full-Width Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Fitur 01 • Jaringan CIB</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                  Deteksi Perilaku Terkoordinasi (Coordinated Inauthentic Behavior)
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                  Algoritma vektor embedding lokal memindai kesamaan semantik teks secara otomatis
                  antar akun dalam jendela waktu yang sempit. Mengungkap sindikat akun buzzer bayaran
                  yang mengamplifikasi narasi serupa atau melakukan copypasta serentak.
                </p>
              </div>

              <div className="w-full md:w-64 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono shrink-0">
                <div className="text-slate-500 text-[11px] mb-1">Ambang Batas CIB:</div>
                <div className="text-sky-400 font-bold text-sm">Cosine Sim &gt; 0.85</div>
                <div className="text-slate-500 text-[11px] mt-2 mb-1">Mesin Vektor:</div>
                <div className="text-slate-300">all-MiniLM-L6-v2</div>
              </div>
            </div>
          </div>

          {/* 2 & 3. Asymmetric 2-Column Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 02: Circadian Rhythm */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Fitur 02 • Waktu Biologis</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                  Ritme Sirkadian 24/7 & Anomali Temporal
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Membedah distribusi jam cuitan harian untuk mengidentifikasi keberadaan manusia
                  organik vs mesin otomasi. Mendeteksi lonjakan aktivitas ekstrem (burst anomaly) pada
                  dini hari di luar kebiasaan jam biologis manusia.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Indikator Burstiness: 0.0 - 1.0</span>
                <span className="text-emerald-400">Heatmap 24 Jam</span>
              </div>
            </div>

            {/* Feature 03: Narrative Drift */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Fitur 03 • Semantik Drift</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                  Pemantauan Pergeseran Narasi (Narrative Drift)
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Mendeteksi anomali perubahan topik secara drastis dari waktu ke waktu. Berguna untuk
                  menemukan akun organik yang telah diperjualbelikan atau dibajak untuk kepentingan
                  kampanye disinformasi terselubung.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Pivoting Score Drift</span>
                <span className="text-amber-400">Deteksi Pembajakan</span>
              </div>
            </div>
          </div>

          {/* 4. Full-Width Forensic Ledger Preview */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-2">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Fitur 04 • Rantai Bukti Hukum</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                  Dual-Tier Forensic Ledger & Sidik Jari Kriptografis SHA-256
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                  Membedah 100% komentator menjadi dua lapisan audit: Tier-1 (Top 10 Penyerang Utama)
                  dan Tier-2 (Seluruh Buku Besar Aktivitas). Seluruh laporan diberi stempel hash SHA-256
                  kanonikal untuk menjamin rantai barang bukti digital (Chain of Custody) di pengadilan.
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Ekspor PDF Berita Acara
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                  Ekspor CSV Dual-Tier
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
