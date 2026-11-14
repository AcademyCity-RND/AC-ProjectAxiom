import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Search,
  Filter,
  X,
  Layers,
} from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';
import { PlatformIcon } from '../common/PlatformIcon';
import { Pagination } from '../common/Pagination';
import type { CaseSummary } from '../../types';

interface CasesTableProps {
  cases: CaseSummary[];
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSelectCase: (caseId: string, caseItem?: CaseSummary) => void;
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
}

// Helper to format clean 6-channel display labels & badges
// Rule: Untuk X tweet maupun user ditulis username penulis saja, untuk 4 sisanya (YT Video, YT Shorts, IG Reel, IG Post) gunakan judul
const formatTargetDisplay = (
  target: string,
  platform: string,
  displayName?: string | null,
  creatorName?: string | null,
  contentTitle?: string | null
) => {
  const lower = target.toLowerCase();
  const isUrl = target.startsWith('http://') || target.startsWith('https://');

  // Channel 1: X User / Aktor
  if (!isUrl) {
    return {
      isUrl: false,
      label: target.startsWith('@') ? target : `@${target}`,
      subLabel: displayName && displayName !== target ? displayName : null,
      badge: 'X Aktor',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    };
  }

  // Channel 2: X Tweet
  if (lower.includes('/status/')) {
    let authorHandle = '';
    try {
      const match = target.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)\/status/i);
      if (match && match[1]) {
        authorHandle = `@${match[1]}`;
      }
    } catch {}

    const handle = authorHandle || (displayName?.startsWith('@') ? displayName : null) || `@${target.split('/status/')[0].split('/').pop()}`;
    return {
      isUrl: true,
      label: `Cuitan ${handle}`,
      subLabel: contentTitle || (displayName && !displayName.startsWith('@') ? displayName : 'Audit Komentar Cuitan X'),
      badge: 'X Tweet',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    };
  }

  // Channel 3: YouTube Shorts (Judul Konten)
  if (lower.includes('/shorts/')) {
    const creator = creatorName || displayName || 'YouTube Creator';
    return {
      isUrl: true,
      label: contentTitle || 'YouTube Shorts',
      subLabel: `Kreator: ${creator}`,
      badge: 'YT Shorts',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
  }

  // Channel 4: YouTube Video (Judul Konten)
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    const creator = creatorName || displayName || 'YouTube Creator';
    return {
      isUrl: true,
      label: contentTitle || 'Video YouTube Publik',
      subLabel: `Kreator: ${creator}`,
      badge: 'YT Video',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
  }

  // Channel 5: Instagram Reel (Judul / Keterangan Reel)
  if (lower.includes('/reel/') || lower.includes('/reels/')) {
    const creator = creatorName || displayName || 'Instagram User';
    return {
      isUrl: true,
      label: contentTitle || 'Instagram Reels Video',
      subLabel: `Kreator: @${creator.replace(/^@+/, '')}`,
      badge: 'IG Reel',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }

  // Channel 6: Instagram Post (Judul / Keterangan Postingan)
  if (lower.includes('instagram.com/p/')) {
    const creator = creatorName || displayName || 'Instagram User';
    return {
      isUrl: true,
      label: contentTitle || 'Instagram Feed Post',
      subLabel: `Kreator: @${creator.replace(/^@+/, '')}`,
      badge: 'IG Post',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }

  return {
    isUrl: true,
    label: contentTitle || displayName || target,
    subLabel: creatorName ? `Kreator: ${creatorName}` : null,
    badge: `${platform.toUpperCase()} Event`,
    badgeColor: 'text-slate-400 bg-slate-800 border-slate-700',
  };
};

export const CasesTable: React.FC<CasesTableProps> = ({
  cases,
  currentPage: externalPage,
  pageSize = 8,
  onPageChange: externalOnPageChange,
  onSelectCase,
  title = 'DATABASE SASARAN AKTIF (POSTGRESQL)',
  emptyMessage = 'Belum ada target atau kasus terdaftar di database PostgreSQL.',
  showFilters = false,
}) => {
  // Internal pagination state with fallback
  const [internalPage, setInternalPage] = useState<number>(1);
  const page = externalPage !== undefined ? externalPage : internalPage;

  const handlePageChange = (newPage: number) => {
    setInternalPage(newPage);
    if (externalOnPageChange) {
      externalOnPageChange(newPage);
    }
  };
  const setPage = handlePageChange;

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Filter cases based on search and selected options
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Platform filter
      if (platformFilter !== 'ALL') {
        const plat = (c.platform || '').toLowerCase();
        if (plat !== platformFilter.toLowerCase()) return false;
      }

      // 2. Classification filter
      if (classFilter !== 'ALL') {
        const verdict = (c.verdict || c.status || '').toUpperCase();
        if (classFilter === 'HUMAN' && !verdict.includes('HUMAN')) return false;
        if (classFilter === 'BUZZER' && !verdict.includes('BUZZER')) return false;
        if (classFilter === 'BOT' && !verdict.includes('BOT')) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTarget = (c.target || '').toLowerCase().includes(q);
        const matchCaseId = (c.case_id || '').toLowerCase().includes(q);
        const matchDisplayName = ((c as any).display_name || '').toLowerCase().includes(q);
        if (!matchTarget && !matchCaseId && !matchDisplayName) return false;
      }

      return true;
    });
  }, [cases, platformFilter, classFilter, searchQuery]);

  // Paginated slice
  const paginatedCases = useMemo(() => {
    return filteredCases.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredCases, page, pageSize]);

  return (
    <div className="space-y-3">
      {/* Optional Search Bar & Filter Controls (untuk Target Directory) */}
      {showFilters && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari akun target, nama, atau link..."
                className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  title="Bersihkan pencarian"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={platformFilter}
                onChange={(e) => {
                  setPlatformFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter Platform"
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
              >
                <option value="ALL">Semua Platform</option>
                <option value="x">X / Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            {/* AI Classification Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter Klasifikasi AI"
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
              >
                <option value="ALL">Semua Klasifikasi</option>
                <option value="HUMAN">Human / Autentik</option>
                <option value="BUZZER">Buzzer Terkoordinasi</option>
                <option value="BOT">Bot Otomatis</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 self-end lg:self-center shrink-0">
            Ditemukan: <span className="text-white font-medium">{filteredCases.length}</span> dari {cases.length} kasus
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="cyber-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            {title}
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {showFilters && (searchQuery || platformFilter !== 'ALL' || classFilter !== 'ALL')
              ? `Hasil Filter: ${filteredCases.length} Kasus`
              : `Total: ${cases.length} Kasus`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
              <tr>
                <th className="py-3 px-3.5 sm:px-5">Target / Akun</th>
                <th className="py-3 px-3.5 sm:px-5">Platform</th>
                <th className="py-3 px-3.5 sm:px-5">Klasifikasi AI</th>
                <th className="py-3 px-3.5 sm:px-5">Waktu / Status</th>
                <th className="py-3 px-3.5 sm:px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedCases.length > 0 ? (
                paginatedCases.map((rc, idx) => (
                  <tr
                    key={rc.case_id || idx}
                    onClick={() => onSelectCase(rc.case_id, rc)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                  >
                    {(() => {
                      const formatted = formatTargetDisplay(
                        rc.target,
                        rc.platform,
                        (rc as any).display_name,
                        (rc as any).creator_name,
                        (rc as any).content_title
                      );
                      return (
                        <>
                          <td className="py-3.5 px-3.5 sm:px-5 font-medium text-sky-400 group-hover:text-sky-300">
                            <div className="flex items-center gap-2.5">
                              {rc.avatar_url ? (
                                <img
                                  src={rc.avatar_url}
                                  alt={formatted.label}
                                  referrerPolicy="no-referrer"
                                  className={`w-8 h-8 ${formatted.isUrl ? 'rounded-md' : 'rounded-full'} object-cover border border-slate-700 shrink-0`}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className={`w-8 h-8 ${formatted.isUrl ? 'rounded-md' : 'rounded-full'} bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 font-mono`}>
                                  {formatted.label.replace(/^[@"']/, '').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="truncate block max-w-xs md:max-w-sm text-xs font-semibold text-white">
                                  {formatted.label}
                                </span>
                                {formatted.subLabel && (
                                  <span className="block text-[11px] text-slate-400 font-sans font-normal mt-0.5 truncate max-w-xs">
                                    {formatted.subLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs">
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold inline-flex items-center gap-1.5 ${formatted.badgeColor}`}>
                              <PlatformIcon platform={rc.platform || 'x'} className="w-3 h-3" />
                              <span>{formatted.badge}</span>
                            </span>
                          </td>
                        </>
                      );
                    })()}
                    <td className="py-3.5 px-3.5 sm:px-5">
                      <ThreatBadge
                        type="class"
                        value={rc.verdict || rc.status}
                        isEvent={rc.target.startsWith('http://') || rc.target.startsWith('https://') || rc.platform === 'youtube' || rc.platform === 'instagram'}
                      />
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs text-slate-400">
                      {rc.created_at
                        ? new Date(rc.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : (rc as any).date || rc.case_id}
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 text-right">
                      <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1 font-medium transition-colors">
                        Inspeksi Detail <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono">
                    {searchQuery || platformFilter !== 'ALL' || classFilter !== 'ALL'
                      ? 'Tidak ada target atau kasus yang cocok dengan filter yang dipilih.'
                      : emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalItems={filteredCases.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          itemLabel="kasus"
        />
      </div>
    </div>
  );
};
