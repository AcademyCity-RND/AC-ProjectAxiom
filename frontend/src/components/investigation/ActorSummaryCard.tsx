import React, { useState } from 'react';
import { User, CheckCircle2, ChevronRight, Info, ShieldAlert, Check } from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';
import { useCaseStore } from '../../store/useCaseStore';
import type { ActorSummary, DetectionResultData } from '../../types';

interface ActorSummaryCardProps {
  actor?: ActorSummary | null;
  detection?: DetectionResultData | null;
  target: string;
  platform: string;
  onInspectFeatures: () => void;
}

export const ActorSummaryCard: React.FC<ActorSummaryCardProps> = ({
  actor,
  detection,
  target,
  platform,
  onInspectFeatures,
}) => {
  const predictedClass = detection?.predicted_class || 'UNKNOWN';
  const confidence = detection?.confidence || 0;
  const confidencePercent = Math.round(confidence * 100);

  // SVG circular ring calculations (radius = 32, circumference = 2 * PI * 32 = ~201)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidencePercent / 100) * circumference;

  // Ring stroke color by class
  const getRingColor = () => {
    const cls = predictedClass.toUpperCase();
    if (cls === 'BOT') return '#F87171'; // Rose
    if (cls === 'BUZZER') return '#FBBF24'; // Amber
    if (cls === 'HUMAN') return '#34D399'; // Emerald
    return '#38BDF8'; // Sky
  };

  const ringColor = getRingColor();

  // Extract key signals for quick preview
  const features = detection?.extracted_features || {};
  const postsPerDay = features.posts_per_day !== undefined ? Number(features.posts_per_day).toFixed(1) : '0.0';
  const burstiness = features.burstiness_score !== undefined ? Number(features.burstiness_score).toFixed(2) : '0.00';
  const temporalEntropy = features.temporal_entropy !== undefined ? Number(features.temporal_entropy).toFixed(2) : '0.00';

  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleAddToWatchlist = async () => {
    setIsAdding(true);
    try {
      const cls = (predictedClass || 'SUSPICIOUS').toUpperCase();
      const defaultTag = cls === 'BOT' ? 'propaganda_botnet' : cls === 'BUZZER' ? 'buzzer_coordinator' : 'suspicious_cib';
      await useCaseStore.getState().addToWatchlist({
        username: target,
        platform: platform.toLowerCase(),
        tag: defaultTag,
        notes: `Ditambahkan dari investigasi kasus. Klasifikasi AI: ${predictedClass} (Keyakinan: ${confidencePercent}%)`,
      });
      setIsAddedToWatchlist(true);
      setTimeout(() => setIsAddedToWatchlist(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan target ke Watchlist');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="cyber-card p-4 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
          PROFIL & IDENTITAS AKTOR TARGET
        </div>
        <span className="text-xs font-mono text-slate-400 uppercase">{platform}</span>
      </div>

      {/* Profile & Confidence Ring Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Profile Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded bg-[#131C2E] border border-[#1E293B] flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-6 h-6 text-slate-400" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white font-mono">
                {target.startsWith('@') ? target : `@${target}`}
              </h3>
              {actor?.is_verified && (
                <span title="Terverifikasi">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                </span>
              )}
            </div>

            <div className="text-xs text-slate-300 font-medium">
              {actor?.display_name || 'Akun Siber Kognitif'}
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 max-w-sm leading-relaxed">
              {actor?.bio || 'Tidak ada bio deskripsi publik yang terpasang pada profil ini.'}
            </p>
          </div>
        </div>

        {/* Confidence Ring Indicator (SVG) */}
        <div className="flex items-center gap-3 bg-[#090D16] border border-[#1E293B] p-2.5 rounded shrink-0">
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-18 h-18 -rotate-90" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#1E293B"
                strokeWidth="6"
                fill="none"
              />
              {/* Animated Progress circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={ringColor}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold font-mono tabular-nums text-white">
                {confidencePercent}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                CONF
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              HASIL DETEKSI
            </div>
            <ThreatBadge type="class" value={predictedClass} />
            <div className="text-[10px] text-slate-400 font-mono">
              Model: XGBoost 21-F
            </div>
          </div>
        </div>
      </div>

      {/* Structural & Behavioral Signals Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1E293B]">
        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Pengikut / Mengikuti
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-0.5">
            {actor?.followers_count ?? 120} / {actor?.following_count ?? 850}
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Frekuensi Postingan
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-0.5">
            {postsPerDay} / hari
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Burstiness Parameter
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-0.5">
            B = {burstiness}
          </div>
        </div>

        <div className="bg-[#090D16] border border-[#1E293B] p-2.5 rounded">
          <div className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            Entropi Temporal
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-0.5">
            H = {temporalEntropy}
          </div>
        </div>
      </div>

      {/* Footer Action: Trigger Inspector Drawer & Watchlist */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Ekstraksi 21 fitur lengkap tersedia
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToWatchlist}
            disabled={isAddedToWatchlist || isAdding}
            className={`border px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120 ${
              isAddedToWatchlist
                ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                : 'border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white'
            }`}
          >
            {isAddedToWatchlist ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terpantau</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAdding ? 'Menyimpan...' : 'Pantau di Watchlist'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onInspectFeatures}
            className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120"
          >
            <span>Inspeksi 21 Fitur XAI</span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
