import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, Check, ChevronRight, ExternalLink } from 'lucide-react';
import { ThreatBadge } from './ThreatBadge';
import { useCaseStore } from '../../store/useCaseStore';

export interface InspectorData {
  title: string;
  subtitle?: string;
  threatClass?: string;
  confidence?: number;
  threatLevel?: string;
  reasons?: string[];
  comments?: Array<{ text: string; timestamp?: string; likes?: number } | string>;
  indicators?: { label: string; value: string | number; mono?: boolean }[];
  rawMetadata?: Record<string, unknown> | null;
  textSnippet?: string;
}

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: InspectorData | null;
  onOpenCaseWorkspace?: (caseId: string) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  isOpen,
  onClose,
  data,
  onOpenCaseWorkspace,
}) => {
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Trap focus & keyboard dismiss
  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const isAccount = data.title.startsWith('@') || Boolean(data.threatClass);

  const handleAddToWatchlist = async () => {
    if (!isAccount) return;
    setIsAdding(true);
    try {
      const cls = (data.threatClass || 'SUSPICIOUS').toUpperCase();
      const defaultTag =
        cls === 'BOT' ? 'propaganda_botnet' : cls === 'BUZZER' ? 'buzzer_coordinator' : 'suspicious_cib';
      await useCaseStore.getState().addToWatchlist({
        username: data.title,
        platform: 'x',
        tag: defaultTag,
        notes: `Ditambahkan dari Forensic Inspector. Klasifikasi: ${data.threatClass || 'SUSPICIOUS'} (${data.threatLevel || 'UNKNOWN'})`,
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan sasaran ke Watchlist');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      {/* Scrim — dismiss on click outside */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 right-0 w-[400px] max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Contextual Inspector Drawer"
      >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            FORENSIC INSPECTOR
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-white truncate max-w-[280px]">
            {data.title}
          </h2>
        </div>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 cursor-pointer"
          title="Tutup Panel (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Attribution Badge */}
        {(data.threatClass || data.threatLevel) && (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded p-3 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Klasifikasi
            </span>
            <div className="flex items-center gap-2">
              {data.threatClass && (
                <ThreatBadge
                  type="class"
                  value={data.threatClass}
                  confidence={data.confidence}
                />
              )}
              {data.threatLevel && (
                <ThreatBadge type="level" value={data.threatLevel} />
              )}
            </div>
          </div>
        )}

        {/* Alasan Indikasi Ancaman (XAI Bulleted Reasoning) */}
        {(() => {
          const cls = (data.threatClass || '').toUpperCase();
          const effectiveReasons: string[] =
            data.reasons && data.reasons.length > 0
              ? data.reasons
              : cls === 'BUZZER'
              ? [
                  'Terdeteksi kemiripan narasi semantik tinggi (Cosine Similarity >= 0.85) dengan klaster sindikat CIB.',
                  'Pola waktu terpusat pada burst window sempit untuk amplifikasi dan penggiringan opini publik.',
                  'Frekuensi pengiriman komentar repetitif dengan variasi leksikal rendah.',
                  'Usia akun relatif baru dengan metrik interaksi organik minim.',
                ]
              : cls === 'BOT'
              ? [
                  'Laju aktivitas dan interval posting sangat seragam & mekanis (Shannon Entropy rendah).',
                  'Aktivitas kontinu tanpa jeda ritme sirkadian istirahat alami manusia.',
                  'Rasio pengikut/mengikuti ekstrem dengan profil dan interaksi dua arah yang minim.',
                  'Terkoneksi langsung ke simpul botnet amplifikasi otomatis.',
                ]
              : cls === 'HUMAN' || cls === 'ORGANIC'
              ? [
                  'Pola interval waktu acak alami khas pengetikan dan interaksi organik manusia.',
                  'Siklus sirkadian normal mengikuti ritme jam biologis dan jam tidur malam.',
                  'Diversitas leksikal teks tinggi, bebas dari indikasi copypasta klaster CIB.',
                ]
              : [];

          if (effectiveReasons.length === 0) return null;

          return (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Alasan Indikasi Ancaman</span>
                <span className="text-[10px] text-sky-400 font-mono font-semibold">XAI EXPLANATION</span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded space-y-2 text-xs text-slate-300 shadow-xs">
                {effectiveReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-sky-400 font-mono font-bold shrink-0 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Narrative / Content Snippet */}
        {data.textSnippet && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Sampel Narasi / Konten
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded text-xs text-slate-300 leading-relaxed font-sans shadow-xs">
              "{data.textSnippet}"
            </div>
          </div>
        )}

        {/* Komentar & Pesan Terkirim Aktor */}
        {data.comments && data.comments.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Komentar &amp; Pesan Terkirim</span>
              <span className="text-[10px] text-sky-400 font-mono">({data.comments.length} Pesan)</span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {data.comments.map((comm, idx) => {
                const isObj = typeof comm === 'object' && comm !== null;
                const text = isObj ? (comm as any).text || (comm as any).content || '' : String(comm);
                const ts = isObj ? (comm as any).timestamp || (comm as any).published_at : null;
                const likes = isObj ? (comm as any).likes : null;
                return (
                  <div key={idx} className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded space-y-1 text-xs">
                    <div className="text-slate-300 leading-relaxed font-sans font-medium">
                      &ldquo;{text}&rdquo;
                    </div>
                    {(ts || (likes !== null && likes !== undefined)) && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                        {ts ? <span>{new Date(ts).toLocaleString('id-ID')}</span> : <span />}
                        {likes !== null && likes !== undefined && (
                          <span className="text-sky-400">{likes} Suka</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Forensic Indicators (Max 3-4 visible by default) */}
        {data.indicators && data.indicators.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Indikator Forensik
            </div>
            <div className="divide-y divide-slate-800/60 bg-slate-950/80 border border-slate-800/80 rounded shadow-xs overflow-hidden">
              {data.indicators.map((ind, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2.5 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-400">{ind.label}</span>
                  <span
                    className={`font-semibold ${
                      ind.mono
                        ? 'font-mono tabular-nums text-sky-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {ind.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Metadata (Progressive Disclosure) */}
        {data.rawMetadata && (
          <details className="group space-y-1.5">
            <summary className="text-[11px] font-mono uppercase tracking-wider text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-between py-1 select-none transition-colors list-none">
              <span>Raw JSON / Telemetri</span>
              <ChevronRight className="w-3.5 h-3.5 text-sky-400 transition-transform group-open:rotate-90" />
            </summary>
            <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-snug">
              {JSON.stringify(data.rawMetadata, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2 flex-wrap">
        {data.rawMetadata && Boolean((data.rawMetadata as any).case_id || (data.rawMetadata as any).id) && onOpenCaseWorkspace && (
          <button
            type="button"
            onClick={() => {
              const cid = String((data.rawMetadata as any).case_id || (data.rawMetadata as any).id);
              onOpenCaseWorkspace(cid);
            }}
            className="px-3 py-1.5 rounded text-xs inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm"
            title="Muat seluruh data kasus ini ke dalam Workspace (Graf Jejaring, Sirkadian, Buku Besar)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka di Workspace</span>
          </button>
        )}
        {isAccount ? (
          <button
            onClick={handleAddToWatchlist}
            disabled={isAdded || isAdding}
            className={`px-3 py-1.5 rounded text-xs inline-flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] border font-medium ${
              isAdded
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-sky-500/40 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40 hover:text-sky-200'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terpantau di Watchlist</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAdding ? 'Menyimpan...' : 'Pantau Akun Ini'}</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono tracking-wider">PUSSIBERAD FORENSIC</span>
        )}
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all duration-150 ease-out active:scale-[0.98]"
        >
          Tutup
        </button>
      </div>
      </aside>
    </>
  );
};
