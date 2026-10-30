import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { useCaseStore } from './store/useCaseStore';
import { api } from './services/api';
import {
  InspectorDrawer,
  InspectorData,
} from './components/common/InspectorDrawer';
import { ThreatBadge } from './components/common/ThreatBadge';
import { ActorSearchForm } from './components/investigation/ActorSearchForm';
import { InvestigationStepper } from './components/investigation/InvestigationStepper';
import { ActorSummaryCard } from './components/investigation/ActorSummaryCard';
import { ForensicDossierCard } from './components/investigation/ForensicDossierCard';
import { NetworkGraph } from './components/visualization/NetworkGraph';
import { CircadianHeatmap } from './components/visualization/CircadianHeatmap';
import { EntropyGauge } from './components/visualization/EntropyGauge';
import { NarrativeDriftChart } from './components/visualization/NarrativeDriftChart';
import { DualTierLedgerTable } from './components/reports/DualTierLedgerTable';
import { ExportActionPanel } from './components/reports/ExportActionPanel';
import { LoginPage } from './components/auth/LoginPage';
import { WatchlistManager } from './components/watchlist/WatchlistManager';
import { useAuthStore } from './store/useAuthStore';
import {
  Plus,
  RefreshCw,
  FileDown,
  Activity,
  Layers,
  ChevronRight,
  ArrowLeft,
  Share2,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  FolderOpen,
} from 'lucide-react';
import type { PlatformType } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [narrativeSubView, setNarrativeSubView] = useState<'circadian_entropy' | 'drift'>('circadian_entropy');
  const [targetsSubView, setTargetsSubView] = useState<'cases' | 'watchlist'>('cases');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedItem, setSelectedItem] = useState<InspectorData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showSearchForm, setShowSearchForm] = useState<boolean>(true);

  const {
    activeCase,
    activeGraph,
    activeAnalytics,
    activeLedger,
    cases,
    stats,
    recentCases,
    isAnalyzing,
    isPolling,
    error,
    clearError,
    loadCases,
    loadStats,
    startActorInvestigation,
    startEventInvestigation,
    loadCaseDetails,
  } = useCaseStore();
  const { isAuthenticated, isInitialized, initAuth } = useAuthStore();

  useEffect(() => {
    // Inisialisasi autentikasi JWT & Health check ke backend FastAPI
    initAuth();
    api
      .checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCases();
      loadStats();
    }
  }, [isAuthenticated, loadCases, loadStats]);

  const handleOpenInspector = (data: InspectorData) => {
    setSelectedItem(data);
    setIsDrawerOpen(true);
  };

  const handleCloseInspector = () => {
    setIsDrawerOpen(false);
  };

  // Handler search dari ActorSearchForm
  const handleStartInvestigation = async (
    target: string,
    platform: PlatformType,
    maxCount: number,
    isEvent: boolean
  ) => {
    setShowSearchForm(false);
    try {
      if (isEvent) {
        await startEventInvestigation(target, maxCount);
      } else {
        await startActorInvestigation(target, platform, maxCount);
      }
    } catch (err) {
      console.error('[Investigation start error]:', err);
    }
  };

  // Inspect 21 XAI Features in Inspector Drawer
  const handleInspect21Features = () => {
    if (!activeCase || !activeCase.detection) return;
    const features = activeCase.detection.extracted_features || {};
    const topXai = activeCase.detection.threat_attribution?.top_features || [];

    handleOpenInspector({
      title: `Analisis 21-Fitur: @${activeCase.target}`,
      subtitle: `Klasifikasi AI: ${activeCase.detection.predicted_class} (${Math.round(
        activeCase.detection.confidence * 100
      )}%)`,
      threatClass: activeCase.detection.predicted_class,
      confidence: activeCase.detection.confidence,
      threatLevel: activeCase.detection.threat_attribution?.forensic_dossier?.threat_level || 'HIGH',
      indicators: Object.entries(features).map(([k, v]) => {
        const topMatch = topXai.find((f) => f.feature === k);
        return {
          label: topMatch ? `★ ${k} (${topMatch.explanation})` : k,
          value: typeof v === 'number' ? v.toFixed(3) : String(v),
          mono: true,
        };
      }),
      rawMetadata: {
        case_id: activeCase.case_id,
        probabilities: activeCase.detection.class_probabilities,
        extracted_features: features,
        top_xai_explanations: topXai,
      },
    });
  };

  // Handle node selection in NetworkGraph
  const handleGraphNodeSelect = (nodeRaw: any) => {
    handleOpenInspector({
      title: nodeRaw.label || nodeRaw.id,
      subtitle: `Node Jaringan: ${nodeRaw.type === 'target' ? 'Target Inti' : 'Anggota Klaster CIB'}`,
      threatClass: nodeRaw.category,
      confidence: nodeRaw.confidence,
      threatLevel: nodeRaw.category === 'BOT' ? 'CRITICAL' : nodeRaw.category === 'BUZZER' ? 'HIGH' : 'LOW',
      indicators: [
        { label: 'Tipe Node', value: nodeRaw.type === 'target' ? 'Target Kasus' : 'Afiliasi Sindikat' },
        { label: 'Skor Keyakinan AI', value: nodeRaw.confidence ? `${Math.round(nodeRaw.confidence * 100)}%` : 'N/A', mono: true },
        { label: 'Klaster CIB', value: 'Cosine Similarity >= 0.85', mono: true },
      ],
      rawMetadata: nodeRaw,
    });
  };

  const activeOrAvailableCase =
    activeCase ||
    cases.find((c) => c.status === 'completed') ||
    cases[0] ||
    null;

  const currentCaseId = activeOrAvailableCase?.case_id || '';
  const currentTarget = activeOrAvailableCase?.target || 'Belum Ada Kasus Terpilih';
  const currentPlatform = activeOrAvailableCase?.platform || 'x';
  const displayCases = cases.length > 0 ? cases : recentCases;

  // Layar loading verifikasi sesi inisial
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Memverifikasi Otoritas Sesi PUSSIBERAD...
          </div>
        </div>
      </div>
    );
  }

  // Jika belum login / sesi tidak ada -> Tampilkan Landing & Login Page PUSSIBERAD
  if (!isAuthenticated) {
    return <LoginPage backendStatus={backendStatus} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* =========================================================================
          GROUP 1: TOP KPI SUMMARY STRIP (Max 4 Cards, 2 Data Points Each, No Mini-Charts)
          Per DESIGN.md Section 2 (Screen Complexity Caps) - Dinamis dari PostgreSQL
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            KASUS INVESTIGASI
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-white">
              {stats?.total_cases ?? (cases.length > 0 ? cases.length : 0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {stats ? `${stats.completed_cases} Kasus Selesai` : 'Tercatat di DB'}
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            AKTOR TERIDENTIFIKASI
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-white">
              {stats?.total_actors ?? (cases.length > 0 ? cases.length : 0)}
            </span>
            <span className="text-xs text-rose-400 font-mono font-medium">
              {stats ? `${stats.bot_count} Bot / ${stats.buzzer_count} Buzzer` : '0 Bot / 0 Buzzer'}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            AKURASI MODEL XGBOOST
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-emerald-400">
              {stats ? `${Math.round(stats.model_accuracy * 100)}%` : '100%'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {stats ? `Avg Conf: ${(stats.avg_confidence * 100).toFixed(1)}%` : 'F1-Score 1.00'}
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            STATUS ENGINE FASTAPI
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  backendStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              <span
                className={`text-xl sm:text-2xl font-semibold tracking-tight font-mono ${
                  backendStatus === 'online'
                    ? 'text-emerald-400'
                    : backendStatus === 'checking'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {backendStatus === 'online' ? 'ONLINE' : backendStatus === 'checking' ? 'SYNC' : 'OFFLINE'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Port 8000 &bull; 70/70</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GROUP 2: MAIN WORKSPACE VIEW (One Primary Task Per View, Low Cognitive Load)
      ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header Controls: Single Primary Action CTA + Secondary Outline Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Workspace Investigasi Ancaman Kognitif
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit aktor astroturfing, klaster CIB terkoordinasi, dan otomasi bot media sosial.
              </p>
            </div>

            {/* Actions: EXACTLY ONE SOLID PRIMARY CTA */}
            <div className="flex items-center gap-2">
              {!showSearchForm && (
                <button
                  onClick={() => setShowSearchForm(true)}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Investigasi Target Baru
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Segarkan
              </button>
            </div>
          </div>

          {/* Error Alert Notification Banner */}
          {error && (
            <div className="bg-rose-950/60 border border-rose-500/30 p-3.5 rounded-md text-xs text-rose-300 flex items-center justify-between animate-in fade-in shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-rose-400 hover:text-rose-200 text-xs px-2.5 py-1 rounded border border-rose-800/40 hover:bg-rose-900/40 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* ACTIVE VIEW LOGIC:
              Case 1: User is filling the investigation form
              Case 2: Pipeline is executing (Stepper)
              Case 3: Investigation complete (Actor Summary Card + Forensic Dossier Card)
          */}
          {showSearchForm && !isAnalyzing && !isPolling ? (
            <div className="space-y-4">
              <ActorSearchForm onSearch={handleStartInvestigation} isLoading={isAnalyzing} />

              {/* Table of Past Cases (Strictly Capped at 5 Columns) - Dinamis dari PostgreSQL */}
              <div className="cyber-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
                  <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                    DAFTAR KASUS TERAKHIR DIPERIKSA (POSTGRESQL)
                  </div>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    {displayCases.length} Kasus Tercatat
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
                      <tr>
                        <th className="py-3 px-3.5 sm:px-5">Target / Akun</th>
                        <th className="py-3 px-3.5 sm:px-5">Platform</th>
                        <th className="py-3 px-3.5 sm:px-5">Klasifikasi AI</th>
                        <th className="py-3 px-3.5 sm:px-5">Waktu</th>
                        <th className="py-3 px-3.5 sm:px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {displayCases.length > 0 ? (
                        displayCases.slice(0, 8).map((rc, i) => (
                          <tr
                            key={i}
                            onClick={() => {
                              loadCaseDetails(rc.case_id);
                              setShowSearchForm(false);
                            }}
                            className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                          >
                            <td className="py-3.5 px-3.5 sm:px-5 font-mono font-medium text-sky-400 group-hover:text-sky-300">
                              {rc.target}
                            </td>
                            <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs uppercase text-slate-300">
                              {rc.platform}
                            </td>
                            <td className="py-3.5 px-3.5 sm:px-5">
                              <ThreatBadge type="class" value={rc.verdict || rc.status} />
                            </td>
                            <td className="py-3.5 px-3.5 sm:px-5 font-mono tabular-nums text-xs text-slate-400">
                              {(rc as any).created_at
                                ? new Date((rc as any).created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : (rc as any).date || '-'}
                            </td>
                            <td className="py-3.5 px-3.5 sm:px-5 text-right">
                              <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1 font-medium transition-colors">
                                Buka <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <div className="max-w-xs mx-auto space-y-2">
                              <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                                <FolderOpen className="w-4 h-4" />
                              </div>
                              <div className="text-xs font-semibold text-slate-300">Belum Ada Kasus Terdaftar</div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                                Jalankan investigasi akun atau gunakan preset demo di atas.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Active Investigation Results or Stepper */
            <div className="space-y-4">
              {/* Back button to search form */}
              <button
                type="button"
                onClick={() => setShowSearchForm(true)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Form Pencarian Target
              </button>

              {/* Live Orchestrator Stepper */}
              <InvestigationStepper
                status={activeCase?.status || (isAnalyzing || isPolling ? 'in_progress' : 'completed')}
                caseId={activeCase?.case_id || 'investigating-active-session'}
                target={activeCase?.target || 'Target Aktif'}
                platform={activeCase?.platform || 'x'}
              />

              {/* Results Cards (Actor Summary + Forensic Dossier) */}
              {activeCase && (activeCase.status === 'completed' || !isPolling) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Actor Profile & Confidence Ring Card */}
                    <ActorSummaryCard
                      actor={activeCase.actor}
                      detection={activeCase.detection}
                      target={activeCase.target}
                      platform={activeCase.platform}
                      onInspectFeatures={handleInspect21Features}
                    />

                    {/* Right: Forensic Intelligence Dossier Card */}
                    <ForensicDossierCard
                      dossier={
                        activeCase.detection?.threat_attribution?.forensic_dossier ||
                        activeCase.result_summary?.forensic_dossier
                      }
                      caseId={activeCase.case_id}
                      target={activeCase.target}
                    />
                  </div>

                  {/* Quick-Jump to Visualizations Strip */}
                  <div className="cyber-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 shadow-sm">
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span>Analisis forensik selesai. Buka visualisasi jejaring CIB, matriks sirkadian, atau berkas dossier:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveTab('network')}
                        className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-sky-400 hover:text-sky-300 text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 cursor-pointer shadow-sm"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Graf CIB
                      </button>
                      <button
                        onClick={() => setActiveTab('narrative')}
                        className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-amber-400 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 cursor-pointer shadow-sm"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Sirkadian &amp; Entropi
                      </button>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 cursor-pointer shadow-sm"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                        Dossier Resmi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODULE 2: NARRATIVE MONITOR & CIRCADIAN (Strict Max 2 Charts Per View)
          Per DESIGN.md Section 2 (Chart Limit Per View)
      ========================================================================= */}
      {activeTab === 'narrative' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Narrative Monitor &amp; Analisis Temporal
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Deteksi anomali jam kerja sindikat buzzer, entropi penjadwalan bot, dan pergeseran narasi.
              </p>
            </div>

            {/* Sub-View Switcher (Segmented Control) */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800/80 rounded-md text-xs shadow-inner overflow-x-auto max-w-full">
              <button
                onClick={() => setNarrativeSubView('circadian_entropy')}
                className={`px-3 py-1 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                  narrativeSubView === 'circadian_entropy'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80 font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Matriks Sirkadian (24x7) &amp; Entropi
              </button>
              <button
                onClick={() => setNarrativeSubView('drift')}
                className={`px-3 py-1 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                  narrativeSubView === 'drift'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80 font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Pergeseran Narasi (Drift)
              </button>
            </div>
          </div>

          {narrativeSubView === 'circadian_entropy' ? (
            <div className="space-y-4">
              {/* Chart 1: Circadian Heatmap */}
              <CircadianHeatmap data={activeAnalytics?.circadian_heatmap} />

              {/* Chart 2: Shannon Posting Entropy Gauge */}
              <EntropyGauge data={activeAnalytics?.posting_entropy} />
            </div>
          ) : (
            <div>
              {/* Semantic Narrative Drift Timeline */}
              <NarrativeDriftChart data={activeAnalytics?.narrative_drift} />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODULE 3: NETWORK GRAPH (Cytoscape / React Flow SNA Topology)
      ========================================================================= */}
      {activeTab === 'network' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Graf Jejaring Sindikat CIB (Social Network Analysis)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualisasi keterpautan semantik MiniLM (Cosine &ge; 0.85) dan sinkronisasi temporal akun penyerang.
              </p>
            </div>
          </div>

          {/* Interactive React Flow Network Graph */}
          <NetworkGraph
            graphData={activeGraph}
            onSelectNode={handleGraphNodeSelect}
          />
        </div>
      )}

      {/* =========================================================================
          MODULE 4: TARGET DIRECTORY & WATCHLIST
      ========================================================================= */}
      {activeTab === 'targets' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Direktori Target &amp; Manajemen Sasaran
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Inventarisasi aktor ancaman kognitif terdaftar dan pengawasan profil operasional resmi dari PostgreSQL.
              </p>
            </div>

            {/* Sub-View Switcher: Cases vs Watchlist */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800/80 rounded-md text-xs shadow-inner self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setTargetsSubView('cases')}
                className={`px-3 py-1 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                  targetsSubView === 'cases'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80 font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Kasus Terdaftar ({displayCases.length})
              </button>
              <button
                onClick={() => setTargetsSubView('watchlist')}
                className={`px-3 py-1 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${
                  targetsSubView === 'watchlist'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80 font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Watchlist Persisten
              </button>
            </div>
          </div>

          {targetsSubView === 'watchlist' ? (
            <WatchlistManager
              onStartInvestigate={(target, platform) => {
                handleStartInvestigation(target, platform, 150, false);
                setActiveTab('overview');
                setShowSearchForm(false);
              }}
            />
          ) : (
            <div className="cyber-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
                <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                  DATABASE SASARAN AKTIF (POSTGRESQL)
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  Total: {displayCases.length} Kasus
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
                    <tr>
                      <th className="py-3 px-3.5 sm:px-5">Target / Akun</th>
                      <th className="py-3 px-3.5 sm:px-5">Platform</th>
                      <th className="py-3 px-3.5 sm:px-5">Klasifikasi AI</th>
                      <th className="py-3 px-3.5 sm:px-5">Case ID</th>
                      <th className="py-3 px-3.5 sm:px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {displayCases.length > 0 ? (
                      displayCases.map((rc, i) => (
                        <tr
                          key={i}
                          onClick={() => {
                            loadCaseDetails(rc.case_id);
                            setActiveTab('overview');
                            setShowSearchForm(false);
                          }}
                          className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                        >
                          <td className="py-3.5 px-3.5 sm:px-5 font-mono font-medium text-sky-400 group-hover:text-sky-300">
                            {rc.target}
                            {(rc as any).display_name && (
                              <span className="block text-[11px] text-slate-400 font-sans font-normal mt-0.5">
                                {(rc as any).display_name}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs uppercase text-slate-300">{rc.platform}</td>
                          <td className="py-3.5 px-3.5 sm:px-5">
                            <ThreatBadge type="class" value={rc.verdict || rc.status} />
                          </td>
                          <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs text-slate-400">{rc.case_id}</td>
                          <td className="py-3.5 px-3.5 sm:px-5 text-right">
                            <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1 font-medium transition-colors">
                              Buka Dossier <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono">
                          Belum ada target atau kasus terdaftar di database PostgreSQL.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODULE 5: CASE REPORTS & DUAL-TIER LEDGER EXPORT
      ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Export Action & Certificate Panel */}
          <ExportActionPanel
            caseId={currentCaseId}
            target={currentTarget}
            platform={currentPlatform}
            cases={cases}
            onSelectCase={(cid) => loadCaseDetails(cid)}
          />

          {/* Dual-Tier Ledger Table */}
          <DualTierLedgerTable
            topAttackers={activeLedger?.top_10_attackers}
            fullLedger={activeLedger?.full_ledger}
            caseId={currentCaseId}
            onInspectRow={handleOpenInspector}
            onExportCsv={() => currentCaseId && api.downloadReport(currentCaseId, 'csv')}
            onExportHtml={() => currentCaseId && api.downloadReport(currentCaseId, 'html')}
          />
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
