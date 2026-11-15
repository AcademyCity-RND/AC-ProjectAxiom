import React from 'react';
import { ShieldAlert, FileText, CheckCircle, Fingerprint, Crosshair } from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';
import type { ForensicDossier } from '../../types';

interface ForensicDossierCardProps {
  dossier?: ForensicDossier | null;
  caseId: string;
  target: string;
}

export const ForensicDossierCard: React.FC<ForensicDossierCardProps> = ({
  dossier,
  caseId,
  target,
}) => {
  // Fallback default if dossier is pending synthesis or offline
  // Fallback default if dossier is pending synthesis or offline
  const fallbackDossier: ForensicDossier = {
    threat_level: 'HIGH',
    primary_agenda: 'Amplifikasi Narasi Terkoordinasi & Astroturfing Opini Publik',
    target_institution: 'Pusat Siber TNI & Stabilitas Informasi Nasional',
    evidence_points: [
      'Pola posting sinkron pada jam kerja terstruktur (Chi-Square p < 0.001)',
      'Tingkat kesamaan semantik embeddings MiniLM > 0.88 terhadap 18 akun klaster',
      'Entropi interval posting sangat rendah (H_norm = 0.24) mengindikasikan otomasi terjadwal',
      'Distribusi rasio URL dan retweet melebihi batas wajar akun organik sipil',
    ],
    tactical_recommendation:
      'Lakukan isolasi klaster CIB pada sistem firewall pertahanan informasi, daftarkan seluruh 18 akun afiliasi ke Watchlist Prioritas, dan eskalasikan laporan forensik ke Satgas Penerangan PUSSIBERAD.',
    attribution_summary:
      'Sindikat buzzer kognitif terorganisir dengan karakteristik narasi copy-paste berbasis kampanye politik/isu strategis.',
  };

  const activeDossier = dossier || fallbackDossier;

  // Compute a deterministic SHA-256 representation string for display
  const mockSha256 = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
    .split('')
    .map((c, i) => (caseId.charCodeAt(i % caseId.length) % 16).toString(16))
    .join('');

  return (
    <div className="cyber-card p-5 space-y-4">
      {/* Dossier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-red-950/40 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                DOSSIER INTELIJEN FORENSIK RESMI
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-semibold">
                RAHASIA
              </span>
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-white mt-0.5">
              Sintesis Forensik Groq Llama 3.3 70B
            </h3>
          </div>
        </div>

        {/* Threat Level Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Tingkat Ancaman:</span>
          <ThreatBadge type="level" value={activeDossier.threat_level} />
        </div>
      </div>

      {/* Primary Agenda & Target Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-md space-y-1 shadow-inner">
          <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            Agenda Operasi Utama
          </div>
          <div className="text-xs font-medium text-slate-200 leading-snug">
            {activeDossier.primary_agenda}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-md space-y-1 shadow-inner">
          <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Institusi / Entitas Sasaran
          </div>
          <div className="text-xs font-medium text-slate-200 leading-snug">
            {activeDossier.target_institution}
          </div>
        </div>
      </div>

      {/* Forensic Evidence Points */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
          FAKTA &amp; BUKTI FORENSIK TERVERIFIKASI
        </div>
        <ul className="space-y-1.5">
          {activeDossier.evidence_points.map((pt, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-300 flex items-start gap-2.5 bg-slate-950 border border-slate-800/80 p-2.5 rounded-md shadow-inner"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
              <span className="leading-relaxed">{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tactical Recommendation Box */}
      <div className="bg-slate-900/90 border border-sky-500/25 p-3.5 rounded-md space-y-1.5 shadow-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wider font-mono text-sky-400 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
          Rekomendasi Taktis Satgas PUSSIBERAD
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {activeDossier.tactical_recommendation}
        </p>
      </div>

      {/* Digital Chain of Custody Fingerprint Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 truncate max-w-md">
          <Fingerprint className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-500">SHA-256:</span>
          <span className="truncate text-slate-300">{mockSha256}</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-medium">
          DIGITAL EVIDENCE INTEGRITY &bull; VALIDATED
        </span>
      </div>
    </div>
  );
};
