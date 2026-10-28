import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { CircadianHeatmapData } from '../../types';

interface CircadianHeatmapProps {
  data?: CircadianHeatmapData | null;
}

export const CircadianHeatmap: React.FC<CircadianHeatmapProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; count: number } | null>(null);

  // Jika belum ada data kasus yang dimuat -> Tactical Empty State
  if (!data) {
    return (
      <div className="cyber-card p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            MATRIKS SIRKADIAN BELUM TERPILIH
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pilih kasus dari riwayat beranda atau mulai investigasi target baru untuk memetakan matriks aktivitas 24x7 dan deteksi anomali jam kerja sindikat buzzer (09:00 - 17:00).
          </p>
        </div>
      </div>
    );
  }

  const matrix = data.matrix_7x24 && data.matrix_7x24.length === 7
    ? data.matrix_7x24
    : Array.from({ length: 7 }, () => Array(24).fill(0));

  const days = data.days && data.days.length === 7
    ? data.days
    : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Hitung nilai maksimum postingan per sel untuk skala intensitas warna
  const maxVal = useMemo(() => {
    let m = 1;
    matrix.forEach((row) => {
      row.forEach((v) => {
        if (v > m) m = v;
      });
    });
    return m;
  }, [matrix]);

  // Pewarnaan sel dinamis
  const getCellColor = (count: number, isWorkingHour: boolean) => {
    if (count === 0) return 'bg-[#090D16] border-[#1E293B]/40';
    const intensity = Math.min(count / maxVal, 1);

    if (data.pattern_type === 'STRUCTURED_OFFICE_HOURS' && isWorkingHour) {
      if (intensity > 0.7) return 'bg-amber-400 text-slate-950 font-bold border-amber-300';
      if (intensity > 0.4) return 'bg-amber-500/80 text-white font-semibold border-amber-500';
      return 'bg-amber-500/40 text-amber-200 border-amber-500/50';
    }

    if (intensity > 0.7) return 'bg-sky-400 text-slate-950 font-bold border-sky-300';
    if (intensity > 0.4) return 'bg-sky-500/80 text-white font-semibold border-sky-500';
    return 'bg-sky-500/30 text-sky-200 border-sky-500/40';
  };

  const isInsufficient = data.pattern_type === 'INSUFFICIENT_DATA';

  return (
    <div className="cyber-card p-5 space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
      {/* Header Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Distribusi Temporal Sirkadian (24 Jam &times; 7 Hari)
            </h2>
            <p className="text-[11px] text-slate-400">
              Volume aktivitas postingan berdasarkan hari dan jam ({data.total_posts} total aktivitas)
            </p>
          </div>
        </div>

        {/* Pattern Badge */}
        <div className="flex items-center gap-1.5">
          {data.pattern_type === 'STRUCTURED_OFFICE_HOURS' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-3 h-3" />
              SINDINIKAT OPERATOR BUZZER (JAM KERJA)
            </span>
          ) : data.pattern_type === 'CONTINUOUS_24_7_AUTOMATION' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Activity className="w-3 h-3" />
              OTOMASI BOT 24/7 NON-STOP
            </span>
          ) : isInsufficient ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Info className="w-3 h-3" />
              SAMPEL DATA TERBATAS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3" />
              VARIABILITAS ORGANIK ALAMI
            </span>
          )}
        </div>
      </div>

      {/* Insufficient Data Alert if posts < 10 */}
      {isInsufficient && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            {data.explanation || 'Sampel aktivitas target terbatas. Pola sirkadian memerlukan minimal 10-15 data aktivitas untuk konfirmasi statistik chi-square.'}
          </span>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-1">
          {/* Hour Labels Header (0 - 23) */}
          <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 text-[10px] text-slate-500 font-mono text-center pb-1">
            <div></div>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i}>{i}</div>
            ))}
          </div>

          {/* 7 Day Rows */}
          {matrix.map((row, dayIdx) => (
            <div key={dayIdx} className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 items-center">
              <div className="text-[11px] font-mono text-slate-400 truncate pr-1">
                {days[dayIdx]}
              </div>

              {row.map((count, hour) => {
                const isWorkingHour = dayIdx < 5 && hour >= 9 && hour <= 17;
                const cellColor = getCellColor(count, isWorkingHour);

                return (
                  <div
                    key={hour}
                    onMouseEnter={() => setHoveredCell({ day: days[dayIdx], hour, count })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-6 rounded-[2px] border text-[9px] tabular-nums flex items-center justify-center cursor-pointer transition-colors duration-100 ${cellColor}`}
                    title={`${days[dayIdx]} ${hour.toString().padStart(2, '0')}:00 - ${count} postingan`}
                  >
                    {count > 0 && count >= maxVal * 0.5 ? count : ''}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Working Hours Bounding Box Legend */}
          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-[#1E293B]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-[2px] bg-amber-500/30 border border-amber-500/60"></span>
              <span>Jam Kerja Terstruktur (Senin-Jumat 09:00 - 17:00)</span>
            </div>

            {hoveredCell ? (
              <div className="text-sky-400 font-mono">
                {hoveredCell.day} pukul {hoveredCell.hour.toString().padStart(2, '0')}:00 &bull;{' '}
                <span className="font-bold text-white">{hoveredCell.count}</span> postingan
              </div>
            ) : (
              <div className="text-slate-500 font-mono text-[10px]">
                Arahkan kursor pada sel untuk melihat volume per jam
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forensic Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Rasio Jam Kerja (09:00-17:00)
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums text-amber-400 mt-0.5">
            {Math.round(data.working_hours_ratio * 100)}% dari Total Aktivitas
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Uji Chi-Square Goodness-of-Fit
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums text-sky-400 mt-0.5">
            &chi;&sup2; = {data.chi2_statistic.toFixed(1)} (p = {data.chi2_p_value < 0.001 ? '< 0.001' : data.chi2_p_value.toFixed(3)})
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Jam Puncak Aktivitas
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums text-slate-200 mt-0.5">
            {data.peak_day || 'N/A'}, {data.peak_hour}:00 WIB
          </div>
        </div>
      </div>

      {/* Forensic Insight Explanation */}
      {!isInsufficient && data.explanation && (
        <div className="p-3 bg-[#131C2E] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <p>{data.explanation}</p>
        </div>
      )}
    </div>
  );
};
