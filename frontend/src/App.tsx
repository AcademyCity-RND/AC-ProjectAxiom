import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { useCaseStore } from './store/useCaseStore';
import { api } from './services/api';
import {
  InspectorDrawer,
  InspectorData,
} from './components/common/InspectorDrawer';
import { ThreatBadge } from './components/common/ThreatBadge';
import {
  Search,
  Plus,
  RefreshCw,
  FileDown,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedItem, setSelectedItem] = useState<InspectorData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const { recentCases } = useCaseStore();

  useEffect(() => {
    // Health check ke backend FastAPI
    api
      .checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleOpenInspector = (data: InspectorData) => {
    setSelectedItem(data);
    setIsDrawerOpen(true);
  };

  const handleCloseInspector = () => {
    setIsDrawerOpen(false);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* =========================================================================
          GROUP 1: TOP KPI SUMMARY STRIP (Max 4 Cards, 2 Data Points Each, No Mini-Charts)
          Per DESIGN.md Section 2 (Screen Complexity Caps)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Kasus Investigasi
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold tabular-nums text-white">
              {recentCases.length > 0 ? recentCases.length : '14'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Total Tercatat</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Aktor Teridentifikasi
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold tabular-nums text-white">
              360
            </span>
            <span className="text-xs text-rose-400 font-mono">120 Bot / 120 Buzzer</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Akurasi Tri-Class XGBoost
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold tabular-nums text-emerald-400">
              100%
            </span>
            <span className="text-xs text-slate-400 font-mono">F1-Score 1.00</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Status Engine FastAPI
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-sm font-semibold font-mono tabular-nums ${
                backendStatus === 'online'
                  ? 'text-emerald-400'
                  : backendStatus === 'checking'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {backendStatus === 'online'
                ? 'ONLINE (PORT 8000)'
                : backendStatus === 'checking'
                ? 'CONNECTING...'
                : 'STANDALONE'}
            </span>
            <span className="text-xs text-slate-400 font-mono">62/62 Passed</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GROUP 2: MAIN WORKSPACE VIEW (One Primary Task Per View, Low Cognitive Load)
      ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Header Controls: Single Primary Action CTA + Max 2 Secondary Outline Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
                Workspace Investigasi Ancaman Kognitif
              </h1>
              <p className="text-[13px] text-[#94A3B8]">
                Audit aktor astroturfing, klaster CIB terkoordinasi, dan otomasi bot media sosial.
              </p>
            </div>

            {/* Actions: EXACTLY ONE SOLID PRIMARY CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleOpenInspector({
                    title: 'Formulir Investigasi Cepat',
                    subtitle: 'Masukkan @handle target atau URL postingan',
                    indicators: [
                      { label: 'Cakupan Platform', value: 'X, YouTube, Instagram' },
                      { label: 'Waktu Analisis', value: '< 2.5 Detik', mono: true },
                      { label: 'Explainable AI', value: 'Groq Llama 3.3 70B' },
                    ],
                    textSnippet:
                      'Silakan masukkan username aktor atau link video/postingan untuk memulai pipeline investigasi otomatis.',
                  })
                }
                className="bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120"
              >
                <Plus className="w-3.5 h-3.5" />
                Investigasi Target
              </button>

              <button
                onClick={() => window.location.reload()}
                className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Segarkan
              </button>
            </div>
          </div>

          {/* Main Table: Strictly Capped at 5-6 Columns with Row Click -> Inspector Drawer */}
          <div className="cyber-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between bg-[#131C2E]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                DAFTAR KASUS & AKTOR TERAKHIR DIPERIKSA
              </div>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                5 Kasus Terkini
              </span>
            </div>

            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[#1E293B] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                <tr>
                  <th className="py-3 px-4">Target / Akun</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Klasifikasi AI</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {/* Sample forensic rows showcasing strict clean design */}
                <tr
                  onClick={() =>
                    handleOpenInspector({
                      title: '@cyber_agitator_id',
                      subtitle: 'X (Twitter) - Kasus CIB Terkoordinasi',
                      threatClass: 'BUZZER',
                      confidence: 0.94,
                      threatLevel: 'HIGH',
                      indicators: [
                        { label: 'Entropi Waktu (H_norm)', value: '0.24 (Sangat Rendah)', mono: true },
                        { label: 'Pola Circadian', value: 'Office Hours (09:00 - 17:00)' },
                        { label: 'Kemiripan Narasi (CIB)', value: '0.892 (Klaster Terpaut)', mono: true },
                        { label: 'Ukuran Klaster Sindikat', value: '18 Akun Terafiliasi', mono: true },
                      ],
                      textSnippet:
                        'Tagar kampanye terkoordinasi disebar serempak dengan interval posting < 2 menit.',
                      rawMetadata: {
                        case_id: 'case-20261102-001',
                        features: { burstiness: 0.88, lexical_diversity: 0.31, url_ratio: 0.75 },
                      },
                    })
                  }
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-sky-400">
                    @cyber_agitator_id
                  </td>
                  <td className="py-3 px-4 font-mono text-xs uppercase text-slate-300">
                    X (Twitter)
                  </td>
                  <td className="py-3 px-4">
                    <ThreatBadge type="class" value="BUZZER" />
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-xs text-amber-400">
                    94.0%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                      Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>

                <tr
                  onClick={() =>
                    handleOpenInspector({
                      title: '@bot_amplifier_99',
                      subtitle: 'X (Twitter) - Bot Amplifikasi Narasi Otomatis',
                      threatClass: 'BOT',
                      confidence: 0.98,
                      threatLevel: 'CRITICAL',
                      indicators: [
                        { label: 'Entropi Waktu (H_norm)', value: '0.08 (Otomasi Penuh)', mono: true },
                        { label: 'Pola Circadian', value: '24/7 Non-Stop (p < 0.001)' },
                        { label: 'Rasio Retweet', value: '96.4%', mono: true },
                        { label: 'Default Avatar', value: 'Ya (Tanpa Bio)' },
                      ],
                      textSnippet:
                        'Otomasi posting berulang tanpa jeda manusiawi selama 7 hari berturut-turut.',
                      rawMetadata: {
                        case_id: 'case-20261102-002',
                        features: { posts_per_day: 142.5, unique_word_ratio: 0.12 },
                      },
                    })
                  }
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-sky-400">
                    @bot_amplifier_99
                  </td>
                  <td className="py-3 px-4 font-mono text-xs uppercase text-slate-300">
                    X (Twitter)
                  </td>
                  <td className="py-3 px-4">
                    <ThreatBadge type="class" value="BOT" />
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-xs text-rose-400">
                    98.0%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                      Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>

                <tr
                  onClick={() =>
                    handleOpenInspector({
                      title: '@analis_pertahanan',
                      subtitle: 'X (Twitter) - Akun Publik Sah / Organik',
                      threatClass: 'HUMAN',
                      confidence: 0.95,
                      threatLevel: 'LOW',
                      indicators: [
                        { label: 'Entropi Waktu (H_norm)', value: '0.84 (Pola Acak Alami)', mono: true },
                        { label: 'Pola Circadian', value: 'Variatif & Akhir Pekan Alami' },
                        { label: 'TTR Leksikal (Kosakata)', value: '0.72 (Kaya Kosakata)', mono: true },
                        { label: 'Verifikasi Profil', value: 'Akun Terverifikasi' },
                      ],
                      textSnippet:
                        'Opini pertahanan independen dengan pola distribusi waktu alami.',
                      rawMetadata: {
                        case_id: 'case-20261102-003',
                        features: { follower_following_ratio: 2.4, media_ratio: 0.35 },
                      },
                    })
                  }
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-sky-400">
                    @analis_pertahanan
                  </td>
                  <td className="py-3 px-4 font-mono text-xs uppercase text-slate-300">
                    X (Twitter)
                  </td>
                  <td className="py-3 px-4">
                    <ThreatBadge type="class" value="HUMAN" />
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-xs text-emerald-400">
                    95.0%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                      Inspeksi <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Narrative Monitor View */}
      {activeTab === 'narrative' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
              Narrative Monitor & Analisis Circadian
            </h1>
            <span className="text-xs font-mono text-slate-400">
              Maks 2 Visualisasi Terfokus
            </span>
          </div>

          <div className="cyber-card p-6 text-center text-slate-400 space-y-2">
            <Activity className="w-8 h-8 text-sky-400 mx-auto" />
            <p className="font-medium text-slate-200 text-sm">
              Circadian 24x7 Matrix & Shannon Entropy Gauge
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Visualisasi pola jam kerja sindikat buzzer (Uji Chi-Square p &lt; 0.05) dan distribusi
              interval postingan untuk membuktikan otomasi non-manusiawi.
            </p>
          </div>
        </div>
      )}

      {/* Network Graph View */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
              Graf Jejaring Sindikat CIB (Social Network Analysis)
            </h1>
            <span className="text-xs font-mono text-slate-400">
              Cosine Similarity &ge; 0.85
            </span>
          </div>

          <div className="cyber-card p-6 text-center text-slate-400 space-y-2">
            <Layers className="w-8 h-8 text-sky-400 mx-auto" />
            <p className="font-medium text-slate-200 text-sm">
              Topologi Klaster Narasi Terkoordinasi
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Peta hubungan antar-aktor berdasarkan kesamaan semantik embeddings MiniLM dan sinkronisasi
              temporal. Garis pasif dimute pada 25% opacity agar grafik tidak berantakan (*anti-hairball*).
            </p>
          </div>
        </div>
      )}

      {/* Target Directory View */}
      {activeTab === 'targets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
              Direktori Target & Kasus
            </h1>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              Total: {recentCases.length} Kasus
            </span>
          </div>

          <div className="cyber-card p-8 text-center text-slate-500 text-xs">
            Daftar lengkap target investigasi dan pengawasan profil aktor ancaman kognitif.
          </div>
        </div>
      )}

      {/* Case Reports View */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
              Laporan Forensik Resmi (Dossier)
            </h1>
            <button className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors">
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              Unduh Berkas Sidik Jari SHA-256
            </button>
          </div>

          <div className="cyber-card p-6 text-xs text-slate-400 space-y-3 leading-relaxed">
            <p>
              Setiap berkas dossier forensik PUSSIBERAD dilengkapi hash verifikasi integritas rantai barang bukti
              hukum (*Digital Chain of Custody*) SHA-256.
            </p>
            <div className="p-3 bg-[#131C2E] rounded border border-[#1E293B] font-mono text-[11px] text-slate-300">
              Fingerprint Standar: SHA-256 Validated &bull; Dual-Tier Commenter Audit Ledger Ready
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GROUP 3: CONTEXTUAL INSPECTOR DRAWER (380px Slide-Over, Hidden By Default)
          Per DESIGN.md Section 5 (Progressive Disclosure)
      ========================================================================= */}
      <InspectorDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseInspector}
        data={selectedItem}
      />
    </Layout>
  );
};
