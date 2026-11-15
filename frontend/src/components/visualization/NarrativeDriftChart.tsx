import React from 'react';
import { TrendingUp, Compass, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import type { NarrativeDriftData } from '../../types';

interface NarrativeDriftChartProps {
  data?: NarrativeDriftData | null;
}

export const NarrativeDriftChart: React.FC<NarrativeDriftChartProps> = ({ data }) => {
  // Jika belum ada data kasus yang dimuat -> Tactical Empty State
  if (!data || !data.windows || data.windows.length === 0) {
    return (
      <div className="cyber-card p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            PELACAK PERGESERAN NARASI BELUM TERPILIH
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pilih kasus investigasi dari menu Beranda untuk menganalisis pergeseran centroid semantik MiniLM embeddings dan perubahan kata kunci propaganda antar-jendela waktu.
          </p>
        </div>
      </div>
    );
  }

  const windows = data.windows;
  const maxDrift = data.max_drift ?? 0.0;
  const meanDrift = data.mean_drift ?? 0.0;

  return (
    <div className="cyber-card p-5 space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Pelacak Pergeseran Semantik Narasi (Narrative Drift)
            </h2>
            <p className="text-[11px] text-slate-400">
              Jarak kosinus centroid embeddings MiniLM antar-jendela waktu ({windows.length} fase dianalisis)
            </p>
          </div>
        </div>

        {/* Drift Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold font-mono uppercase ${
            data.drift_detected
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {data.drift_detected ? (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              PERGESERAN TOPIK SIGNIFIKAN
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              NARASI KONSISTEN &amp; STABIL
            </>
          )}
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Deviasi Maksimal Narasi
          </div>
          <div className="text-base font-mono font-bold tabular-nums text-white mt-0.5">
            {Math.round(maxDrift * 100)}% ({maxDrift.toFixed(3)})
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Rata-rata Pergeseran
          </div>
          <div className="text-base font-mono font-bold tabular-nums text-sky-400 mt-0.5">
            {Math.round(meanDrift * 100)}% ({meanDrift.toFixed(3)})
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Jumlah Jendela Waktu
          </div>
          <div className="text-base font-mono font-bold tabular-nums text-slate-200 mt-0.5">
            {windows.length} Jendela Temporal
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3 pt-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
          EVOLUSI KATA KUNCI & PERGESERAN PER FASE:
        </div>

        <div className="space-y-2">
          {windows.map((w, idx) => {
            const driftPct = Math.round((w.drift_from_start ?? 0) * 100);
            const isHighDrift = (w.drift_from_start ?? 0) >= 0.5;

            return (
              <div
                key={idx}
                className="bg-[#090D16] border border-[#1E293B] p-3 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                {/* Left: Window info & keywords */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      Fase {w.window_index}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {w.start_time?.slice(11, 16) || w.start_time} - {w.end_time?.slice(11, 16) || w.end_time}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({w.post_count} postingan)
                    </span>
                  </div>

                  {/* Keywords Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {w.top_keywords && w.top_keywords.length > 0 ? (
                      w.top_keywords.map((kw, kwIdx) => (
                        <span
                          key={kwIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E293B] text-slate-200"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Tidak ada kata kunci dominan</span>
                    )}
                  </div>
                </div>

                {/* Right: Drift meter */}
                <div className="md:w-48 shrink-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Drift Awal:</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isHighDrift ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {driftPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isHighDrift ? 'bg-amber-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${Math.min(driftPct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative Synthesis Insight */}
      {data.summary && (
        <div className="p-3 bg-[#131C2E] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <p>{data.summary}</p>
        </div>
      )}
    </div>
  );
};
