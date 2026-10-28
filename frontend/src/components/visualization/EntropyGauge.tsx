import React, { useMemo } from 'react';
import { Gauge, Activity, Clock, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import type { PostingEntropyData } from '../../types';

interface EntropyGaugeProps {
  data?: PostingEntropyData | null;
}

export const EntropyGauge: React.FC<EntropyGaugeProps> = ({ data }) => {
  // Jika belum ada data kasus yang dimuat -> Tactical Empty State
  if (!data) {
    return (
      <div className="cyber-card p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
          <Gauge className="w-5 h-5" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            PENGUKUR ENTROPI PENJADWALAN BELUM TERPILIH
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pilih kasus investigasi untuk menghitung Shannon Posting Entropy (H_norm) dan memeriksa variabilitas jeda waktu interval postingan target.
          </p>
        </div>
      </div>
    );
  }

  const hNorm = data.normalized_entropy ?? 0.0;
  const percentage = Math.round(hNorm * 100);

  // Status configuration
  const config = useMemo(() => {
    if (data.classification === 'INSUFFICIENT_DATA') {
      return {
        label: 'SAMPEL INTERVAL TERBATAS',
        color: 'text-slate-300',
        bg: 'bg-slate-800',
        border: 'border-slate-700',
        barColor: 'bg-slate-500',
        dotColor: 'bg-slate-400',
      };
    }
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
  }, [hNorm, data.classification]);

  const bins = data.bins_distribution || {};
  const maxBinVal = Math.max(...Object.values(bins), 1);

  return (
    <div className="cyber-card p-5 space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Shannon Posting Entropy (Pengukur Kekakuan Waktu)
            </h2>
            <p className="text-[11px] text-slate-400">
              Tingkat keacakan jeda waktu postingan &bull; Rentang [0.00 = Sangat Kaku, 1.00 = Sangat Acak]
            </p>
          </div>
        </div>

        {/* Current Classification Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold font-mono uppercase ${config.bg} ${config.color} border ${config.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`}></span>
          {config.label}
        </span>
      </div>

      {/* Linear Meter Gauge */}
      <div className="space-y-2 pt-1">
        <div className="flex items-baseline justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
              SKOR NORMALISASI (H_norm):
            </span>
            <span className={`text-xl font-bold font-mono tabular-nums ${config.color}`}>
              {hNorm.toFixed(2)}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">({percentage}%)</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
            <span>&lt; 0.35 Bot</span>
            <span>0.35 - 0.70 Buzzer</span>
            <span>&ge; 0.70 Organik</span>
          </div>
        </div>

        {/* Progress Bar with Zone Markers */}
        <div className="relative w-full h-3 bg-[#090D16] border border-[#1E293B] rounded-full overflow-hidden">
          {/* Threshold Zones Background */}
          <div className="absolute inset-0 flex opacity-20">
            <div className="w-[35%] bg-rose-500 border-r border-rose-300"></div>
            <div className="w-[35%] bg-amber-500 border-r border-amber-300"></div>
            <div className="w-[30%] bg-emerald-500"></div>
          </div>

          {/* Active Value Fill */}
          <div
            className={`h-full ${config.barColor} transition-all duration-300 relative z-10`}
            style={{ width: `${Math.min(Math.max(percentage, 2), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Interval Bins Histogram (8-bin distribution) */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] font-semibold uppercase tracking-wider">
            DISTRIBUSI JEDA WAKTU POSTINGAN ({data.total_intervals} INTERVAL TERCATAT):
          </span>
          <span className="font-mono text-slate-400 text-[10px]">
            Median Interval:{' '}
            <strong className="text-white">
              {data.median_interval_sec < 60
                ? `${Math.round(data.median_interval_sec)} dtk`
                : `${Math.round(data.median_interval_sec / 60)} mnt`}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(bins).map(([binLabel, count]) => {
            const heightPct = Math.round((count / maxBinVal) * 100);
            return (
              <div
                key={binLabel}
                className="bg-[#090D16] border border-[#1E293B] p-2 rounded flex flex-col justify-between items-center text-center space-y-1.5"
              >
                <div className="w-full h-12 flex items-end justify-center bg-[#0F172A]/40 rounded pb-0.5">
                  <div
                    className={`w-4/5 rounded-t-[2px] ${
                      binLabel.includes('<') || binLabel.includes('Rapid')
                        ? 'bg-rose-500/80'
                        : binLabel.includes('m')
                        ? 'bg-amber-500/80'
                        : 'bg-sky-500/80'
                    }`}
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                    title={`${binLabel}: ${count} interval`}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate w-full" title={binLabel}>
                  {binLabel}
                </div>
                <div className="text-xs font-mono font-bold text-white tabular-nums">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Diagnostic Explanation */}
      {data.explanation && (
        <div className="p-3 bg-[#131C2E] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <p>{data.explanation}</p>
        </div>
      )}
    </div>
  );
};
