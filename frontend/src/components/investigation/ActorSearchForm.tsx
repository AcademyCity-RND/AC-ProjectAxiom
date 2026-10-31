import React, { useState } from 'react';
import { Search, Radio, Video, Camera, AlertCircle, Sparkles, X } from 'lucide-react';
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



  const detectPlatformFromUrl = (url: string): PlatformType => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('instagram.com')) return 'instagram';
    return 'x';
  };

  const isUrlString = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      trimmed.includes('instagram.com') ||
      trimmed.includes('x.com/') ||
      trimmed.includes('twitter.com/')
    );
  };

  const handleModeChange = (newMode: 'actor' | 'event') => {
    setMode(newMode);
    setErrorMsg(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setErrorMsg(null);

    // Smart auto-detect: jika input adalah URL, otomatis beralih ke mode event & platform terkait
    if (isUrlString(val)) {
      setMode('event');
      setPlatform(detectPlatformFromUrl(val));
    } else if (val.trim().startsWith('@') && mode === 'event') {
      setMode('actor');
      setPlatform('x');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMsg('Masukkan username target (@handle) atau tautan URL postingan.');
      return;
    }

    // Auto-detect apakah input merupakan URL walaupun user berada di tab aktor
    const treatAsEvent = mode === 'event' || isUrlString(trimmed);

    if (treatAsEvent) {
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = `https://${trimmed}`;
      }
      const targetPlatform = detectPlatformFromUrl(trimmed);
      setPlatform(targetPlatform);
      setMode('event');
      await onSearch(trimmed, targetPlatform, maxCount, true);
    } else {
      const sanitized = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
      if (!/^[a-zA-Z0-9_]{1,50}$/.test(sanitized)) {
        setErrorMsg('Format username tidak valid. Gunakan huruf, angka, dan underscore.');
        return;
      }
      await onSearch(sanitized, platform, maxCount, false);
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
              className="w-full h-10 pl-3.5 pr-9 bg-slate-950 border border-slate-800 rounded-md text-xs font-forensic text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all shadow-inner"
            />
            {inputVal && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setInputVal('');
                  setErrorMsg(null);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bersihkan input sasaran"
                aria-label="Bersihkan input sasaran"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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


      </form>
    </div>
  );
};
