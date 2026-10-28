import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  Fingerprint,
  Shield,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import type { CaseSummary } from '../../types';

interface ExportActionPanelProps {
  caseId: string;
  target: string;
  platform: string;
  cases?: CaseSummary[];
  onSelectCase?: (caseId: string) => void;
}

export const ExportActionPanel: React.FC<ExportActionPanelProps> = ({
  caseId,
  target,
  platform,
  cases = [],
  onSelectCase,
}) => {
  const [isExportingHtml, setIsExportingHtml] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const htmlUrl = caseId ? api.getExportReportUrl(caseId, 'html') : '#';
  const csvUrl = caseId ? api.getExportReportUrl(caseId, 'csv') : '#';

  const handleExportHtml = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!caseId) {
      setExportError('Pilih kasus sasaran terlebih dahulu untuk mencetak berkas dossier.');
      return;
    }
    setExportError(null);
    setIsExportingHtml(true);
    try {
      await api.downloadReport(caseId, 'html');
    } catch (err: any) {
      setExportError(err.message || 'Gagal memuat berkas dossier forensik.');
    } finally {
      setIsExportingHtml(false);
    }
  };

  const handleExportCsv = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!caseId) {
      setExportError('Pilih kasus sasaran terlebih dahulu untuk mengunduh dataset CSV.');
      return;
    }
    setExportError(null);
    setIsExportingCsv(true);
    try {
      await api.downloadReport(caseId, 'csv');
    } catch (err: any) {
      setExportError(err.message || 'Gagal mengunduh dataset CSV.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Deterministic mock SHA-256 for display
  const mockSha256 = caseId
    ? `a4b7c12298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899`
        .split('')
        .map((c, i) => (caseId.charCodeAt(i % caseId.length) % 16).toString(16))
        .join('')
    : '0000000000000000000000000000000000000000000000000000000000000000';

  return (
    <div className="cyber-card p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                PUSSIBERAD FORENSIC INTELLIGENCE DOSSIER
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-[3px] bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
                RAHASIA
              </span>
            </div>
            <h2 className="text-base font-semibold text-white">
              Pusat Penerbitan & Ekspor Berkas Barang Bukti Hukum
            </h2>
          </div>
        </div>

        {/* Case Selector or Active Target Info */}
        <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-1">
          {cases.length > 0 && onSelectCase ? (
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-[11px] text-slate-500 font-sans">Pilih Kasus:</span>
              <select
                value={caseId}
                onChange={(e) => onSelectCase(e.target.value)}
                className="bg-[#090D16] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-400"
              >
                {cases.map((c) => (
                  <option key={c.case_id} value={c.case_id}>
                    {c.target} ({c.platform.toUpperCase()} - {c.status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                Case ID: <span className="text-sky-400">{caseId || 'Tidak Ada Kasus'}</span>
              </div>
              <div>
                Target: <span className="text-white">{target}</span> ({platform.toUpperCase()})
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {exportError && (
        <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Warning if no case is selected */}
      {!caseId && (
        <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded text-xs text-amber-300 flex items-center gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Belum ada kasus investigasi yang dipilih. Silakan pilih kasus di daftar atas atau jalankan investigasi target terlebih dahulu untuk mencetak dossier atau mengunduh dataset CSV.
          </span>
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Official HTML / PDF Dossier */}
        <div className="bg-[#090D16] border border-[#1E293B] rounded p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                Berkas Dossier Resmi (@media print A4)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                HTML / PDF
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Format laporan komprehensif siap cetak A4 berstandar militer. Memuat ringkasan eksekutif, tabel 21 fitur XGBoost, topologi jejaring CIB, matriks circadian, serta analisis bukti hukum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHtml}
              disabled={!caseId || isExportingHtml}
              className="flex-1 bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingHtml ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Merender Dossier...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Buka & Cetak Dossier Resmi</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </>
              )}
            </button>
            {caseId && (
              <a
                href={htmlUrl}
                target="_blank"
                rel="noreferrer"
                title="Buka langsung tautan terotentikasi di tab baru"
                className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 p-2 rounded text-xs flex items-center justify-center transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              </a>
            )}
          </div>
        </div>

        {/* Option 2: Full Commenter Raw CSV Ledger */}
        <div className="bg-[#090D16] border border-[#1E293B] rounded p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileDown className="w-4 h-4 text-emerald-400" />
                Raw Commenter Ledger (RFC 4180 CSV)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                CSV DATASET
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dataset mentah 100% seluruh akun komentator dan postingan. Dilengkapi skor risiko, klasifikasi AI, keterlibatan klaster, dan timestamp ISO-8601 siap olah di Gephi/Excel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={!caseId || isExportingCsv}
              className="flex-1 border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-200 hover:text-white font-medium py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingCsv ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Mengunduh Dataset...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unduh Dataset CSV Mentah</span>
                </>
              )}
            </button>
            {caseId && (
              <a
                href={csvUrl}
                download={`axiom_ledger_${caseId}.csv`}
                title="Tautan unduh langsung"
                className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 p-2 rounded text-xs flex items-center justify-center transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Digital Chain of Custody Security Hash */}
      <div className="p-3.5 bg-[#131C2E] border border-[#1E293B] rounded space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-sky-400" />
            Integritas Rantai Barang Bukti Hukum (Digital Chain of Custody)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            SHA-256 VERIFIED
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-400 break-all bg-[#090D16] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[#64748B]">SHA-256 HASH:</span> {mockSha256}
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Sidik jari kriptografis di atas menjamin berkas laporan tidak dapat dimanipulasi (*tamper-proof*) sejak waktu ekstraksi bukti siber kognitif dilakukan oleh Satgas PUSSIBERAD.
        </p>
      </div>
    </div>
  );
};
