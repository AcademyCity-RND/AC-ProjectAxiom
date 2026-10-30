import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  icon?: LucideIcon;
  colorVariant?: 'default' | 'emerald' | 'amber' | 'rose' | 'sky';
  badge?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  colorVariant = 'default',
  badge,
  className = '',
}) => {
  const getBorderColor = () => {
    switch (colorVariant) {
      case 'emerald':
        return 'border-emerald-500/25';
      case 'amber':
        return 'border-amber-500/25';
      case 'rose':
        return 'border-rose-500/25';
      case 'sky':
        return 'border-sky-500/25';
      default:
        return 'border-slate-800/80';
    }
  };

  const getValueColor = () => {
    switch (colorVariant) {
      case 'emerald':
        return 'text-emerald-400';
      case 'amber':
        return 'text-amber-400';
      case 'rose':
        return 'text-rose-400';
      case 'sky':
        return 'text-sky-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div
      className={`cyber-card p-4 sm:p-5 flex flex-col justify-between bg-slate-900/60 ${getBorderColor()} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
          {label}
        </span>
        {badge && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
            <Icon className="w-3.5 h-3.5 text-sky-400" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-3 gap-2 flex-wrap">
        <div className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums ${getValueColor()}`}>
          {value}
        </div>
        {subtext && (
          <div className="text-xs text-slate-400 font-mono shrink-0">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
