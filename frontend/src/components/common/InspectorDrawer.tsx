import React, { useState } from 'react';
import { X, ExternalLink, Shield, Activity, Calendar, Hash, ShieldAlert, Check } from 'lucide-react';
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
    <aside
      className="fixed inset-y-0 right-0 w-[380px] bg-[#0F172A] border-l border-[#1E293B] shadow-2xl z-50 flex flex-col justify-between transition-transform duration-150 ease-out"
      aria-label="Contextual Inspector Drawer"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#131C2E]">
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            FORENSIC INSPECTOR
          </div>
          <h2 className="text-sm font-semibold text-white truncate max-w-[280px]">
            {data.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Tutup Panel (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Attribution Badge */}
        {(data.threatClass || data.threatLevel) && (
          <div className="bg-[#131C2E] border border-[#1E293B] rounded p-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
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
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              Sampel Narasi / Konten
            </div>
            <div className="p-3 bg-[#090D16] border border-[#1E293B] rounded text-xs text-slate-300 leading-relaxed font-sans">
              "{data.textSnippet}"
            </div>
          </div>
        )}

        {/* Forensic Indicators (Max 3-4 visible by default) */}
        {data.indicators && data.indicators.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              Indikator Forensik
            </div>
            <div className="divide-y divide-slate-800/60 bg-[#090D16] border border-[#1E293B] rounded">
              {data.indicators.map((ind, i) => (
                <div
                  key={i}
                  className="px-3 py-2.5 flex items-center justify-between text-xs"
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
            <summary className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] cursor-pointer hover:text-slate-300 flex items-center justify-between py-1 select-none">
              <span>Raw JSON / Telemetri</span>
              <span className="text-[10px] text-sky-400 group-open:rotate-90 transition-transform">
                ▶
              </span>
            </summary>
            <pre className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded font-mono text-[11px] text-slate-400 overflow-x-auto max-h-48">
              {JSON.stringify(data.rawMetadata, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 border-t border-[#1E293B] bg-[#131C2E] flex items-center justify-between gap-2">
        {isAccount ? (
          <button
            onClick={handleAddToWatchlist}
            disabled={isAdded || isAdding}
            className={`px-2.5 py-1.5 rounded text-xs inline-flex items-center gap-1.5 transition-colors border ${
              isAdded
                ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                : 'border-sky-800/40 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40'
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
          <span className="text-[10px] text-slate-500 font-mono">PUSSIBERAD FORENSIC</span>
        )}
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Tutup
        </button>
      </div>
    </aside>
  );
};
