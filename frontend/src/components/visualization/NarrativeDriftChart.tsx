import React, { useMemo } from 'react';
import { TrendingUp, Compass, AlertCircle, Info } from 'lucide-react';
import type { NarrativeDriftData } from '../../types';

interface NarrativeDriftChartProps {
  data?: NarrativeDriftData | null;
}

export const NarrativeDriftChart: React.FC<NarrativeDriftChartProps> = ({ data }) => {
  // Fallback demo data if no live drift data
  const fallbackData: NarrativeDriftData = useMemo(
    () => ({
      drift_detected: true,
      max_drift: 0.74,
      mean_drift: 0.48,
      window_count: 5,
      windows: [
        {
          window_index: 1,
          start_time: '08:00',
          end_time: '10:00',
          post_count: 32,
          top_keywords: ['#KawalKebijakan', 'ekonomi', 'anggaran'],
          drift_from_previous: 0.0,
          drift_from_start: 0.0,
        },
        {
          window_index: 2,
          start_time: '10:00',
          end_time: '12:00',
          post_count: 45,
          top_keywords: ['isu_kemenhan', 'pembelian_alutsista', 'transparansi'],
          drift_from_previous: 0.38,
          drift_from_start: 0.38,
        },
        {
          window_index: 3,
          start_time: '12:00',
          end_time: '14:00',
          post_count: 58,
          top_keywords: ['serangan_narasi', 'provokasi', 'keamanan_siber'],
          drift_from_previous: 0.52,
          drift_from_start: 0.65,
        },
        {
          window_index: 4,
          start_time: '14:00',
          end_time: '16:00',
          post_count: 39,
          top_keywords: ['agitasi_publik', 'framing', 'hoaks'],
          drift_from_previous: 0.41,
          drift_from_start: 0.74,
        },
        {
          window_index: 5,
          start_time: '16:00',
          end_time: '18:00',
          post_count: 24,
          top_keywords: ['klarifikasi', 'reaksi_resmi', 'kondusif'],
          drift_from_previous: 0.33,
          drift_from_start: 0.59,
        },
      ],
      summary:
        'Terdeteksi pergeseran narasi signifikan (Max Cosine Drift = 0.74). Kampanye berawal dari isu kebijakan umum lalu bergeser secara terencana ke penyerangan legitimasi institusi pertahanan pada jam 12:00 - 16:00.',
    }),
    []
  );

  const activeData = data || fallbackData;
  const windows = activeData.windows || [];

  return (
    <div className="cyber-card p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              SEMANTIC NARRATIVE DRIFT TRACKER
            </span>
            <span className="text-xs text-slate-400 font-mono">
              &bull; Mean Drift: {activeData.mean_drift?.toFixed(2) || '0.48'}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Evolusi & Pergeseran Narasi Semantik Antar-Jendela Waktu
          </h2>
        </div>

        {/* Drift Status Badge */}
        <div>
          {activeData.drift_detected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-[#FBBF24] border border-amber-500/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              PERGESERAN NARASI TERDETEKSI (DRIFT = {activeData.max_drift.toFixed(2)})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-[#34D399] border border-emerald-500/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              NARASI KONSISTEN / FOKUS TUNGGAL
            </span>
          )}
        </div>
      </div>

      {/* Windows Step Progress Visualization */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {windows.map((w, idx) => {
            const driftPercent = Math.round(w.drift_from_start * 100);
            return (
              <div
                key={w.window_index}
                className="bg-[#090D16] border border-[#1E293B] p-3 rounded space-y-2 relative group hover:border-sky-400 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Jendela #{w.window_index}</span>
                  <span className="text-[10px] text-sky-400 tabular-nums">
                    {w.start_time}-{w.end_time}
                  </span>
                </div>

                {/* Drift Meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Drift Pusat:</span>
                    <span className="text-amber-400 font-bold tabular-nums">
                      {w.drift_from_start.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full transition-all"
                      style={{ width: `${Math.min(driftPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Keywords Chips */}
                <div className="space-y-1 pt-1 border-t border-[#1E293B]/60">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                    Kata Kunci ({w.post_count} Post)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {w.top_keywords.map((kw, ki) => (
                      <span
                        key={ki}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#131C2E] text-slate-300 truncate max-w-full"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Explanation Box */}
      <div className="p-3 bg-[#131C2E] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
        <p>{activeData.summary}</p>
      </div>
    </div>
  );
};
