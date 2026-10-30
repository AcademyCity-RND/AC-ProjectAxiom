import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  Radar,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  Search,
  RefreshCw,
  Copy,
  Check,
  X,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Pagination } from '../common/Pagination';
import { AuditDetailModal } from './AuditDetailModal';
import type { AuditLogItem, AuditSummary } from '../../types';

interface AuditLogTabProps {
  logs: AuditLogItem[];
  summary: AuditSummary | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({
  logs,
  summary,
  isLoading,
  error,
  onRefresh,
}) => {
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchAuditQuery, setSearchAuditQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogItem | null>(null);
  const AUDIT_PAGE_SIZE = 15;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (operatorFilter !== 'ALL' && log.operator_username !== operatorFilter) {
        return false;
      }
      if (actionFilter !== 'ALL') {
        if (actionFilter === 'SCRAPE' && log.action !== 'SCRAPE_INVESTIGATION') return false;
        if (actionFilter === 'DOWNLOAD_PDF' && log.action !== 'DOWNLOAD_DOSSIER_PDF') return false;
        if (actionFilter === 'DOWNLOAD_CSV' && log.action !== 'DOWNLOAD_LEDGER_CSV') return false;
        if (actionFilter === 'USER_MUTATION' && !log.action.startsWith('USER_')) return false;
      }
      if (searchAuditQuery.trim()) {
        const q = searchAuditQuery.toLowerCase();
        const matchTarget = log.target?.toLowerCase().includes(q);
        const matchOperator = log.operator_username.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDocCode = (log.details as any)?.document_code?.toLowerCase().includes(q);
        const matchHash = (log.details as any)?.sha256_hash?.toLowerCase().includes(q);
        const matchCaseId = (log.details as any)?.case_id?.toLowerCase().includes(q);
        if (!matchTarget && !matchOperator && !matchAction && !matchDocCode && !matchHash && !matchCaseId) {
          return false;
        }
      }
      return true;
    });
  }, [logs, operatorFilter, actionFilter, searchAuditQuery]);

  const uniqueOperators = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.operator_username) set.add(l.operator_username);
    });
    return Array.from(set);
  }, [logs]);

  const paginatedLogs = filteredLogs.slice(
    (auditPage - 1) * AUDIT_PAGE_SIZE,
    auditPage * AUDIT_PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      {/* Metrik Audit Forensik Menggunakan Shared StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          label="Total Aktivitas Forensik"
          value={summary?.total_activities ?? logs.length}
          subtext="Log operasional tercatat"
          icon={Terminal}
        />
        <StatCard
          label="Operasi Scrapping / Investigasi"
          value={
            summary?.total_scraping_operations ??
            logs.filter((l) => l.action === 'SCRAPE_INVESTIGATION').length
          }
          subtext="Target @username & event URL"
          colorVariant="sky"
          icon={Radar}
        />
        <StatCard
          label="Ekspor Dokumen (PDF / CSV)"
          value={
            summary?.total_document_downloads ??
            logs.filter((l) => l.action.startsWith('DOWNLOAD_')).length
          }
          subtext="Ditandai SHA-256 untuk tracing"
          colorVariant="amber"
          icon={Fingerprint}
        />
      </div>

      {/* Banner Informasi Digital Leak Tracing */}
      <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-900/80 border border-amber-500/30 p-3.5 rounded-lg flex items-start gap-3">
        <Fingerprint className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-amber-300 font-mono tracking-tight flex items-center gap-2">
            <span>DIGITAL LEAK TRACING &amp; CHAIN OF CUSTODY (PUSSIBERAD)</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
              TAMPER-PROOF
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Setiap dokumen <strong>Dossier PDF (@media print)</strong> dan{' '}
            <strong>Dataset CSV</strong> yang diekspor oleh analis secara otomatis dicap dengan{' '}
            <strong>Kode Dokumen Unik</strong> dan <strong>SHA-256 Evidence Hash</strong>. Apabila
            berkas intelijen bocor ke publik, Satgas dapat mencocokkan kode atau hash tersebut ke tabel
            di bawah untuk menemukan identitas akun operator pengekspor, alamat IP, dan waktu penerbitannya.
          </p>
        </div>
      </div>

      {/* Filter Bar Log */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-950/70 border border-slate-800/80 p-3 rounded-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchAuditQuery}
              onChange={(e) => setSearchAuditQuery(e.target.value)}
              placeholder="Cari target, kode dokumen, hash..."
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 font-mono"
            />
            {searchAuditQuery && (
              <button
                onClick={() => setSearchAuditQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            aria-label="Filter Operator"
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
          >
            <option value="ALL">Semua Operator ({logs.length})</option>
            {uniqueOperators.map((op) => (
              <option key={op} value={op}>
                Operator: {op}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter Kategori Aksi"
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
          >
            <option value="ALL">Semua Kategori Aksi</option>
            <option value="SCRAPE">Scrapping / Investigasi</option>
            <option value="DOWNLOAD_PDF">Unduh Dossier PDF</option>
            <option value="DOWNLOAD_CSV">Unduh Dataset CSV</option>
            <option value="USER_MUTATION">Manajemen Akun</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 font-medium shrink-0"
          title="Segarkan Log"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Tabel Log Forensik */}
      <div className="cyber-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            JEJAK LOG OPERASIONAL &amp; PELACAKAN DOKUMEN FORENSIK
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            Menampilkan: {filteredLogs.length} Entri
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/30 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
              <tr>
                <th className="py-3 px-3.5 sm:px-4">Waktu (WIB)</th>
                <th className="py-3 px-3.5 sm:px-4">Operator &amp; Role</th>
                <th className="py-3 px-3.5 sm:px-4">Kategori Aksi</th>
                <th className="py-3 px-3.5 sm:px-4">Sasaran / Input</th>
                <th className="py-3 px-3.5 sm:px-4">Kode Dokumen / SHA-256 Hash</th>
                <th className="py-3 px-3.5 sm:px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const isScrape = log.action === 'SCRAPE_INVESTIGATION';
                  const isPdf = log.action === 'DOWNLOAD_DOSSIER_PDF';
                  const isCsv = log.action === 'DOWNLOAD_LEDGER_CSV';
                  const isUserMutation = log.action.startsWith('USER_');
                  const isAdmin = log.operator_role === 'admin';
                  const docCode = (log.details as any)?.document_code;
                  const sha256 = (log.details as any)?.sha256_hash;
                  const caseId = (log.details as any)?.case_id;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                      <td className="py-3 px-3.5 sm:px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-100">
                            {log.operator_username}
                          </span>
                          {isAdmin ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
                              ADMIN
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25">
                              USER
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                        {isScrape && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/25">
                            <Radar className="w-3 h-3" />
                            SCRAPE
                          </span>
                        )}
                        {isPdf && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/25">
                            <FileText className="w-3 h-3 text-rose-400" />
                            UNDUH PDF
                          </span>
                        )}
                        {isCsv && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                            UNDUH CSV
                          </span>
                        )}
                        {isUserMutation && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            USER MGMT
                          </span>
                        )}
                        {!isScrape && !isPdf && !isCsv && !isUserMutation && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {log.action}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 sm:px-4">
                        <div
                          className="font-mono text-xs text-slate-200 truncate max-w-[220px]"
                          title={log.target || '-'}
                        >
                          {log.target || (caseId ? `Case: ${caseId}` : '-')}
                        </div>
                        {log.details && (log.details as any).platform && (
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">
                            Platform: {(log.details as any).platform} &bull; Max:{' '}
                            {(log.details as any).max_interactions ||
                              (log.details as any).max_comments ||
                              '-'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 sm:px-4">
                        {docCode || sha256 ? (
                          <div className="space-y-1">
                            {docCode && (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                                <Fingerprint className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="font-semibold">{docCode}</span>
                              </div>
                            )}
                            {sha256 && (
                              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                                <span className="truncate max-w-[140px]" title={sha256}>
                                  {sha256.substring(0, 16)}...
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyHash(sha256)}
                                  className="p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Salin SHA-256 Hash Lengkap"
                                >
                                  {copiedHash === sha256 ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-500">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 sm:px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLogDetail(log)}
                          className="px-2 py-1 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-xs font-mono transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-mono">
                    {isLoading ? 'Memuat log aktivitas forensik...' : 'Tidak ada log yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={auditPage}
          totalItems={filteredLogs.length}
          pageSize={AUDIT_PAGE_SIZE}
          onPageChange={setAuditPage}
          itemLabel="log aktivitas"
        />
      </div>

      <AuditDetailModal
        log={selectedLogDetail}
        onClose={() => setSelectedLogDetail(null)}
      />
    </div>
  );
};
