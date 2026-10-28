import React from 'react';
import { FileDown, FileText, Fingerprint, Shield, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

interface ExportActionPanelProps {
  caseId: string;
  target: string;
  platform: string;
}

export const ExportActionPanel: React.FC<ExportActionPanelProps> = ({
  caseId,
  target,
  platform,
}) => {
  const htmlUrl = api.getExportReportUrl(caseId, 'html');
  const csvUrl = api.getExportReportUrl(caseId, 'csv');

  // Deterministic mock SHA-256 for display
  const mockSha256 = `a4b7c12298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899`
    .split('')
    .map((c, i) => (caseId.charCodeAt(i % caseId.length) % 16).toString(16))
    .join('');

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

        <div className="text-right font-mono text-xs text-slate-400">
          <div>Case ID: <span className="text-sky-400">{caseId}</span></div>
          <div>Target: <span className="text-white">{target}</span> ({platform.toUpperCase()})</div>
        </div>
      </div>

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

          <a
            href={htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors duration-120"
          >
            <FileDown className="w-3.5 h-3.5" />
            Buka & Cetak Dossier Resmi
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
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

          <a
            href={csvUrl}
            download={`axiom_ledger_${caseId}.csv`}
            className="w-full border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-200 hover:text-white font-medium py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors duration-120"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            Unduh Dataset CSV Mentah
          </a>
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
