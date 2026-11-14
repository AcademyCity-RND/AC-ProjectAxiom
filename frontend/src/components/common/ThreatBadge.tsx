import React from 'react';

export type ThreatClass = 'human' | 'buzzer' | 'bot' | string;
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;

interface ThreatBadgeProps {
  type?: 'class' | 'level';
  value: ThreatClass | ThreatLevel;
  confidence?: number;
  className?: string;
  isEvent?: boolean;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({
  type = 'class',
  value,
  confidence,
  className = '',
  isEvent = false,
}) => {
  const normalized = value?.toUpperCase() || '';

  if (type === 'level') {
    if (normalized === 'CRITICAL') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-[#DC2626] text-white font-mono tracking-wider ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          CRITICAL THREAT
        </span>
      );
    }
    if (normalized === 'HIGH') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-rose-500/10 text-[#F87171] border border-rose-500/30 font-mono tracking-wider ${className}`}
        >
          HIGH RISK
        </span>
      );
    }
    if (normalized === 'MEDIUM') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-amber-500/10 text-[#FBBF24] border border-amber-500/30 font-mono tracking-wider ${className}`}
        >
          MEDIUM
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-emerald-500/10 text-[#34D399] border border-emerald-500/30 font-mono tracking-wider ${className}`}
      >
        LOW RISK
      </span>
    );
  }

  // Type === 'class' (human / buzzer / bot)
  if (normalized === 'HUMAN' || normalized === 'ORGANIC') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-emerald-500/10 text-[#34D399] border border-emerald-500/30 font-mono tracking-wider ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        {isEvent ? 'KOMENTAR BERSIH' : 'HUMAN / AUTENTIK'}
        {confidence !== undefined && (
          <span className="text-[10px] tabular-nums font-mono opacity-80">
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </span>
    );
  }

  if (normalized === 'BUZZER' || normalized === 'COORDINATED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-amber-500/10 text-[#FBBF24] border border-amber-500/30 font-mono tracking-wider ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        {isEvent ? 'INFILTRASI BUZZER' : 'BUZZER / TERKOORDINASI'}
        {confidence !== undefined && (
          <span className="text-[10px] tabular-nums font-mono opacity-80">
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </span>
    );
  }

  if (normalized === 'BOT' || normalized === 'AUTOMATED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-rose-500/10 text-[#F87171] border border-rose-500/30 font-mono tracking-wider ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        {isEvent ? 'ANOMALI BOT SPAM' : 'BOT / OTOMATIS'}
        {confidence !== undefined && (
          <span className="text-[10px] tabular-nums font-mono opacity-80">
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono ${className}`}
    >
      {normalized || 'UNKNOWN'}
    </span>
  );
};
