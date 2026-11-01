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
  onExportHtml?: () => void;
}

export const DualTierLedgerTable: React.FC<DualTierLedgerTableProps> = ({
  topAttackers = [],
  fullLedger = [],
  caseId,
  onInspectRow,
  onExportCsv,
}) => {
  const [activeTier, setActiveTier] = useState<'tier1' | 'tier2'>('tier1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'BOT' | 'BUZZER' | 'ORGANIC'>('ALL');

  const attackers = topAttackers;
  const ledger = fullLedger;

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
    <div className="cyber-card p-5 space-y-4">
      {/* Table Header: Title & Dual-Tier Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
              DUAL-TIER FORENSIC AUDIT LEDGER
            </span>
            <span className="text-xs text-slate-400 font-mono">&bull; Case ID: <span className="text-sky-400">{caseId || 'N/A'}</span></span>
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            Audit Terperinci 100% Seluruh Komentator &amp; Aktor Penyerang
          </h2>
        </div>

        {/* Dual-Tier Tabs & Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tier Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-md text-xs shadow-inner">
            <button
              onClick={() => setActiveTier('tier1')}
              className={`px-3 py-1 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                activeTier === 'tier1'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/80 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Tier 1: Top 10 Attackers
            </button>
            <button
              onClick={() => setActiveTier('tier2')}
              className={`px-3 py-1 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                activeTier === 'tier2'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/80 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Tier 2: 100% Full Ledger ({ledger.length})
            </button>
          </div>

          
        </div>
      </div>

      {/* Tier 1 View: Top 10 Core Attackers Table */}
      {activeTier === 'tier1' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Daftar 10 akun penyerang dengan skor risiko disinformasi tertinggi, volume komentar amplifikasi terbanyak,
            dan keterpautan klaster sindikat CIB terkuat.
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-800/80">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-950/70 border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                <tr>
                  <th className="py-3 px-4">Peringkat &amp; Akun</th>
                  <th className="py-3 px-4">Kategori Ancaman</th>
                  <th className="py-3 px-4 text-center">Volume Post</th>
                  <th className="py-3 px-4 text-center">Usia Akun</th>
                  <th className="py-3 px-4 text-center">Klaster CIB</th>
                  <th className="py-3 px-4 text-center">Burst Window</th>
                  <th className="py-3 px-4 text-right">Skor Risiko</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {attackers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                          <ShieldAlert className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-xs font-semibold text-slate-300">Belum Ada Aktor Inti Terdeteksi</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                          Pilih kasus dari direktori sasaran atau jalankan investigasi baru untuk memetakan peringkat aktor penyerang.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attackers.map((atk, idx) => (
                    <tr
                      key={idx}
                      onClick={() => {
                        const rawScore = atk.risk_score ?? 0;
                        const pctScore = rawScore <= 1.0 ? Math.round(rawScore * 100) : Math.round(rawScore);
                        const computedLevel =
                          atk.estimated_category === 'BOT' || pctScore >= 70
                            ? 'CRITICAL'
                            : atk.estimated_category === 'BUZZER' || pctScore >= 40
                            ? 'HIGH'
                            : 'LOW';

                        const matchedComments = fullLedger
                          .filter(
                            (l) => l.username.toLowerCase() === atk.username.toLowerCase()
                          )
                          .map((l) => ({
                            text: l.content,
                            timestamp: l.published_at,
                            likes: l.likes,
                          }));

                        onInspectRow({
                          title: `@${atk.username.replace(/^@/, '')}`,
                          subtitle: `Top Attacker #${idx + 1} • Skor Risiko ${pctScore}%`,
                          threatClass: atk.estimated_category,
                          confidence: pctScore / 100,
                          threatLevel: computedLevel,
                          comments: matchedComments,
                          indicators: [
                            { label: 'Jumlah Komentar/Post', value: String(atk.comment_count), mono: true },
                            { label: 'Koneksi Klaster CIB', value: `${atk.cluster_connections || 0} Akun`, mono: true },
                            { label: 'Masuk Jendela Lonjakan (Burst)', value: atk.posted_in_burst_window ? 'Ya' : 'Tidak' },
                            { label: 'Skor Risiko Terhitung', value: `${pctScore}%`, mono: true },
                            ...(atk.account_age_days_at_comment !== undefined
                              ? [{ label: 'Usia Akun Saat Komentar', value: `${atk.account_age_days_at_comment} hari`, mono: true }]
                              : []),
                            ...(atk.account_created_at
                              ? [{ label: 'Tanggal Registrasi Akun', value: atk.account_created_at, mono: true }]
                              : []),
                            ...(atk.signals && atk.signals.length > 0
                              ? [{ label: 'Sinyal Anomali Forensik', value: atk.signals.join(' • ') }]
                              : []),
                          ],
                          rawMetadata: atk,
                        });
                      }}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-sky-400 group-hover:text-sky-300">
                        <span className="text-slate-500 mr-2 text-xs">#{idx + 1}</span>
                        {atk.username}
                      </td>
                      <td className="py-3 px-4">
                        <ThreatBadge type="class" value={atk.estimated_category} />
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-xs text-slate-200">
                        {atk.comment_count}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-xs">
                        {atk.account_age_days_at_comment !== undefined ? (
                          atk.account_age_days_at_comment <= 7 ? (
                            <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                              {atk.account_age_days_at_comment} hari (Baru)
                            </span>
                          ) : (
                            <span className="text-slate-400">{atk.account_age_days_at_comment} hari</span>
                          )
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-xs">
                        {(atk.cluster_connections ?? 0) > 0 ? (
                          <span className="text-amber-400 font-semibold">{atk.cluster_connections} Akun</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {atk.posted_in_burst_window ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 font-medium">
                            <Flame className="w-3 h-3 text-rose-400" />
                            Burst Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">Reguler</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-xs text-rose-400">
                        {atk.risk_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1 font-medium transition-colors">
                          Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
                className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 shadow-inner transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <button
                onClick={() => setClassFilter('ALL')}
                className={`px-3 py-1 rounded-md transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                  classFilter === 'ALL'
                    ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Semua ({ledger.length})
              </button>
              <button
                onClick={() => setClassFilter('BUZZER')}
                className={`px-3 py-1 rounded-md transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 ${
                  classFilter === 'BUZZER'
                    ? 'bg-amber-950/40 text-amber-400 font-semibold border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Buzzer
              </button>
              <button
                onClick={() => setClassFilter('BOT')}
                className={`px-3 py-1 rounded-md transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50 ${
                  classFilter === 'BOT'
                    ? 'bg-rose-950/40 text-rose-400 font-semibold border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Bot
              </button>
              <button
                onClick={() => setClassFilter('ORGANIC')}
                className={`px-3 py-1 rounded-md transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50 ${
                  classFilter === 'ORGANIC'
                    ? 'bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Organik
              </button>
            </div>
          </div>

          {/* Full Ledger Table (Max 5 Columns) */}
          <div className="overflow-x-auto rounded-md border border-slate-800/80">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-950/70 border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                <tr>
                  <th className="py-3 px-4">Akun / Komentator</th>
                  <th className="py-3 px-4">Klasifikasi AI</th>
                  <th className="py-3 px-4">Cuplikan Narasi</th>
                  <th className="py-3 px-4 text-right">Skor Risiko</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                          <Search className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-xs font-semibold text-slate-300">
                          {ledger.length === 0 ? 'Buku Besar Kosong' : 'Tidak Ada Hasil yang Cocok'}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                          {ledger.length === 0
                            ? 'Belum ada log postingan atau komentar tercatat untuk kasus ini.'
                            : 'Coba ubah kata kunci pencarian atau reset filter kategori di atas.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((item) => (
                    <tr
                      key={item.index}
                      onClick={() => {
                        const rawScore = item.risk_score ?? 0;
                        const pctScore = rawScore <= 1.0 ? Math.round(rawScore * 100) : Math.round(rawScore);
                        const computedLevel =
                          item.estimated_class === 'BOT' || pctScore >= 70
                            ? 'CRITICAL'
                            : item.estimated_class === 'BUZZER' || pctScore >= 40
                            ? 'HIGH'
                            : 'LOW';

                        onInspectRow({
                          title: `@${item.username.replace(/^@/, '')}`,
                          subtitle: `${item.platform?.toUpperCase() || 'PLATFORM'} • Diposting: ${new Date(item.published_at).toLocaleString('id-ID')}`,
                          threatClass: item.estimated_class,
                          confidence: pctScore / 100,
                          threatLevel: computedLevel,
                          textSnippet: item.content,
                          comments: [
                            {
                              text: item.content,
                              timestamp: item.published_at,
                              likes: item.likes,
                            },
                          ],
                          indicators: [
                            { label: 'Kesamaan Klaster CIB', value: item.cluster_similarity ? item.cluster_similarity.toFixed(3) : '0.00', mono: true },
                            { label: 'Terpaut Klaster CIB', value: item.in_cib_cluster ? 'Ya' : 'Tidak' },
                            { label: 'Terdeteksi Jendela Burst', value: item.in_burst_window ? 'Ya' : 'Tidak' },
                            { label: 'Jumlah Like & Reply', value: `${item.likes} Likes / ${item.replies} Replies`, mono: true },
                            { label: 'Skor Risiko Terhitung', value: `${pctScore}%`, mono: true },
                          ],
                          rawMetadata: item,
                        });
                      }}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-sky-400 group-hover:text-sky-300 truncate max-w-[150px]">
                        {item.username}
                      </td>
                      <td className="py-3 px-4">
                        <ThreatBadge type="class" value={item.estimated_class} />
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs truncate max-w-xs md:max-w-md lg:max-w-lg" title={item.content}>
                        {item.content}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-xs font-semibold text-rose-400">
                        {item.risk_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1 font-medium transition-colors">
                          Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
