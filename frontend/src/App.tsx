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
import { UserManagement } from './components/users/UserManagement';
import { StatCard } from './components/common/StatCard';
import { CasesTable } from './components/investigation/CasesTable';
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
  const [overviewPage, setOverviewPage] = useState<number>(1);
  const [targetDirectoryPage, setTargetDirectoryPage] = useState<number>(1);
  const TARGET_PAGE_SIZE = 8;

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
    clearActiveCase,
    loadCases,
    loadStats,
    startActorInvestigation,
    startEventInvestigation,
    loadCaseDetails,
  } = useCaseStore();
  const { isAuthenticated, isInitialized, initAuth, operatorRole } = useAuthStore();
  const isAdmin = operatorRole?.toLowerCase() === 'admin';
  const isEventTarget = Boolean(
    activeCase?.target?.startsWith('http://') ||
    activeCase?.target?.startsWith('https://') ||
    (activeCase?.platform && ['youtube', 'instagram'].includes(activeCase.platform))
  );

  useEffect(() => {
    // Guard RBAC: jika operator bukan admin namun berada di tab 'users', kembalikan ke overview
    if (activeTab === 'users' && !isAdmin) {
      setActiveTab('overview');
    }
  }, [activeTab, isAdmin]);

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

  // Handle pembersihan state dan membuka form pencarian baru
  const handleNewInvestigation = () => {
    clearActiveCase();
    setShowSearchForm(true);
    clearError();
    loadCases();
    loadStats();
  };

  // Handle Segarkan 2-arah (Dual-handle per screenshot & user request):
  // 1. Belum investigasi: segarkan data dan bersihkan tampilan seperti baru login
  // 2. Sudah investigasi (selesai atau gagal): jalankan ulang investigasi pada sasaran aktif tersebut
  const handleRefresh = async () => {
    if (activeCase && activeCase.target) {
      try {
        await handleStartInvestigation(
          activeCase.target,
          activeCase.platform as PlatformType,
          activeCase.max_interactions || 50,
          isEventTarget
        );
      } catch (err) {
        console.error('[Rerun investigation error]:', err);
      }
    } else {
      handleNewInvestigation();
    }
  };

  // Inspeksi sasaran langsung di halaman Target Directory tanpa redirect paksa
  const handleInspectCaseFromDirectory = async (caseId: string, caseItem?: any) => {
    try {
      await loadCaseDetails(caseId);
    } catch (err) {
      console.warn('[LoadCaseDetails notice]:', err);
    }
    const current = useCaseStore.getState().activeCase || caseItem;
    const verdict = current?.detection?.predicted_class || current?.verdict || 'TERVERIFIKASI';
    const conf = current?.detection?.confidence || current?.confidence || 0.95;
    const level = verdict === 'BOT' ? 'CRITICAL' : verdict === 'BUZZER' ? 'HIGH' : 'LOW';

    handleOpenInspector({
      title: current?.target?.startsWith('@') ? current.target : `@${current?.target || caseId}`,
      subtitle: `Sasaran Terdaftar (${(current?.platform || 'X').toUpperCase()}) • ID Kasus: ${caseId.slice(0, 8)}`,
      threatClass: verdict,
      confidence: conf,
      threatLevel: level,
      indicators: [
        { label: 'Platform Sasaran', value: (current?.platform || 'x').toUpperCase(), mono: true },
        { label: 'Status Investigasi', value: (current?.status || 'completed').toUpperCase(), mono: true },
        { label: 'Waktu Audit Awal', value: current?.created_at ? new Date(current.created_at).toLocaleString('id-ID') : 'N/A' },
        { label: 'Status Ekstraksi CIB', value: 'Terpetakan di PostgreSQL' },
      ],
      rawMetadata: { case_id: caseId, ...current },
    });
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

  // Inspect 21 XAI Features or Event Forensic Signals in Inspector Drawer
  const handleInspect21Features = () => {
    if (!activeCase || !activeCase.detection) return;
    const features = activeCase.detection.extracted_features || {};
    const topXai = activeCase.detection.threat_attribution?.top_features || [];

    const isEventCase =
      activeCase.target.startsWith('http://') ||
      activeCase.target.startsWith('https://') ||
      activeCase.platform === 'youtube' ||
      activeCase.platform === 'instagram';

    const resultSummary = activeCase.result_summary || {};
    const hostMeta = (resultSummary as any).host_metadata;
    const harvestMeta = (resultSummary as any).harvest_summary;
    const aiFeats = (resultSummary as any).ai_training_features || features;

    // Compose indicators list dynamically
    let indicatorList: Array<{ label: string; value: string; mono?: boolean }> = [];

    if (isEventCase) {
      if (hostMeta) {
        if (hostMeta.creator?.username_or_channel) {
          indicatorList.push({
            label: 'Host Kreator / Channel',
            value: hostMeta.creator.username_or_channel,
          });
        }
        if (hostMeta.engagement?.views_count !== undefined) {
          indicatorList.push({
            label: 'Total Views (Tayangan)',
            value: hostMeta.engagement.views_count.toLocaleString('id-ID'),
            mono: true,
          });
        }
        if (hostMeta.engagement?.likes_count !== undefined) {
          indicatorList.push({
            label: 'Total Suka (Likes)',
            value: hostMeta.engagement.likes_count.toLocaleString('id-ID'),
            mono: true,
          });
        }
        if (activeCase.platform !== 'x' && hostMeta.engagement?.dislikes_count !== undefined) {
          indicatorList.push({
            label: 'Estimasi Dislikes (RYD API)',
            value: String(hostMeta.engagement.dislikes_count),
            mono: true,
          });
        }
      }

      if (harvestMeta) {
        indicatorList.push({
          label: 'Panen Komentar Riil',
          value: `${harvestMeta.total_comments_extracted} ditarik (${harvestMeta.unique_commenters_count} akun unik)`,
          mono: true,
        });
        indicatorList.push({
          label: 'Rasio Spammer / Berulang',
          value: `${(harvestMeta.spammer_ratio * 100).toFixed(1)}%`,
          mono: true,
        });
      }

      // Add ML feature vector
      Object.entries(aiFeats).forEach(([k, v]) => {
        const topMatch = topXai.find((f) => f.feature === k);
        const explanationText =
          topMatch && topMatch.explanation && topMatch.explanation !== 'undefined'
            ? ` (${topMatch.explanation})`
            : '';
        indicatorList.push({
          label: topMatch ? `★ ${k}${explanationText}` : k,
          value: typeof v === 'number' ? v.toFixed(3) : String(v),
          mono: true,
        });
      });
    } else {
      indicatorList = Object.entries(features).map(([k, v]) => {
        const topMatch = topXai.find((f) => f.feature === k);
        const explanationText =
          topMatch && topMatch.explanation && topMatch.explanation !== 'undefined'
            ? ` (${topMatch.explanation})`
            : '';
        return {
          label: topMatch ? `★ ${k}${explanationText}` : k,
          value: typeof v === 'number' ? v.toFixed(3) : String(v),
          mono: true,
        };
      });
    }

    handleOpenInspector({
      title: isEventCase
        ? `Audit Indikator Event: ${activeCase.platform.toUpperCase()}`
        : `Analisis 21-Fitur: @${activeCase.target}`,
      subtitle: `Klasifikasi AI: ${activeCase.detection.predicted_class} (${Math.round(
        activeCase.detection.confidence * 100
      )}%)`,
      threatClass: activeCase.detection.predicted_class,
      confidence: activeCase.detection.confidence,
      threatLevel: activeCase.detection.threat_attribution?.forensic_dossier?.threat_level || 'HIGH',
      indicators: indicatorList,
      rawMetadata: {
        case_id: activeCase.case_id,
        probabilities: activeCase.detection.class_probabilities,
        extracted_features: features,
        top_xai_explanations: topXai,
        host_metadata: hostMeta,
        harvest_summary: harvestMeta,
      },
    });
  };

  // Handle node selection in NetworkGraph
  const handleGraphNodeSelect = (nodeRaw: any) => {
    const cleanHandle = (nodeRaw.label || nodeRaw.id || '').replace(/^@/, '').toLowerCase();
    const matchedComments =
      activeLedger?.full_ledger
        ?.filter((item) => item.username.replace(/^@/, '').toLowerCase() === cleanHandle)
        .map((item) => ({
          text: item.content,
          timestamp: item.published_at,
          likes: item.likes,
        })) || [];

    handleOpenInspector({
      title: nodeRaw.label?.startsWith('@') ? nodeRaw.label : `@${nodeRaw.label || nodeRaw.id}`,
      subtitle: `Node Jaringan: ${nodeRaw.type === 'target' ? 'Target Inti' : 'Anggota Klaster CIB'}`,
      threatClass: nodeRaw.category,
      confidence: nodeRaw.confidence,
      threatLevel: nodeRaw.category === 'BOT' ? 'CRITICAL' : nodeRaw.category === 'BUZZER' ? 'HIGH' : 'LOW',
      comments: matchedComments,
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
        <StatCard
          label="KASUS INVESTIGASI"
          value={stats?.total_cases ?? (cases.length > 0 ? cases.length : 0)}
          subtext={stats ? `${stats.completed_cases} Kasus Selesai` : 'Tercatat di DB'}
        />

        <StatCard
          label="AKTOR TERIDENTIFIKASI"
          value={stats?.total_actors ?? (cases.length > 0 ? cases.length : 0)}
          subtext={
            <span className="text-rose-400 font-mono font-medium">
              {stats ? `${stats.bot_count} Bot / ${stats.buzzer_count} Buzzer` : '0 Bot / 0 Buzzer'}
            </span>
          }
        />

        <StatCard
          label="AKURASI MODEL XGBOOST"
          value={stats ? `${Math.round(stats.model_accuracy * 100)}%` : '100%'}
          subtext={stats ? `Avg Conf: ${(stats.avg_confidence * 100).toFixed(1)}%` : 'F1-Score 1.00'}
          colorVariant="emerald"
        />

        <StatCard
          label="STATUS ENGINE FASTAPI"
          value={
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
          }
          subtext="Port 8000 • 70/70"
        />
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
                  onClick={handleNewInvestigation}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Investigasi Target Baru
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={isAnalyzing || isPolling}
                className="border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 shadow-sm cursor-pointer disabled:opacity-50"
                title={
                  activeCase
                    ? 'Jalankan ulang investigasi target aktif'
                    : 'Segarkan data & bersihkan form seperti baru login'
                }
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isAnalyzing || isPolling ? 'animate-spin text-sky-400' : ''}`} />
                <span>{activeCase ? 'Jalankan Ulang' : 'Segarkan'}</span>
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

              {/* Table of Past Cases Menggunakan Shared CasesTable */}
              <CasesTable
                cases={displayCases}
                currentPage={overviewPage}
                pageSize={8}
                onPageChange={setOverviewPage}
                onSelectCase={(cid) => {
                  loadCaseDetails(cid);
                  setShowSearchForm(false);
                }}
                title="DAFTAR KASUS TERAKHIR DIPERIKSA (POSTGRESQL)"
                emptyMessage="Belum ada riwayat kasus terdaftar. Masukkan sasaran target akun atau link postingan di atas untuk memulai audit forensik."
              />
            </div>
          ) : (
            /* Active Investigation Results or Stepper */
            <div className="space-y-4">
              {/* Back button to search form */}
              <button
                type="button"
                onClick={handleNewInvestigation}
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
                      resultSummary={activeCase.result_summary}
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
                      <span>Investigasi selesai. Eksplorasi bukti forensik &amp; dossier:</span>
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
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  Narrative Monitor &amp; Analisis Temporal
                </h1>
                {activeCase && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                    isEventTarget
                      ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                      : 'bg-sky-950/40 text-sky-300 border-sky-500/30'
                  }`}>
                    {isEventTarget ? 'Mode: Event / Serbuan Komentar' : 'Mode: Profil Aktor Individu'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEventTarget
                  ? 'Audit lonjakan komentar massal (burst intervals < 10s), entropi penjadwalan otomasi bot, dan pembelokan kata kunci narasi penyerang.'
                  : 'Deteksi anomali jam kerja sindikat buzzer (09:00 - 17:00), entropi penjadwalan bot, dan pergeseran narasi profil.'}
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
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  Graf Jejaring Sindikat CIB (Social Network Analysis)
                </h1>
                {activeCase && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                    isEventTarget
                      ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                      : 'bg-sky-950/40 text-sky-300 border-sky-500/30'
                  }`}>
                    {isEventTarget ? 'Topologi: Konten Target & Serbuan Buzzer' : 'Topologi: Aktor & Afiliasi'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEventTarget
                  ? 'Pemetaan node konten/kreator target dengan klaster akun penyerang yang terdeteksi melakukan koordinasi copypasta semantik (Cosine ≥ 0.85).'
                  : 'Visualisasi keterpautan semantik MiniLM (Cosine ≥ 0.85) dan sinkronisasi temporal antar akun penyerang.'}
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
            <CasesTable
              cases={displayCases}
              currentPage={targetDirectoryPage}
              pageSize={TARGET_PAGE_SIZE}
              onPageChange={setTargetDirectoryPage}
              onSelectCase={(cid, item) => {
                handleInspectCaseFromDirectory(cid, item);
              }}
              title="DATABASE SASARAN AKTIF (POSTGRESQL)"
              emptyMessage="Belum ada target atau kasus terdaftar di database PostgreSQL."
              showFilters={true}
            />
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
          />
        </div>
      )}

      {/* =========================================================================
          MODULE 6: USER MANAGEMENT & DIGITAL LEAK TRACING (ADMIN ONLY)
      ========================================================================= */}
      {activeTab === 'users' && isAdmin && (
        <UserManagement />
      )}

      {/* =========================================================================
          GROUP 3: CONTEXTUAL INSPECTOR DRAWER (380px Slide-Over, Hidden By Default)
          Per DESIGN.md Section 5 (Progressive Disclosure)
      ========================================================================= */}
      <InspectorDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseInspector}
        data={selectedItem}
        onOpenCaseWorkspace={(caseId) => {
          loadCaseDetails(caseId);
          setActiveTab('overview');
          setShowSearchForm(false);
          setIsDrawerOpen(false);
        }}
      />
    </Layout>
  );
};
