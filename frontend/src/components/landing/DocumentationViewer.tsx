import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Copy,
  Check,
  Server,
  Code2,
  Database,
  RefreshCw,
  Info,
  AlertCircle,
  FileDown,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';

type DocTab = 'quickstart' | 'docker' | 'api' | 'features' | 'retraining';

export const DocumentationViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocTab>('quickstart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navItems = [
    { id: 'quickstart', label: 'Panduan Cepat & Sistem', icon: Terminal },
    { id: 'docker', label: 'Penerapan Produksi Docker', icon: Server },
    { id: 'api', label: 'Spesifikasi REST API v1', icon: Code2 },
    { id: 'features', label: 'Kamus 21-Fitur Machine Learning', icon: Database },
    { id: 'retraining', label: 'Pelatihan Ulang Model & Dataset', icon: RefreshCw },
  ];

  return (
    <section id="documentation" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dokumentasi Resmi & Panduan Teknis</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Arsitektur, Penerapan & Integrasi API
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Panduan lengkap instalasi, arsitektur container Docker, kamus parameter, dan tata kelola
            data forensik.
          </p>
        </div>

        {/* 2-Column Laravel Docs Style Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Sticky Sidebar Navigation */}
          <div className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-4 shrink-0">
            <div className="text-[11px] font-mono uppercase text-slate-500 px-3 mb-2 tracking-wider">
              Daftar Bab Panduan
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as DocTab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-800/80 px-3">
              <span className="text-[11px] text-slate-500 block mb-1">Versi Rilis Dokumen:</span>
              <span className="font-mono text-xs text-slate-300">v1.0.0-rc (Nov 2026)</span>
            </div>
          </div>

          {/* Right Main Content Pane */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[750px]">
            {/* TAB 1: QUICKSTART */}
            {activeTab === 'quickstart' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Panduan Cepat & Persyaratan Sistem
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Project Axiom dibangun dengan arsitektur terpisah (decoupled): backend FastAPI
                    berbasis Python 3.11+ dan antarmuka web modern React 19 dengan Tailwind CSS v4.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-start gap-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Persyaratan Minimum:</strong> Python 3.11+, Node.js 20+, PostgreSQL 15,
                    RAM minimal 4GB, dan ruang disk 5GB untuk cache model embedding lokal.
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">
                    Langkah 1: Kloning Repositori
                  </h4>
                  <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                    <code>git clone https://github.com/AcademyCity-RND/AC-ProjectAxiom.git</code>
                    <button
                      onClick={() =>
                        copyToClipboard('git clone https://github.com/AcademyCity-RND/AC-ProjectAxiom.git', 'c1')
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Salin Perintah"
                    >
                      {copiedKey === 'c1' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">
                    Langkah 2: Konfigurasi Variabel Lingkungan (.env)
                  </h4>
                  <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                    <pre className="overflow-x-auto text-slate-400">
                      {`SECRET_KEY=kunci-rahasia-militer-anda-2026
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=axiom_db
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCKER DEPLOYMENT */}
            {activeTab === 'docker' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Penerapan Produksi dengan Docker
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Sistem dapat dijalankan secara instan dalam arsitektur multi-container terisolasi
                    lengkap dengan database PostgreSQL dan reverse proxy.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">
                    Jalankan Docker Compose Produksi:
                  </h4>
                  <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                    <code>docker compose -f docker-compose.prod.yml up -d --build</code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'docker compose -f docker-compose.prod.yml up -d --build',
                          'c2'
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'c2' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Peringatan Keamanan Kredensial:</strong> Jangan pernah menyimpan berkas{' '}
                    <code>.env</code> produksi di repositori publik. Selalu rotasi SECRET_KEY secara
                    berkala.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REST API SPEC */}
            {activeTab === 'api' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Spesifikasi Endpoint REST API</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Seluruh endpoint terlindungi rate-limiting dinamis dan mematuhi standar JSON kanonikal.
                  </p>
                </div>

                {/* Interactive API Docs Link Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-950 border border-sky-500/30 shadow-inner">
                  <div>
                    <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      <span>Dokumentasi API Interaktif (FastAPI OpenAPI)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Uji coba langsung seluruh endpoint analitik secara real-time via antarmuka Swagger UI atau ReDoc.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href="/api/v1/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Swagger UI</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/api/v1/redoc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>ReDoc</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        POST
                      </span>
                      <span className="text-slate-200">/api/v1/investigate/actor</span>
                    </div>
                    <div className="text-slate-400 font-sans text-[11px]">
                      Memulai investigasi akun @username (memerlukan Bearer token).
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px]">
                        POST
                      </span>
                      <span className="text-slate-200">/api/v1/investigate/guest/analyze</span>
                    </div>
                    <div className="text-slate-400 font-sans text-[11px]">
                      Analisis cepat publik tanpa login (dibatasi 5 permintaan per 10 menit).
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                        GET
                      </span>
                      <span className="text-slate-200">/api/v1/export/master-dataset</span>
                    </div>
                    <div className="text-slate-400 font-sans text-[11px]">
                      Ekspor CSV master seluruh 21-fitur untuk retraining model ML (Admin Only).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 21-FEATURES DICTIONARY */}
            {activeTab === 'features' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Kamus 21-Fitur Machine Learning</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Parameter perilaku sosiologis yang diekstraksi dari aktivitas target untuk input
                    model XGBoost.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="py-2.5 px-3">Nama Parameter</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Rentang & Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                      <tr>
                        <td className="py-2 px-3 text-sky-400">temporal_entropy</td>
                        <td className="py-2 px-3 text-slate-400">Temporal</td>
                        <td className="py-2 px-3">0.0 - 1.0 (Variasi keteraturan jam posting)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-sky-400">burstiness_score</td>
                        <td className="py-2 px-3 text-slate-400">Temporal</td>
                        <td className="py-2 px-3">0.0 - 1.0 (Tingkat lonjakan cuitan mendadak)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-emerald-400">follower_following_ratio</td>
                        <td className="py-2 px-3 text-slate-400">Struktural</td>
                        <td className="py-2 px-3">Rasio jumlah pengikut berbanding yang diikuti</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-amber-400">max_semantic_similarity</td>
                        <td className="py-2 px-3 text-slate-400">Jaringan CIB</td>
                        <td className="py-2 px-3">&gt; 0.85 terindikasi copypasta terkoordinasi</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-purple-400">retweet_ratio</td>
                        <td className="py-2 px-3 text-slate-400">Konten</td>
                        <td className="py-2 px-3">Proporsi sebar-ulang narasi dibanding cuitan asli</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: RETRAINING PIPELINE */}
            {activeTab === 'retraining' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Pelatihan Ulang Model & Master Dataset CSV
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Sistem mendukung evolusi model berkelanjutan. Analis dapat mengunduh master dataset
                    dan melatih ulang model XGBoost secara langsung.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Unduh Master Dataset CSV</div>
                    <div className="text-[11px] text-slate-500">
                      Format kanonikal siap latih (21-fitur + verified label)
                    </div>
                  </div>
                  <button
                    onClick={() => api.downloadMasterDataset().catch(() => alert('Khusus Administrator.'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Unduh CSV</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">
                    Jalankan Skrip Retraining CLI:
                  </h4>
                  <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                    <code>python train_real_xgboost.py --dataset dataset_terbaru.csv --cv 5 --export-model</code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'python train_real_xgboost.py --dataset dataset_terbaru.csv --cv 5 --export-model',
                          'c3'
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'c3' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
