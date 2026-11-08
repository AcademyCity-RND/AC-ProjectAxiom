import React, { useState } from 'react';
import {
  User,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
  Check,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Users,
  Flame,
} from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';
import { PlatformIcon } from '../common/PlatformIcon';
import { useCaseStore } from '../../store/useCaseStore';
import type {
  ActorSummary,
  DetectionResultData,
  HostMetadata,
  HarvestSummary,
  AITrainingFeatures,
} from '../../types';

interface ActorSummaryCardProps {
  actor?: ActorSummary | null;
  detection?: DetectionResultData | null;
  target: string;
  platform: string;
  onInspectFeatures: () => void;
  resultSummary?: Record<string, any> | null;
}

export const ActorSummaryCard: React.FC<ActorSummaryCardProps> = ({
  actor,
  detection,
  target,
  platform,
  onInspectFeatures,
  resultSummary,
}) => {
  const isEvent =
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    platform === 'youtube' ||
    platform === 'instagram' ||
    Boolean((actor?.profile_metadata as any)?.is_event);

  const predictedClass = detection?.predicted_class || 'UNKNOWN';
  const confidence = detection?.confidence || 0;
  const confidencePercent = Math.round(confidence * 100);

  // Extract host metadata & harvest summary if in Event mode
  const hostMetadata: HostMetadata | undefined =
    (resultSummary as any)?.host_metadata ||
    (actor?.profile_metadata as any)?.host_metadata;

  const harvestSummary: HarvestSummary | undefined =
    (resultSummary as any)?.harvest_summary ||
    (actor?.profile_metadata as any)?.harvest_summary;

  const aiTrainingFeatures: AITrainingFeatures | undefined =
    (resultSummary as any)?.ai_training_features;

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

  // Event specific signals
  const totalComments =
    harvestSummary?.total_comments_extracted ??
    features.total_comments ??
    actor?.following_count ??
    0;
  const uniqueCommenters =
    harvestSummary?.unique_commenters_count ??
    features.unique_commenters ??
    actor?.followers_count ??
    0;
  const burstRatio = features.burst_ratio
    ? `${(Number(features.burst_ratio) * 100).toFixed(1)}% Serentak`
    : aiTrainingFeatures?.f_temporal_burst_ratio
    ? `${(Number(aiTrainingFeatures.f_temporal_burst_ratio) * 100).toFixed(1)}% Serentak`
    : 'Normal';
  const clusterCount =
    features.cluster_links_count ??
    aiTrainingFeatures?.f_cluster_links_count ??
    (resultSummary as any)?.cib_clusters_count ??
    0;
  const spammerRatio =
    harvestSummary?.spammer_ratio !== undefined
      ? `${(harvestSummary.spammer_ratio * 100).toFixed(1)}%`
      : totalComments > 0
      ? `${(((totalComments - uniqueCommenters) / totalComments) * 100).toFixed(1)}%`
      : '0.0%';

  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  // Helper title & badges for event content
  const getEventBadge = () => {
    const cType = hostMetadata?.content_type?.toLowerCase();
    if (cType === 'shorts') return { label: 'YOUTUBE SHORTS', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
    if (cType === 'video') return { label: 'YOUTUBE VIDEO', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
    if (cType === 'reel') return { label: 'INSTAGRAM REEL', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    if (cType === 'post') return { label: 'INSTAGRAM POST', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    if (cType === 'tweet') return { label: 'X TWEET (STATUS)', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' };

    // Fallback detection from target string
    const lower = target.toLowerCase();
    if (lower.includes('/shorts/')) return { label: 'YOUTUBE SHORTS', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { label: 'YOUTUBE VIDEO', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
    if (lower.includes('/reel/') || lower.includes('/reels/')) return { label: 'INSTAGRAM REEL', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    if (lower.includes('instagram.com')) return { label: 'INSTAGRAM POST', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    if (lower.includes('/status/')) return { label: 'X TWEET', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' };

    return { label: `${platform.toUpperCase()} EVENT`, color: 'text-sky-400 border-slate-700 bg-slate-800' };
  };

  const eventBadge = getEventBadge();

  const handleAddToWatchlist = async () => {
    setIsAdding(true);
    setWatchlistError(null);
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
      setWatchlistError(err.message || 'Gagal menambahkan target ke Watchlist');
      setTimeout(() => setWatchlistError(null), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="cyber-card p-5 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
          {isEvent ? 'AUDIT NARASI & KONTEN VIRAL (EVENT AUDIT)' : 'PROFIL & IDENTITAS AKTOR TARGET'}
        </div>
        <div className="flex items-center gap-2">
          {isEvent && (
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${eventBadge.color}`}>
              {eventBadge.label}
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
            <PlatformIcon
              platform={platform}
              className={`w-3.5 h-3.5 ${
                platform === 'youtube'
                  ? 'text-rose-400'
                  : platform === 'instagram'
                  ? 'text-amber-400'
                  : 'text-sky-400'
              }`}
            />
            <span>{platform}</span>
          </span>
        </div>
      </div>

      {/* Profile / Content & Confidence Ring Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Profile / Event Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
            {isEvent ? (
              <PlatformIcon
                platform={platform}
                className={`w-6 h-6 ${
                  platform === 'youtube'
                    ? 'text-rose-400'
                    : platform === 'instagram'
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}
              />
            ) : (
              <User className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            {isEvent ? (
              <>
                {/* Host Creator & Title Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight line-clamp-1 font-sans">
                    {hostMetadata?.title_or_caption || 'Audit Konten & Komentar Media Sosial'}
                  </h3>
                </div>

                {/* Creator Attribution */}
                {hostMetadata?.creator ? (
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-mono flex-wrap">
                    <span className="text-slate-400">Kreator:</span>
                    <span className="font-semibold text-sky-400">
                      {hostMetadata.creator.username_or_channel}
                    </span>
                    {hostMetadata.creator.is_verified && (
                      <span title="Terverifikasi Resmi">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 inline" />
                      </span>
                    )}
                    {hostMetadata.creator.subscribers_or_followers !== undefined && (
                      <span className="text-slate-500 font-sans text-[11px]">
                        ({hostMetadata.creator.subscribers_or_followers.toLocaleString('id-ID')}{' '}
                        {platform === 'youtube' ? 'Subscribers' : 'Followers'})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-mono truncate max-w-sm">
                    {target}
                  </div>
                )}

                {/* Canonical Target Link */}
                <a
                  href={target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 truncate max-w-xs sm:max-w-md transition-colors"
                  title="Buka konten asli di tab baru"
                >
                  <span className="truncate">{target}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white font-mono tracking-tight">
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
              </>
            )}
          </div>
        </div>

        {/* Confidence Ring Indicator (SVG) */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800/90 p-3 rounded-lg shrink-0 shadow-inner">
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
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold font-mono text-white tabular-nums">
                {confidencePercent}%
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                KEYAKINAN
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
              KLASIFIKASI MODEL
            </div>
            <ThreatBadge type="class" value={predictedClass} />
            <div className="text-[11px] font-mono text-slate-400">
              {predictedClass === 'BOT' && 'Otomasi Skrip / Botnet'}
              {predictedClass === 'BUZZER' && 'Koordinasi Opini Siber'}
              {predictedClass === 'HUMAN' && 'Perilaku Wajar / Organik'}
              {predictedClass === 'UNKNOWN' && 'Evaluasi Diperlukan'}
            </div>
          </div>
        </div>
      </div>

      {/* Structural & Behavioral Signals Strip (Adapted for Event vs Actor) */}
      {isEvent ? (
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          {/* Top Row: Host Engagement Stats if available */}
          {hostMetadata?.engagement && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
                <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-sky-400" />
                  <span>Tayangan (Views)</span>
                </div>
                <div className="text-xs font-mono font-semibold tabular-nums text-sky-400 mt-1">
                  {hostMetadata.engagement.views_count !== undefined
                    ? hostMetadata.engagement.views_count.toLocaleString('id-ID')
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
                <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-3 h-3 text-emerald-400" />
                  <span>{platform === 'x' ? 'Total Suka (Likes)' : 'Suka / Dislike'}</span>
                </div>
                <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
                  {hostMetadata.engagement.likes_count !== undefined
                    ? hostMetadata.engagement.likes_count.toLocaleString('id-ID')
                    : '0'}
                  {platform !== 'x' && hostMetadata.engagement.dislikes_count !== undefined && (
                    <span className="text-slate-500 text-[10px] ml-1">
                      ({hostMetadata.engagement.dislikes_count} RYD)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
                <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-amber-400" />
                  <span>Komentar Platform</span>
                </div>
                <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
                  {hostMetadata.engagement.total_comments_on_platform !== undefined
                    ? hostMetadata.engagement.total_comments_on_platform.toLocaleString('id-ID')
                    : totalComments}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
                <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-rose-400" />
                  <span>Rasio Berulang (Spam)</span>
                </div>
                <div className="text-xs font-mono font-semibold tabular-nums text-rose-400 mt-1">
                  {spammerRatio}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Row: Forensic Harvest & ML Anomaly Signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
                Panen Forensik
              </div>
              <div className="text-xs font-mono font-semibold tabular-nums text-sky-400 mt-1">
                {totalComments} Komentar
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
                Komentator Unik
              </div>
              <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
                {uniqueCommenters} Akun
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
                Lonjakan (Burst)
              </div>
              <div className="text-xs font-mono font-semibold tabular-nums text-amber-400 mt-1">
                {burstRatio}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
                Klaster Sindikat CIB
              </div>
              <div className="text-xs font-mono font-semibold tabular-nums text-rose-400 mt-1">
                {clusterCount} Klaster
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Actor 21-Feature Signals Strip */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
              Pengikut / Mengikuti
            </div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
              {actor?.followers_count ?? 120} / {actor?.following_count ?? 850}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
              Frekuensi Postingan
            </div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
              {postsPerDay} / hari
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
              Parameter Lonjakan (Burstiness)
            </div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
              B = {burstiness}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner">
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
              Entropi Waktu (Temporal H)
            </div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-200 mt-1">
              H = {temporalEntropy}
            </div>
          </div>
        </div>
      )}

      {/* Footer Action: Trigger Inspector Drawer & Watchlist */}
      <div className="pt-2 flex flex-col gap-2.5">
        {watchlistError && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{watchlistError}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            {isEvent
              ? 'Data komentar dan indikator kampanye terintegrasi'
              : 'Ekstraksi 21 fitur lengkap tersedia'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToWatchlist}
              disabled={isAddedToWatchlist || isAdding}
              className={`border px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer shadow-sm ${
                isAddedToWatchlist
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
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
              className="border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
            >
              <span>{isEvent ? 'Inspeksi Indikator' : 'Inspeksi 21 Fitur'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
