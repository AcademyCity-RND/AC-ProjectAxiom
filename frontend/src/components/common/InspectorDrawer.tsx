import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, Check, ChevronRight } from 'lucide-react';
import { ThreatBadge } from './ThreatBadge';
import { useCaseStore } from '../../store/useCaseStore';

export interface InspectorData {
  title: string;
  subtitle?: string;
  threatClass?: string;
  confidence?: number;
  threatLevel?: string;
  indicators?: { label: string; value: string | number; mono?: boolean }[];
  rawMetadata?: Record<string, unknown> | null;
  textSnippet?: string;
}

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: InspectorData | null;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  isOpen,
  onClose,
  data,
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
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
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
