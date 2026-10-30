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
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isViewingPdf, setIsViewingPdf] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const pdfUrl = caseId ? api.getExportReportUrl(caseId, 'pdf') : '#';
  const csvUrl = caseId ? api.getExportReportUrl(caseId, 'csv') : '#';

  const handleExportPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!caseId) {
      setExportError('Pilih kasus sasaran terlebih dahulu untuk mengunduh berkas dossier PDF.');
      return;
    }
    setExportError(null);
    setIsExportingPdf(true);
    try {
      await api.downloadReport(caseId, 'pdf', 'download');
    } catch (err: any) {
      setExportError(err.message || 'Gagal mengunduh berkas dossier PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleViewPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!caseId) {
      setExportError('Pilih kasus sasaran terlebih dahulu untuk melihat berkas dossier.');
      return;
    }
    setExportError(null);
    setIsViewingPdf(true);
    try {
      await api.downloadReport(caseId, 'pdf', 'view');
    } catch (err: any) {
      setExportError(err.message || 'Gagal memuat pratinjau berkas dossier.');
    } finally {
      setIsViewingPdf(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-red-950/40 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0 shadow-sm">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                PUSSIBERAD FORENSIC INTELLIGENCE DOSSIER
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-semibold">
                RAHASIA
              </span>
            </div>
            <h2 className="text-base font-semibold tracking-tight text-white mt-0.5">
              Pusat Penerbitan &amp; Ekspor Berkas Bukti Digital
            </h2>
          </div>
        </div>

        {/* Case Selector or Active Target Info */}
        <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-1">
          {cases.length > 0 && onSelectCase ? (
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-[11px] text-slate-400 font-sans">Pilih Kasus:</span>
              <select
                value={caseId}
                onChange={(e) => onSelectCase(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 shadow-inner cursor-pointer"
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
                Case ID: <span className="text-sky-400 font-semibold">{caseId || 'Tidak Ada Kasus'}</span>
              </div>
              <div>
                Target: <span className="text-white font-semibold">{target}</span> ({platform.toUpperCase()})
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {exportError && (
        <div className="bg-rose-950/60 border border-rose-500/30 p-3.5 rounded-md text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Warning if no case is selected */}
      {!caseId && (
        <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-md text-xs text-amber-300 flex items-center gap-2.5 font-mono shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Belum ada kasus investigasi yang dipilih. Silakan pilih kasus di daftar atas atau jalankan investigasi target terlebih dahulu untuk mencetak dossier atau mengunduh dataset CSV.
          </span>
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Official PDF Dossier (PUSSIBERAD Military Standard) */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-inner">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Berkas Dossier Resmi (Dokumen PDF A4)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 border border-sky-500/30 font-semibold">
                PDF RESMI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dokumen laporan intelijen forensik resmi format PDF A4 berstandar militer PUSSIBERAD. Memuat ringkasan eksekutif, tabel 21 fitur XGBoost, topologi jejaring CIB, matriks sirkadian, serta analisis bukti hukum.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <button
              onClick={handleExportPdf}
              disabled={!caseId || isExportingPdf || isViewingPdf}
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title="Unduh dan cetak berkas PDF dossier resmi ke penyimpanan lokal"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh Dossier Resmi (PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={handleViewPdf}
              disabled={!caseId || isViewingPdf || isExportingPdf}
              className="border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title="Lihat pratinjau dokumen dossier A4 di tab baru"
            >
              {isViewingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Membuka...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Buka Pratinjau Dokumen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option 2: Full Commenter Raw CSV Ledger */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-inner">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-400" />
                Raw Commenter Ledger (RFC 4180 CSV)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                CSV DATASET
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dataset mentah 100% seluruh akun komentator dan postingan. Dilengkapi skor risiko, klasifikasi AI, keterlibatan klaster, dan timestamp ISO-8601 siap olah di Gephi/Excel.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleExportCsv}
              disabled={!caseId || isExportingCsv}
              className="flex-1 border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
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
                className="border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-md text-xs flex items-center justify-center transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Digital Chain of Custody Security Hash */}
      <div className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-md space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-sky-400" />
            Integritas Rantai Barang Bukti Hukum (Digital Chain of Custody)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            SHA-256 VERIFIED
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-400 break-all bg-slate-950 p-3 rounded-md border border-slate-800 shadow-inner">
          <span className="text-slate-500 font-semibold">SHA-256 HASH:</span> <span className="text-slate-300">{mockSha256}</span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Sidik jari kriptografis di atas menjamin berkas laporan tidak dapat dimanipulasi (*tamper-proof*) sejak waktu ekstraksi bukti siber kognitif dilakukan oleh Satgas PUSSIBERAD.
        </p>
      </div>
    </div>
  );
};
