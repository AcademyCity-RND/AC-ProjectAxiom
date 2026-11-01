import React, { useEffect, useState } from 'react';
import {
  DownloadCloud,
  Cpu,
  Binary,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface InvestigationStepperProps {
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | string;
  caseId: string;
  target: string;
  platform: string;
}

export const InvestigationStepper: React.FC<InvestigationStepperProps> = ({
  status,
  caseId,
  target,
  platform,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (status === 'completed' || status === 'failed') return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const isEvent =
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    platform === 'youtube' ||
    platform === 'instagram';

  // Map high-level status to discrete pipeline steps
  const steps = [
    {
      id: 'ingestion',
      name: 'Ingestion & Scraping',
      desc: isEvent
        ? `Pengambilan komentar publik & interaksi ${platform.toUpperCase()}`
        : `Pengambilan profil & log riwayat ${platform.toUpperCase()}`,
      icon: DownloadCloud,
    },
    {
      id: 'features',
      name: 'Feature Extraction',
      desc: isEvent
        ? 'Ekstraksi anomali temporal & laju burst komentar'
        : 'Ekstraksi 21 parameter perilaku & struktur akun',
      icon: Binary,
    },
    {
      id: 'inference',
      name: 'XGBoost Classification',
      desc: 'Inferensi model Tri-Class (Human, Buzzer, Bot)',
      icon: Cpu,
    },
    {
      id: 'clustering',
      name: 'CIB Clustering',
      desc: 'Deteksi klaster terkoordinasi (Cosine \u2265 0.85)',
      icon: Layers,
    },
    {
      id: 'synthesis',
      name: 'Forensic Synthesis',
      desc: 'Penalaran ancaman Groq Llama 3.3 70B',
      icon: Sparkles,
    },
  ];

  // Determine active step index based on status and elapsed time
  const getActiveStepIndex = () => {
    if (status === 'completed') return 5; // all done
    if (status === 'failed') return -1;
    if (status === 'queued') return 0;
    // in_progress simulation based on elapsed seconds (orchestrator completes in ~2-4s)
    if (elapsed < 1) return 0;
    if (elapsed < 2) return 1;
    if (elapsed < 3) return 2;
    if (elapsed < 4) return 3;
    return 4;
  };

  const activeIndex = getActiveStepIndex();

  return (
    <div className="cyber-card p-4 space-y-4 bg-slate-900 border border-slate-800/80 shadow-xs">
      {/* Stepper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              STATUS PIPELINE FORENSIK
            </span>
            <span className="text-xs font-mono text-slate-500">&bull; ID: {caseId}</span>
          </div>
          <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>Target:</span>
            <span className="font-mono text-sky-400">{target}</span>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded font-mono font-semibold tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/30">
              {platform?.toLowerCase() === 'x' ? 'X (TWITTER)' : platform?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Status Badge & Elapsed Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{elapsed}s</span>
          </div>

          <div>
            {status === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                SELESAI (COMPLETED)
              </span>
            ) : status === 'failed' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                GAGAL (FAILED)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                MEMPROSES PIPELINE...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5-Stage Stepper Grid (Adaptive Compact on Mobile, 5-col Grid on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = activeIndex > idx;
          const isCurrent = activeIndex === idx && status !== 'completed' && status !== 'failed';

          return (
            <div
              key={step.id}
              className={`p-2.5 sm:p-3 rounded border transition-all duration-150 flex sm:block items-center gap-3 sm:gap-0 ${
                isDone
                  ? 'bg-slate-950/70 border-emerald-500/30 text-slate-200'
                  : isCurrent
                  ? 'bg-slate-800 border-sky-400 text-white shadow-sm ring-1 ring-sky-400/20'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex sm:justify-between items-center sm:mb-1.5 shrink-0">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-semibold ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-sky-400/20 text-sky-400 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <Icon
                  className={`w-4 h-4 hidden sm:block ${
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-sky-400'
                      : 'text-slate-600'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate flex items-center gap-1.5">
                  <span>{step.name}</span>
                  <Icon
                    className={`w-3.5 h-3.5 sm:hidden inline shrink-0 ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-sky-400'
                        : 'text-slate-600'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1 sm:line-clamp-2">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
