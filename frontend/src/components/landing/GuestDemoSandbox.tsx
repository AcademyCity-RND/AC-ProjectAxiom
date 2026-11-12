import React, { useState, useEffect } from 'react';
import {
  Search,
  Shield,
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
} from 'lucide-react';
import { api } from '../../services/api';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [samples, setSamples] = useState<any[]>([]);

  // Fetch benchmark sample list on mount
  useEffect(() => {
    api
      .getGuestSamples()
      .then((res) => {
        if (res?.samples) {
          setSamples(res.samples);
          // Set default result to first sample so users immediately see an example
          const initial = res.samples[0];
          setResult(initial);
          setInputVal(`@${initial.handle}`);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat sampel guest:', err);
      });
  }, []);

  const handleSelectSample = (sample: any) => {
    setErrorMsg(null);
    setResult(sample);
    if (sample.mode === 'tweet_url') {
      setMode('tweet');
      setInputVal(sample.target_url || `https://x.com/${sample.handle}/status/1852000000000000000`);
    } else {
      setMode('account');
      setInputVal(`@${sample.handle}`);
    }
  };

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) {
      setErrorMsg('Harap masukkan username atau URL cuitan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(1);

    // Multi-step radar stepper feedback
    const t1 = setTimeout(() => setLoadingStep(2), 700);
    const t2 = setTimeout(() => setLoadingStep(3), 1500);

    try {
      const response = await api.guestAnalyze({
        target: clean,
        platform: 'x',
        mode: mode === 'tweet' ? 'tweet_url' : 'account',
      });

      if (response && response.data) {
        setResult(response.data);
      } else {
        throw new Error('Format respon analisis tidak sesuai.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menjalankan analisis akun. Coba beberapa saat lagi.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsLoading(false);
    }
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
            <span>Uji Coba Langsung (Guest Mode)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Interactive Guest Demo Sandbox
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Uji coba instan deteksi bot dan buzzer tanpa registrasi. Masukkan username atau link
            cuitan di bawah ini.
          </p>
        </div>

        {/* Sandbox Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
            <button
              onClick={() => {
                setMode('account');
                setInputVal('@bubbles_boba9');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                mode === 'account'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mode 1: Analisis Akun X</span>
            </button>

            <button
              onClick={() => {
                setMode('tweet');
                setInputVal('https://x.com/alutsista_update/status/1852000000000000000');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                mode === 'tweet'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mode 2: Analisis URL Cuitan</span>
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  mode === 'account'
                    ? 'Masukkan handle misal: @bubbles_boba9'
                    : 'Masukkan URL cuitan misal: https://x.com/.../status/...'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-sky-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <span>Eksekusi Analisis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pre-cached Sample Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Uji Cepat Sampel:</span>
            {samples.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSample(s)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-mono text-[11px] border border-slate-700/60"
              >
                @{s.handle}
              </button>
            ))}
          </div>

          {/* Multi-Step Loading Radar Banner */}
          {isLoading && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-sky-400 font-medium">
                  {loadingStep === 1 && '[Tahap 1/3] Menghubungkan gateway OSINT & memanen aktivitas...'}
                  {loadingStep === 2 && '[Tahap 2/3] Mengekstraksi 21 parameter perilaku kognitif...'}
                  {loadingStep === 3 && '[Tahap 3/3] Menjalankan inferensi model XGBoost terkalibrasi...'}
                </span>
                <span className="text-slate-500 font-mono">{loadingStep * 33}%</span>
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-base">
                        {result.display_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-base leading-tight">
                          {result.display_name}
                        </h4>
                        <span className="font-mono text-xs text-slate-400">@{result.handle}</span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Platform {result.platform?.toUpperCase()}
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
                        {result.sample_posts_count || 50} aktivitas
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
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Data Tervalidasi
                  </span>
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
                  Ingin melihat Graf Jejaring (SNA) & 100% Audit Komentator?
                </h5>
                <p className="text-[11px] text-slate-400">
                  Konsol penuh PUSSIBERAD menyediakan peta interaksi aktor, heatmap sirkadian 24/7,
                  dan ekspor laporan resmi.
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
