import React, { useMemo } from 'react';
import { Gauge, Activity, Clock, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import type { PostingEntropyData } from '../../types';

interface EntropyGaugeProps {
  data?: PostingEntropyData | null;
}

export const EntropyGauge: React.FC<EntropyGaugeProps> = ({ data }) => {
  // Fallback demo data if no live data yet
  const fallbackData: PostingEntropyData = useMemo(
    () => ({
      total_intervals: 124,
      entropy: 0.65,
      normalized_entropy: 0.22, // Highly rigid scheduled
      mean_interval_sec: 142.5,
      median_interval_sec: 120.0,
      std_interval_sec: 45.2,
      bins_distribution: {
        '< 1m': 14,
        '1-5m': 78,
        '5-15m': 22,
        '15-60m': 6,
        '1-4h': 2,
        '4-12h': 1,
        '12-24h': 1,
        '> 24h': 0,
      },
      classification: 'HIGHLY_RIGID_SCHEDULED',
      explanation:
        'Entropi interval posting sangat rendah (H_norm = 0.22 < 0.35) dengan 74.2% interval posting berkerumun ketat pada rentang 1-5 menit. Pola ini membuktikan otomasi skrip tanpa jeda manusiawi.',
    }),
    []
  );

  const activeData = data || fallbackData;
  const hNorm = activeData.normalized_entropy ?? 0.22;
  const percentage = Math.round(hNorm * 100);

  // Status configuration
  const config = useMemo(() => {
    if (hNorm < 0.35) {
      return {
        label: 'OTOMASI TERJADWAL KETAT (BOT)',
        color: 'text-[#F87171]',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        barColor: 'bg-rose-500',
        dotColor: 'bg-rose-400',
      };
    }
    if (hNorm < 0.7) {
      return {
        label: 'SEMI-OTOMATIS / KOORDINASI TERFOKUS (BUZZER)',
        color: 'text-[#FBBF24]',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        barColor: 'bg-amber-500',
        dotColor: 'bg-amber-400',
      };
    }
    return {
      label: 'VARIABILITAS ALAMI MANUSIA (ORGANIK)',
      color: 'text-[#34D399]',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      barColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-400',
    };
  }, [hNorm]);

  const bins = activeData.bins_distribution || {};
  const maxBinVal = Math.max(...Object.values(bins), 1);

  return (
    <div className="cyber-card p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              BEHAVIORAL SHANNON ENTROPY (H_norm)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              &bull; Total Interval: {activeData.total_intervals}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            Pengukur Keteraturan Interval Posting (0.00 = Skrip, 1.00 = Alami)
          </h2>
        </div>

        {/* Classification Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${config.bg} ${config.color} border ${config.border} font-mono`}
        >
          <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
          {config.label}
        </span>
      </div>

      {/* Main Entropy Gauge Bar */}
      <div className="space-y-2 bg-[#090D16] border border-[#1E293B] p-4 rounded">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Skor Entropi Ternormalisasi:</span>
          <span className={`text-base font-bold tabular-nums ${config.color}`}>
            H_norm = {hNorm.toFixed(2)} ({percentage}%)
          </span>
        </div>

        {/* Track Bar with Threshold Bands */}
        <div className="relative h-4 bg-slate-900 rounded overflow-hidden border border-slate-800">
          {/* Threshold background zones */}
          <div className="absolute inset-0 flex">
            <div className="w-[35%] bg-rose-950/40 border-r border-rose-500/20" title="Zona Bot (< 0.35)"></div>
            <div className="w-[35%] bg-amber-950/40 border-r border-amber-500/20" title="Zona Buzzer (0.35 - 0.70)"></div>
            <div className="w-[30%] bg-emerald-950/40" title="Zona Organik (> 0.70)"></div>
          </div>

          {/* Active Progress Fill */}
          <div
            className={`h-full ${config.barColor} transition-all duration-700 relative`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {/* Pointer Indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-md"></div>
          </div>
        </div>

        {/* Threshold Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span className="text-rose-400">0.00 (Skrip/Otomasi)</span>
          <span className="text-amber-400">0.35 (Batas Buzzer)</span>
          <span className="text-emerald-400">0.70 (Batas Alami)</span>
          <span className="text-slate-400">1.00 (Acak Penuh)</span>
        </div>
      </div>

      {/* 8-Bin Interval Distribution Bar Chart */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] flex items-center justify-between">
          <span>Distribusi Interval Waktu (8-Bin Klastering)</span>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            Median: {(activeData.median_interval_sec / 60).toFixed(1)} Menit
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Object.entries(bins).map(([binKey, count]) => {
            const heightPercent = Math.max(Math.round((count / maxBinVal) * 100), 6);
            return (
              <div
                key={binKey}
                className="bg-[#090D16] border border-[#1E293B] p-2 rounded flex flex-col justify-between items-center h-24 text-center group hover:border-sky-400 transition-colors"
              >
                <div className="text-[10px] font-mono tabular-nums text-slate-400 group-hover:text-white">
                  {count}
                </div>

                {/* Vertical Bar */}
                <div className="w-full flex items-end justify-center h-12 bg-slate-900/60 rounded-[2px] p-0.5">
                  <div
                    className="w-full bg-sky-500/80 rounded-[1px] transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>

                <div className="text-[9px] font-mono text-slate-400 truncate max-w-full">
                  {binKey}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Explanation Card */}
      <div className="p-3 bg-[#131C2E] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
        <p>{activeData.explanation}</p>
      </div>
    </div>
  );
};
