import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Search,
  Filter,
  FileDown,
  ChevronRight,
  ExternalLink,
  Flame,
  Layers,
  Info,
} from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';
import type { TopAttacker, LedgerItem } from '../../types';

interface DualTierLedgerTableProps {
  topAttackers?: TopAttacker[];
  fullLedger?: LedgerItem[];
  caseId: string;
  onInspectRow: (data: any) => void;
  onExportCsv: () => void;
  onExportHtml: () => void;
}

export const DualTierLedgerTable: React.FC<DualTierLedgerTableProps> = ({
  topAttackers = [],
  fullLedger = [],
  caseId,
  onInspectRow,
  onExportCsv,
  onExportHtml,
}) => {
  const [activeTier, setActiveTier] = useState<'tier1' | 'tier2'>('tier1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'BOT' | 'BUZZER' | 'ORGANIC'>('ALL');

  // Fallback demo sample data if case has no comments yet
  const defaultTop10: TopAttacker[] = useMemo(
    () => [
      {
        username: '@provokator_alpha',
        comment_count: 24,
        cluster_connections: 18,
        posted_in_burst_window: true,
        risk_score: 96.5,
        estimated_category: 'BUZZER',
      },
      {
        username: '@bot_retweet_army_1',
        comment_count: 38,
        cluster_connections: 14,
        posted_in_burst_window: true,
        risk_score: 94.2,
        estimated_category: 'BOT',
      },
      {
        username: '@buzzer_amplif_indo',
        comment_count: 19,
        cluster_connections: 12,
        posted_in_burst_window: false,
        risk_score: 88.0,
        estimated_category: 'BUZZER',
      },
      {
        username: '@warga_biasa_01',
        comment_count: 3,
        cluster_connections: 0,
        posted_in_burst_window: false,
        risk_score: 12.0,
        estimated_category: 'ORGANIC',
      },
    ],
    []
  );

  const defaultFullLedger: LedgerItem[] = useMemo(
    () => [
      {
        index: 1,
        username: '@provokator_alpha',
        platform: 'X',
        post_id: 'post_1001',
        published_at: '2026-11-02 09:14:22',
        content: 'Kebijakan pertahanan ini harus ditolak keras! Rakyat dirugikan! #TolakAnggaran',
        likes: 142,
        replies: 28,
        in_cib_cluster: true,
        cluster_similarity: 0.92,
        in_burst_window: true,
        estimated_class: 'BUZZER',
        risk_score: 96.5,
      },
      {
        index: 2,
        username: '@bot_retweet_army_1',
        platform: 'X',
        post_id: 'post_1002',
        published_at: '2026-11-02 09:15:01',
        content: 'RT @provokator_alpha: Kebijakan pertahanan ini harus ditolak keras! Rakyat dirugikan! #TolakAnggaran',
        likes: 12,
        replies: 0,
        in_cib_cluster: true,
        cluster_similarity: 0.98,
        in_burst_window: true,
        estimated_class: 'BOT',
        risk_score: 94.2,
      },
      {
        index: 3,
        username: '@buzzer_amplif_indo',
        platform: 'X',
        post_id: 'post_1003',
        published_at: '2026-11-02 09:16:45',
        content: 'Betul sekali, transparansi alutsista tidak jelas sama sekali! Viralkan kawan-kawan!',
        likes: 85,
        replies: 9,
        in_cib_cluster: true,
        cluster_similarity: 0.88,
        in_burst_window: false,
        estimated_class: 'BUZZER',
        risk_score: 88.0,
      },
      {
        index: 4,
        username: '@warga_biasa_01',
        platform: 'X',
        post_id: 'post_1004',
        published_at: '2026-11-02 10:22:10',
        content: 'Saya kira perlu dikaji ulang secara obyektif datanya sebelum saling serang opini.',
        likes: 4,
        replies: 1,
        in_cib_cluster: false,
        cluster_similarity: 0.24,
        in_burst_window: false,
        estimated_class: 'ORGANIC',
        risk_score: 12.0,
      },
    ],
    []
  );

  const attackers = topAttackers.length > 0 ? topAttackers : defaultTop10;
  const ledger = fullLedger.length > 0 ? fullLedger : defaultFullLedger;

  // Filter Full Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass =
        classFilter === 'ALL' ||
        (classFilter === 'BOT' && item.estimated_class === 'BOT') ||
        (classFilter === 'BUZZER' && item.estimated_class === 'BUZZER') ||
        (classFilter === 'ORGANIC' && item.estimated_class === 'ORGANIC');

      return matchSearch && matchClass;
    });
  }, [ledger, searchQuery, classFilter]);

  return (
    <div className="cyber-card p-4 space-y-4">
      {/* Table Header: Title & Dual-Tier Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              DUAL-TIER FORENSIC AUDIT LEDGER
            </span>
            <span className="text-xs text-slate-400 font-mono">&bull; Case ID: {caseId}</span>
          </div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            Audit Terperinci 100% Seluruh Komentator & Aktor Penyerang
          </h2>
        </div>

        {/* Dual-Tier Tabs & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Tier Switcher */}
          <div className="flex items-center p-0.5 bg-[#090D16] border border-[#1E293B] rounded text-xs">
            <button
              onClick={() => setActiveTier('tier1')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTier === 'tier1'
                  ? 'bg-[#1E293B] text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tier 1: Top 10 Attackers
            </button>
            <button
              onClick={() => setActiveTier('tier2')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTier === 'tier2'
                  ? 'bg-[#1E293B] text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tier 2: 100% Full Ledger ({ledger.length})
            </button>
          </div>

          {/* Export Buttons */}
          <button
            onClick={onExportCsv}
            title="Download Raw Ledger CSV"
            className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            CSV
          </button>
          <button
            onClick={onExportHtml}
            title="Cetak Dossier Resmi (A4)"
            className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-400" />
            Dossier HTML
          </button>
        </div>
      </div>

      {/* Tier 1 View: Top 10 Core Attackers Table */}
      {activeTier === 'tier1' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Daftar 10 akun penyerang dengan skor risiko disinformasi tertinggi, volume komentar amplifikasi terbanyak,
            dan keterpautan klaster sindikat CIB terkuat.
          </div>

          <div className="overflow-x-auto rounded border border-[#1E293B]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#131C2E] border-b border-[#1E293B] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                <tr>
                  <th className="py-2.5 px-3">Peringkat & Akun</th>
                  <th className="py-2.5 px-3">Kategori Ancaman</th>
                  <th className="py-2.5 px-3 text-center">Volume Post</th>
                  <th className="py-2.5 px-3 text-center">Klaster CIB</th>
                  <th className="py-2.5 px-3 text-center">Burst Window</th>
                  <th className="py-2.5 px-3 text-right">Skor Risiko</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {attackers.map((atk, idx) => (
                  <tr
                    key={idx}
                    onClick={() =>
                      onInspectRow({
                        title: atk.username,
                        subtitle: `Top Attacker #${idx + 1} - Skor Risiko ${atk.risk_score}`,
                        threatClass: atk.estimated_category,
                        threatLevel: atk.risk_score >= 80 ? 'CRITICAL' : atk.risk_score >= 50 ? 'HIGH' : 'LOW',
                        indicators: [
                          { label: 'Jumlah Komentar/Post', value: atk.comment_count, mono: true },
                          { label: 'Koneksi Klaster CIB', value: `${atk.cluster_connections} Akun`, mono: true },
                          { label: 'Masuk Jendela Lonjakan (Burst)', value: atk.posted_in_burst_window ? 'Ya' : 'Tidak' },
                          { label: 'Skor Risiko Terhitung', value: `${atk.risk_score} / 100`, mono: true },
                        ],
                      })
                    }
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-sky-400">
                      <span className="text-slate-500 mr-2 text-xs">#{idx + 1}</span>
                      {atk.username}
                    </td>
                    <td className="py-2.5 px-3">
                      <ThreatBadge type="class" value={atk.estimated_category} />
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-xs text-slate-200">
                      {atk.comment_count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-xs">
                      {atk.cluster_connections > 0 ? (
                        <span className="text-amber-400 font-semibold">{atk.cluster_connections} Akun</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {atk.posted_in_burst_window ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400">
                          <Flame className="w-3 h-3 text-rose-400" />
                          Burst Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Reguler</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-xs text-rose-400">
                      {atk.risk_score.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                        Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier 2 View: 100% Full Comprehensive Ledger */}
      {activeTier === 'tier2' && (
        <div className="space-y-3">
          {/* Filter Bar (Search + Category Pills) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari username atau kata kunci komentar..."
                className="w-full h-8 pl-8 pr-3 bg-[#090D16] border border-[#1E293B] rounded text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setClassFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  classFilter === 'ALL'
                    ? 'bg-[#1E293B] text-sky-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({ledger.length})
              </button>
              <button
                onClick={() => setClassFilter('BUZZER')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  classFilter === 'BUZZER'
                    ? 'bg-amber-950/40 text-amber-400 font-semibold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Buzzer
              </button>
              <button
                onClick={() => setClassFilter('BOT')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  classFilter === 'BOT'
                    ? 'bg-rose-950/40 text-rose-400 font-semibold border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bot
              </button>
              <button
                onClick={() => setClassFilter('ORGANIC')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  classFilter === 'ORGANIC'
                    ? 'bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Organik
              </button>
            </div>
          </div>

          {/* Full Ledger Table (Max 5 Columns) */}
          <div className="overflow-x-auto rounded border border-[#1E293B]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#131C2E] border-b border-[#1E293B] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                <tr>
                  <th className="py-2.5 px-3">Akun / Komentator</th>
                  <th className="py-2.5 px-3">Klasifikasi AI</th>
                  <th className="py-2.5 px-3">Cuplikan Narasi</th>
                  <th className="py-2.5 px-3 text-right">Skor Risiko</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredLedger.map((item) => (
                  <tr
                    key={item.index}
                    onClick={() =>
                      onInspectRow({
                        title: item.username,
                        subtitle: `${item.platform} &bull; Diposting pada: ${item.published_at}`,
                        threatClass: item.estimated_class,
                        threatLevel: item.risk_score >= 80 ? 'CRITICAL' : item.risk_score >= 50 ? 'HIGH' : 'LOW',
                        textSnippet: item.content,
                        indicators: [
                          { label: 'Kesamaan Klaster CIB', value: item.cluster_similarity ? item.cluster_similarity.toFixed(3) : '0.00', mono: true },
                          { label: 'Terpaut Klaster CIB', value: item.in_cib_cluster ? 'Ya' : 'Tidak' },
                          { label: 'Terdeteksi Jendela Burst', value: item.in_burst_window ? 'Ya' : 'Tidak' },
                          { label: 'Jumlah Like & Reply', value: `${item.likes} Likes / ${item.replies} Replies`, mono: true },
                        ],
                        rawMetadata: item,
                      })
                    }
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-sky-400 truncate max-w-[150px]">
                      {item.username}
                    </td>
                    <td className="py-2.5 px-3">
                      <ThreatBadge type="class" value={item.estimated_class} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs truncate max-w-[280px]">
                      {item.content}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs font-semibold text-rose-400">
                      {item.risk_score.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                        Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
