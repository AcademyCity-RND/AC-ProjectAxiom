import React, { useState, useEffect } from 'react';
import { X, History, GitCommit, CheckCircle2, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../common/GithubIcon';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VersionItem {
  version: string;
  date: string;
  badge: string;
  badgeColor: string;
  highlights: string[];
}

const VERSIONS: VersionItem[] = [
  {
    version: 'v1.0.0-rc',
    date: 'November 2026',
    badge: 'Rilis Terkini',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    highlights: [
      'Retraining model XGBoost pada 271 dataset kasus nyata Indonesia dengan akurasi 5-fold CV 99.73% dan Macro F1 98.95%.',
      'Penerapan Public Landing Page & Interactive Guest Demo Sandbox tanpa friksi registrasi.',
      'Integrasi scraper multi-platform: X/Twitter, Instagram Reels/Posts, dan komentar YouTube.',
      'Dual-Tier Forensic Ledger dengan rantai barang bukti digital berstempel kriptografis SHA-256.',
      'Endpoint akumulasi Master Retraining Dataset CSV untuk pelatihan ulang model berkelanjutan.',
    ],
  },
  {
    version: 'v0.9.0',
    date: 'Oktober 2026',
    badge: 'Tonggak Penting',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    highlights: [
      'Implementasi Explainable AI (XAI) berbasis kontribusi fitur SHAP untuk transparansi keputusan model.',
      'Migrasi ke mesin embedding semantik lokal all-MiniLM-L6-v2 untuk efisiensi CPU tanpa latensi jaringan.',
      'Visualisasi heatmap ritme sirkadian 24/7 dan polaritas entropi teks postingan.',
    ],
  },
  {
    version: 'v0.5.0',
    date: 'September 2026',
    badge: 'Fondasi Awal',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    highlights: [
      'Perancangan arsitektur investigasi berbasis kasus (Case-Centric Intelligence Architecture).',
      'Integrasi algoritma deteksi bot ensemble (heuristik rasio pertemanan, entropi, dan aktivitas nokturnal).',
      'Manajemen pengguna berbasis peran (Role-Based Access Control) dan buku besar audit aktivitas.',
    ],
  },
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const [versionList, setVersionList] = useState<VersionItem[]>(VERSIONS);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Ambil changelog rilis resmi secara realtime dari GitHub Releases API
      fetch('https://api.github.com/repos/AcademyCity-RND/AC-ProjectAxiom/releases')
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error('GitHub API response not ok'))))
        .then((releases) => {
          if (Array.isArray(releases) && releases.length > 0) {
            const parsed: VersionItem[] = releases.map((rel: any, idx: number) => {
              const dateStr = rel.published_at
                ? new Date(rel.published_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                : 'Terbaru';

              const body = rel.body || '';
              const lines = body
                .split('\n')
                .map((l: string) => l.trim())
                .filter((l: string) => l.startsWith('-') || l.startsWith('*') || (l.length > 8 && !l.startsWith('#')));

              const highlights =
                lines.length > 0
                  ? lines.slice(0, 6).map((l: string) => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, ''))
                  : [rel.name || `Pembaruan rilis resmi ${rel.tag_name || 'AXIOM'}`];

              return {
                version: rel.tag_name || rel.name || `v1.0.${idx}`,
                date: dateStr,
                badge: idx === 0 ? 'Rilis Terkini (Live)' : 'Rilis Resmi',
                badgeColor:
                  idx === 0
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30',
                highlights,
              };
            });
            setVersionList(parsed);
            setIsLive(true);
          }
        })
        .catch(() => {
          // Fallback anggun ke data statis
          setVersionList(VERSIONS);
          setIsLive(false);
        });
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Riwayat Rilis &amp; Changelog
                </h3>
                {isLive && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live GitHub API
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Rekam jejak evolusi dan pembaruan arsitektur Project Axiom
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup dialog"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <div className="relative border-l border-slate-800 ml-3 sm:ml-4 space-y-8">
            {versionList.map((ver) => (
              <div key={ver.version} className="relative pl-6 sm:pl-7 group">
                {/* Dot Node */}
                <div className="absolute -left-[14px] top-1 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-sky-400 group-hover:text-sky-400 transition-colors">
                  <GitCommit className="w-3.5 h-3.5" />
                </div>

                {/* Version Title & Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-100">
                    {ver.version}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">• {ver.date}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${ver.badgeColor}`}
                  >
                    {ver.badge}
                  </span>
                </div>

                {/* Highlights List */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
                  <ul className="space-y-2 text-xs text-slate-300">
                    {ver.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs">
          <a
            href="https://github.com/AcademyCity-RND/AC-ProjectAxiom/commits"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors font-mono text-[11px]"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Lihat Log Komit Lengkap</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
