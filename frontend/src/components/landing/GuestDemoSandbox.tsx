import React, { useState } from 'react';
import {
  Search,
  Bot,
  Users,
  UserCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
  CheckCircle,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { PlatformIcon } from '../common/PlatformIcon';

interface GuestDemoSandboxProps {
  onNavigateLogin: () => void;
}

interface AnalysisResultData {
  id: string;
  handle: string;
  display_name: string;
  platform: string;
  mode: string;
  bio?: string;
  avatar_url?: string | null;
  created_at_str?: string;
  followers_count?: number;
  following_count?: number;
  sample_posts_count?: number;
  classification: string;
  confidence: number;
  threat_level: string;
  key_reasons: string[];
  explanation: string;
}

export const GuestDemoSandbox: React.FC<GuestDemoSandboxProps> = ({ onNavigateLogin }) => {
  const [mode, setMode] = useState<'account' | 'tweet'>('account');
  const [inputVal, setInputVal] = useState<string>('');
  const [sampleCount, setSampleCount] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResultData | null>(null);

  const isUrlString = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.includes('x.com/') ||
      trimmed.includes('twitter.com/') ||
      trimmed.includes('instagram.com') ||
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be')
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setErrorMsg(null);

    // Auto-detect URL vs username
    if (isUrlString(val) && mode === 'account') {
      setMode('tweet');
    } else if (val.trim().startsWith('@') && mode === 'tweet') {
      setMode('account');
    }
  };

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let clean = inputVal.trim();
    if (!clean) {
      setErrorMsg(
        mode === 'account'
          ? 'Masukkan username akun X target (@handle).'
          : 'Masukkan tautan URL cuitan X target.'
      );
      return;
    }

    const treatAsUrl = mode === 'tweet' || isUrlString(clean);

    // Check if user accidentally pasted non-X URL
    const lower = clean.toLowerCase();
    if (
      lower.includes('instagram.com') ||
      lower.includes('youtube.com') ||
      lower.includes('youtu.be')
    ) {
      setErrorMsg(
        'Fitur Guest Demo difokuskan khusus untuk platform X (Twitter). Untuk menganalisis tautan Instagram atau YouTube, silakan masuk ke Konsol Staf.'
      );
      return;
    }

    if (treatAsUrl) {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      if (!clean.includes('x.com') && !clean.includes('twitter.com')) {
        setErrorMsg('Tautan harus berupa URL cuitan dari platform X / Twitter (misal: https://x.com/.../status/...)');
        return;
      }
    } else {
      clean = clean.startsWith('@') ? clean.slice(1) : clean;
      if (!/^[a-zA-Z0-9_]{1,50}$/.test(clean)) {
        setErrorMsg('Format handle X tidak valid. Gunakan huruf, angka, atau underscore.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(1);

    try {
      // Jalankan pemanggilan API bersamaan dengan formalitas visual pipeline multi-step
      // sehingga kasus yang telah ter-cache tetap memperlihatkan alur radar deteksi secara elegan
      const [response] = await Promise.all([
        api.guestAnalyze({
          target: clean,
          platform: 'x',
          mode: treatAsUrl ? 'tweet_url' : 'account',
          sample_count: sampleCount,
        }),
        (async () => {
          // Tahap 1: Ingestion & Scraping Gateway (850ms)
          setLoadingStep(1);
          await new Promise((resolve) => setTimeout(resolve, 850));
          // Tahap 2: Ekstraksi 21 Parameter Perilaku Kognitif (950ms)
          setLoadingStep(2);
          await new Promise((resolve) => setTimeout(resolve, 950));
          // Tahap 3: Inferensi Model XGBoost & Audit Forensik (950ms)
          setLoadingStep(3);
          await new Promise((resolve) => setTimeout(resolve, 950));
        })(),
      ]);

      if (response && response.data) {
        setResult(response.data);
      } else {
        throw new Error('Format respon analisis tidak sesuai.');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (!msg || msg.includes('status code') || msg.includes('Network Error')) {
        setErrorMsg('Gagal menjalankan analisis akun X. Server sedang sibuk atau target tidak dapat dijangkau. Silakan coba kembali.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInputVal('');
    setErrorMsg(null);
  };

  const getBadgeStyle = (classification: string) => {
    switch (classification?.toUpperCase()) {
      case 'HUMAN':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Manusia (Organik)',
          icon: UserCheck,
        };
      case 'BUZZER':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          label: 'Buzzer (CIB Terkoordinasi)',
          icon: Users,
        };
      case 'BOT':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          label: 'Bot (Otomasi Skrip)',
          icon: Bot,
        };
    }
  };

  const badge = getBadgeStyle(result?.classification || 'UNKNOWN');
  const BadgeIcon = badge.icon;

  return (
    <section id="demo" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investigasi Publik Mandiri (Guest Mode)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Interactive Guest Demo Sandbox
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Uji coba instan analisis akun dan cuitan platform X (Twitter). Sistem memanen aktivitas publik
            secara langsung dan menguji 21 parameter perilaku kognitif tanpa perlu login.
          </p>
        </div>

        {/* Sandbox Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Form Parameters Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            {/* Mode Toggle (X Account vs X Tweet URL) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('account');
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'account'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Akun X (@Username)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('tweet');
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'tweet'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>URL Cuitan X (Tweet)</span>
              </button>
            </div>

            {/* Platform Badge (Fixed to X for Guest Mode) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                <PlatformIcon platform="x" className="w-3.5 h-3.5 text-sky-400" />
                <span>Platform: <strong className="text-white">X / Twitter</strong></span>
              </div>

              {/* Sample Activity Limit */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sampleCount}
                  onChange={(e) => setSampleCount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value={30}>30 Aktivitas</option>
                  <option value={50}>50 Aktivitas</option>
                  <option value={100}>100 Aktivitas</option>
                  <option value={200}>200 Aktivitas</option>
                  <option value={400}>400 Aktivitas (Maks)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                placeholder={
                  mode === 'account'
                    ? 'Masukkan username X target, misal: @jokowi, @prabowo, @alutsista_ri...'
                    : 'Tempel tautan cuitan X, misal: https://x.com/username/status/1852000000000000000'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-sky-500/20 active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <span>Mulai Investigasi X</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Multi-Step Loading Radar Banner */}
          {isLoading && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/90 border border-sky-500/30 flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-sky-400 font-medium">
                  {loadingStep === 1 && '[Tahap 1/3] Menghubungkan gateway X OSINT & memanen cuitan publik...'}
                  {loadingStep === 2 && '[Tahap 2/3] Mengekstraksi 21 parameter perilaku kognitif & sirkadian...'}
                  {loadingStep === 3 && '[Tahap 3/3] Menjalankan inferensi model XGBoost terkalibrasi...'}
                </span>
                <span className="text-slate-400 font-mono font-bold">{loadingStep * 33}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingStep * 33}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Clean Ready State Placeholder (When No Analysis Has Been Run) */}
          {!result && !isLoading && !errorMsg && (
            <div className="mt-8 p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <PlatformIcon platform="x" className="w-5 h-5 text-sky-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">
                Konsol Investigasi X / Twitter Siap Digunakan
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                Ketikkan handle akun X target (@username) atau tautan cuitan X di atas untuk memulai audit
                otomatis. Akses multi-platform (Instagram &amp; YouTube) tersedia di konsol internal staf.
              </p>
            </div>
          )}

          {/* Output Analysis Display (Lite Forensic Dossier) */}
          {result && !isLoading && (
            <div className="mt-7 pt-7 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {/* Left Column: Scraped Profile Card */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {result.avatar_url ? (
                        <img
                          src={result.avatar_url}
                          alt={result.handle}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-base">
                          {result.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-100 text-base leading-tight">
                          {result.display_name}
                        </h4>
                        <span className="font-mono text-xs text-slate-400">@{result.handle}</span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Platform X (Twitter)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
                    "{result.bio || 'Tidak ada deskripsi bio publik.'}"
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800/80 pt-3 text-slate-400">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Dibuat:</span>
                      <span className="font-medium text-slate-200">{result.created_at_str || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Sampel Dianalisis:</span>
                      <span className="font-medium text-slate-200">
                        {result.sample_posts_count || sampleCount} aktivitas
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Pengikut (Followers):</span>
                      <span className="font-mono font-medium text-slate-200">
                        {result.followers_count?.toLocaleString('id-ID') ?? '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Mengikuti (Following):</span>
                      <span className="font-mono font-medium text-slate-200">
                        {result.following_count?.toLocaleString('id-ID') ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>ID Kasus: {result.id}</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Uji Target Lain</span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Classification & XAI Indicators */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Klasifikasi Model AI
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-400">
                      Tingkat Risiko: <strong className="text-slate-200">{result.threat_level}</strong>
                    </span>
                  </div>

                  {/* Threat Badge */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${badge.bg}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                      <BadgeIcon className="w-5 h-5" />
                      <span className="font-bold text-sm tracking-wide">{badge.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono block text-slate-400">
                        Skor Keyakinan
                      </span>
                      <span className="font-mono font-bold text-base">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Key Indicators / Top-3 XAI */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Indikator Perilaku Utama (Top-3 XAI):
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.key_reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sky-400 font-bold shrink-0">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                    {result.explanation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Data Tervalidasi
                  </span>
                  <span className="text-slate-500 font-sans">Model XGBoost Terkalibrasi</span>
                </div>
              </div>
            </div>
          )}

          {/* Upsell / Full Console Gate Banner */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-semibold text-slate-200">
                  Ingin menganalisis YouTube, Instagram, Graf SNA, &amp; 100% Audit Komentator?
                </h5>
                <p className="text-[11px] text-slate-400">
                  Konsol penuh PUSSIBERAD menyediakan peta interaksi aktor, heatmap sirkadian 24/7,
                  ekstraksi multi-platform, dan ekspor dossier resmi.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateLogin}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <span>Gerbang Masuk Staf</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
