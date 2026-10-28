import React, { useState } from 'react';
import { Search, Radio, Video, Camera, AlertCircle, Sparkles } from 'lucide-react';
import type { PlatformType } from '../../types';

interface ActorSearchFormProps {
  onSearch: (target: string, platform: PlatformType, maxCount: number, isEvent: boolean) => Promise<void>;
  isLoading: boolean;
}

export const ActorSearchForm: React.FC<ActorSearchFormProps> = ({ onSearch, isLoading }) => {
  const [mode, setMode] = useState<'actor' | 'event'>('actor');
  const [inputVal, setInputVal] = useState<string>('');
  const [platform, setPlatform] = useState<PlatformType>('x');
  const [maxCount, setMaxCount] = useState<number>(150);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset targets for 1-click live demo testing
  const presets = [
    { label: '@cyber_agitator', platform: 'x' as PlatformType, mode: 'actor' as const },
    { label: '@bot_amplifier9', platform: 'x' as PlatformType, mode: 'actor' as const },
    { label: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platform: 'youtube' as PlatformType, mode: 'event' as const },
    { label: 'https://x.com/Kemhan_RI/status/1849372819203819201', platform: 'x' as PlatformType, mode: 'event' as const },
  ];

  const handleModeChange = (newMode: 'actor' | 'event') => {
    setMode(newMode);
    setErrorMsg(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setErrorMsg(null);

    // Auto-detect platform from URL in event mode
    if (mode === 'event') {
      if (val.includes('youtube.com') || val.includes('youtu.be')) {
        setPlatform('youtube');
      } else if (val.includes('instagram.com')) {
        setPlatform('instagram');
      } else if (val.includes('x.com') || val.includes('twitter.com')) {
        setPlatform('x');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMsg(mode === 'actor' ? 'Masukkan username target (@handle).' : 'Masukkan URL postingan.');
      return;
    }

    if (mode === 'actor') {
      const sanitized = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
      if (!/^[a-zA-Z0-9_]{1,50}$/.test(sanitized)) {
        setErrorMsg('Format username tidak valid. Gunakan huruf, angka, dan underscore.');
        return;
      }
      await onSearch(sanitized, platform, maxCount, false);
    } else {
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        setErrorMsg('URL harus diawali dengan http:// atau https://');
        return;
      }
      await onSearch(trimmed, platform, maxCount, true);
    }
  };

  return (
    <div className="cyber-card p-5 space-y-4">
      {/* Top Header: Title & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-400" />
            Parameter Investigasi Target
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih mode analisis profil aktor individu (@handle) atau audit masal komentar postingan media sosial.
          </p>
        </div>

        {/* Mode Selector (Clean Tactical Toggle) */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800/80 rounded-md shadow-inner">
          <button
            type="button"
            onClick={() => handleModeChange('actor')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              mode === 'actor'
                ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Aktor (@Username)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('event')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              mode === 'event'
                ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Event URL (YouTube / IG / X)
          </button>
        </div>
      </div>

      {/* Form Input Body */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch gap-2.5">
          {/* Main Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder={
                mode === 'actor'
                  ? 'Contoh: @cyber_agitator atau nama target'
                  : 'Contoh: URL video YouTube, postingan IG, atau cuitan X (status)'
              }
              className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-md text-xs font-forensic text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all shadow-inner"
            />
            {mode === 'actor' && (
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono select-none">
                {platform.toUpperCase()}
              </span>
            )}
          </div>

          {/* Platform Selector */}
          {mode === 'actor' ? (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md p-1 shrink-0">
              <button
                type="button"
                onClick={() => setPlatform('x')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  platform === 'x'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                X / Twitter
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md p-1 shrink-0">
              <button
                type="button"
                onClick={() => setPlatform('youtube')}
                className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  platform === 'youtube'
                    ? 'bg-slate-800 text-rose-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                YouTube
              </button>
              <button
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  platform === 'instagram'
                    ? 'bg-slate-800 text-amber-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Instagram
              </button>
              <button
                type="button"
                onClick={() => setPlatform('x')}
                className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  platform === 'x'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                X (Tweet)
              </button>
            </div>
          )}

          {/* Depth / Interactions Limit */}
          <select
            value={maxCount}
            onChange={(e) => setMaxCount(Number(e.target.value))}
            disabled={isLoading}
            className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-300 font-mono tabular-nums focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 shrink-0 cursor-pointer shadow-inner"
          >
            <option value={100}>100 Sampel</option>
            <option value={150}>150 Sampel (Standar)</option>
            <option value={200}>200 Sampel (Maks)</option>
          </select>

          {/* Single Solid Primary CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="h-10 px-5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mulai Investigasi</span>
              </>
            )}
          </button>
        </div>

        {/* Inline Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-md animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Preset Chips for Live Testing */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 shrink-0">Preset Demo:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setMode(p.mode);
                  setPlatform(p.platform);
                  setInputVal(p.label);
                  setErrorMsg(null);
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm truncate max-w-xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
