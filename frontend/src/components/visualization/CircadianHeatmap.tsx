import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { CircadianHeatmapData } from '../../types';

interface CircadianHeatmapProps {
  data?: CircadianHeatmapData | null;
}

export const CircadianHeatmap: React.FC<CircadianHeatmapProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; count: number } | null>(null);

  // Fallback demo matrix (Simulating structured office hours buzzer wave)
  const fallbackData: CircadianHeatmapData = useMemo(() => {
    // 7 rows (Senin..Minggu) x 24 columns
    const matrix: number[][] = Array.from({ length: 7 }, (_, dayIdx) =>
      Array.from({ length: 24 }, (_, hour) => {
        // Monday (0) to Friday (4), hours 9 to 17 have heavy buzzer activity
        if (dayIdx < 5 && hour >= 9 && hour <= 17) {
          return Math.floor(12 + Math.sin(hour) * 6 + (dayIdx % 2) * 4);
        }
        // Sporadic night/weekend activity
        if (dayIdx >= 5 && hour >= 10 && hour <= 14) {
          return 2;
        }
        return Math.random() > 0.8 ? 1 : 0;
      })
    );

    return {
      total_posts: 148,
      matrix_7x24: matrix,
      matrix_24x7: [],
      normalized_matrix: [],
      days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      hours: Array.from({ length: 24 }, (_, i) => i),
      peak_day: 'Rabu',
      peak_hour: 11,
      working_hours_ratio: 0.86,
      night_hours_ratio: 0.04,
      chi2_statistic: 42.6,
      chi2_p_value: 0.0001,
      pattern_type: 'STRUCTURED_OFFICE_HOURS',
      explanation:
        'Aktivitas posting terfokus 86.0% pada hari kerja jam 09:00 - 17:00 (Uji Chi-Square p < 0.001), mengindikasikan pola operator buzzer bayaran terstruktur.',
    };
  }, []);

  const activeData = data || fallbackData;
  const matrix = activeData.matrix_7x24 || fallbackData.matrix_7x24;
  const days = activeData.days?.length === 7 ? activeData.days : ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Calculate max count for color scaling
  const maxVal = useMemo(() => {
    let m = 1;
    matrix.forEach((row) => {
      row.forEach((v) => {
        if (v > m) m = v;
      });
    });
    return m;
  }, [matrix]);

  // Color generator: smooth slate-900 to Tactical Cyan / Amber
  const getCellColor = (count: number, isWorkingHour: boolean) => {
    if (count === 0) return 'bg-[#090D16] border-[#1E293B]/40';
    const intensity = Math.min(count / maxVal, 1);

    if (activeData.pattern_type === 'STRUCTURED_OFFICE_HOURS' && isWorkingHour) {
      if (intensity > 0.7) return 'bg-amber-400 text-slate-950 font-bold border-amber-300';
      if (intensity > 0.4) return 'bg-amber-500/80 text-white font-semibold border-amber-500';
      return 'bg-amber-500/30 text-amber-200 border-amber-500/40';
    }

    if (intensity > 0.7) return 'bg-sky-400 text-slate-950 font-bold border-sky-300';
    if (intensity > 0.4) return 'bg-sky-500/80 text-white font-semibold border-sky-500';
    return 'bg-sky-500/30 text-sky-200 border-sky-500/40';
  };

  return (
    <div className="cyber-card p-4 space-y-4">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              CIRCADIAN 24X7 TEMPORAL ANALYSIS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              &bull; Chi-Square p = {activeData.chi2_p_value < 0.001 ? '< 0.001' : activeData.chi2_p_value.toFixed(3)}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Matriks Distribusi Waktu Postingan (24 Jam &times; 7 Hari)
          </h2>
        </div>

        {/* Pattern Classification Badge */}
        <div>
          {activeData.pattern_type === 'STRUCTURED_OFFICE_HOURS' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-[#FBBF24] border border-amber-500/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              POLA JAM KERJA TERSTRUKTUR (BUZZER)
            </span>
          ) : activeData.pattern_type === 'CONTINUOUS_24_7_AUTOMATION' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-[#F87171] border border-rose-500/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              OTOMASI 24/7 NON-STOP (BOT)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-[#34D399] border border-emerald-500/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              DISTRIBUSI ORGANIK MANUSIAWI
            </span>
          )}
        </div>
      </div>

      {/* Heatmap Grid Visualizer */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px] space-y-1.5 select-none font-mono">
          {/* Hour Labels Header (00:00 to 23:00) */}
          <div className="flex items-center text-[10px] text-[#64748B] pl-14">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 text-center truncate">
                {i % 3 === 0 ? `${i.toString().padStart(2, '0')}` : ''}
              </div>
            ))}
          </div>

          {/* 7 Days Rows */}
          {days.map((dayName, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-1.5">
              {/* Day Label */}
              <div className="w-12 text-[11px] font-medium text-slate-300 text-right pr-2 shrink-0">
                {dayName.slice(0, 3)}
              </div>

              {/* 24 Hour Cells */}
              <div className="flex-1 grid grid-cols-24 gap-1 relative">
                {matrix[dayIdx]?.map((count, hour) => {
                  const isWorkingHour = dayIdx < 5 && hour >= 9 && hour <= 17;
                  const cellColor = getCellColor(count, isWorkingHour);

                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHoveredCell({ day: dayName, hour, count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-6 rounded-[2px] border text-[9px] tabular-nums flex items-center justify-center cursor-pointer transition-colors duration-100 ${cellColor}`}
                      title={`${dayName} ${hour.toString().padStart(2, '0')}:00 - ${count} postingan`}
                    >
                      {count > 0 && count > maxVal * 0.5 ? count : ''}
                    </div>
                  );
                })}
              </div>
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
            {Math.round(activeData.working_hours_ratio * 100)}% dari Total Aktivitas
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Uji Chi-Square Goodness-of-Fit
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums text-sky-400 mt-0.5">
            &chi;&sup2; = {activeData.chi2_statistic.toFixed(1)} (p &lt; 0.001)
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Jam Puncak Aktivitas
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums text-slate-200 mt-0.5">
            {activeData.peak_day}, {activeData.peak_hour}:00 WIB
          </div>
        </div>
      </div>

      {/* Forensic Insight Explanation */}
      <div className="p-3 bg-[#131C2E] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
        <p>{activeData.explanation}</p>
      </div>
    </div>
  );
};
