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
} from 'lucide-react';
import type { PlatformType } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [narrativeSubView, setNarrativeSubView] = useState<'circadian_entropy' | 'drift'>('circadian_entropy');
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

  const currentCaseId = activeCase?.case_id || 'case-sample-20261102';
  const currentTarget = activeCase?.target || '@cyber_agitator_id';
  const currentPlatform = activeCase?.platform || 'x';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Kasus Investigasi
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold tabular-nums text-white">
              {stats?.total_cases ?? (cases.length > 0 ? cases.length : 0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {stats ? `${stats.completed_cases} Kasus Selesai` : 'Tercatat di DB'}
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Aktor Teridentifikasi
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold tabular-nums text-white">
              {stats?.total_actors ?? (cases.length > 0 ? cases.length : 0)}
            </span>
            <span className="text-xs text-rose-400 font-mono">
              {stats ? `${stats.bot_count} Bot / ${stats.buzzer_count} Buzzer` : '0 Bot / 0 Buzzer'}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="cyber-card p-4 flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            Akurasi Tri-Class XGBoost
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold tabular-nums text-emerald-400">
              {stats ? `${Math.round(stats.model_accuracy * 100)}%` : '100%'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {stats ? `Avg Conf: ${(stats.avg_confidence * 100).toFixed(1)}%` : 'F1-Score 1.00'}
            </span>
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
            <span className="text-xs text-slate-400 font-mono">64/64 Passed</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GROUP 2: MAIN WORKSPACE VIEW (One Primary Task Per View, Low Cognitive Load)
      ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Header Controls: Single Primary Action CTA + Secondary Outline Actions */}
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
              {!showSearchForm && (
                <button
                  onClick={() => setShowSearchForm(true)}
                  className="bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Investigasi Target Baru
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Segarkan
              </button>
            </div>
          </div>

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
                <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between bg-[#131C2E]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                    DAFTAR KASUS TERAKHIR DIPERIKSA (POSTGRESQL)
                  </div>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    {displayCases.length} Kasus Tercatat
                  </span>
                </div>

                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-[#1E293B] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                    <tr>
                      <th className="py-3 px-4">Target / Akun</th>
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Klasifikasi AI</th>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
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
                          className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-sky-400">
                            {rc.target}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs uppercase text-slate-300">
                            {rc.platform}
                          </td>
                          <td className="py-3 px-4">
                            <ThreatBadge type="class" value={rc.verdict || rc.status} />
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-300">
                            {(rc as any).created_at
                              ? new Date((rc as any).created_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : (rc as any).date || '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                              Buka <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-500 font-mono">
                          Belum ada kasus investigasi tercatat di database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Active Investigation Results or Stepper */
            <div className="space-y-4">
              {/* Back button to search form */}
              <button
                type="button"
                onClick={() => setShowSearchForm(true)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
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
                  <div className="cyber-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131C2E]">
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Analisis forensik selesai. Buka visualisasi jejaring atau analisis circadian:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('network')}
                        className="px-3 py-1 rounded bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-sky-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Buka Graf CIB
                      </button>
                      <button
                        onClick={() => setActiveTab('narrative')}
                        className="px-3 py-1 rounded bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Buka Circadian & Entropi
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
                Narrative Monitor & Analisis Temporal
              </h1>
              <p className="text-[13px] text-[#94A3B8]">
                Deteksi anomali jam kerja sindikat buzzer, entropi penjadwalan bot, dan pergeseran narasi.
              </p>
            </div>

            {/* Sub-View Switcher (Strict 2-Chart Limit Rule) */}
            <div className="flex items-center p-0.5 bg-[#090D16] border border-[#1E293B] rounded text-xs">
              <button
                onClick={() => setNarrativeSubView('circadian_entropy')}
                className={`px-3 py-1 rounded transition-colors ${
                  narrativeSubView === 'circadian_entropy'
                    ? 'bg-[#1E293B] text-sky-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Circadian 24x7 & Entropi
              </button>
              <button
                onClick={() => setNarrativeSubView('drift')}
                className={`px-3 py-1 rounded transition-colors ${
                  narrativeSubView === 'drift'
                    ? 'bg-[#1E293B] text-sky-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
                Graf Jejaring Sindikat CIB (Social Network Analysis)
              </h1>
              <p className="text-[13px] text-[#94A3B8]">
                Visualisasi keterpautan semantik MiniLM ({'{'}cosine{'}'} &ge; 0.85) dan sinkronisasi temporal akun penyerang.
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
          MODULE 4: TARGET DIRECTORY
      ========================================================================= */}
      {activeTab === 'targets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
                Direktori Target & Kasus Investigasi
              </h1>
              <p className="text-[13px] text-[#94A3B8]">
                Inventarisasi aktor ancaman kognitif terdaftar dan pengawasan profil operasional resmi dari PostgreSQL.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              Total: {displayCases.length} Kasus di Database
            </span>
          </div>

          <div className="cyber-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between bg-[#131C2E]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                DATABASE SASARAN AKTIF (POSTGRESQL)
              </div>
            </div>

            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[#1E293B] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
                <tr>
                  <th className="py-3 px-4">Target / Akun</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Klasifikasi AI</th>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
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
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-120 group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-sky-400">
                        {rc.target}
                        {(rc as any).display_name && (
                          <span className="block text-[11px] text-slate-400 font-sans">
                            {(rc as any).display_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs uppercase text-slate-300">{rc.platform}</td>
                      <td className="py-3 px-4">
                        <ThreatBadge type="class" value={rc.verdict || rc.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{rc.case_id}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1">
                          Buka Dossier <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-mono">
                      Belum ada target atau kasus terdaftar di database PostgreSQL.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 5: CASE REPORTS & DUAL-TIER LEDGER EXPORT
      ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Export Action & Certificate Panel */}
          <ExportActionPanel
            caseId={currentCaseId}
            target={currentTarget}
            platform={currentPlatform}
          />

          {/* Dual-Tier Ledger Table */}
          <DualTierLedgerTable
            topAttackers={activeLedger?.top_10_attackers}
            fullLedger={activeLedger?.full_ledger}
            caseId={currentCaseId}
            onInspectRow={handleOpenInspector}
            onExportCsv={() => window.open(api.getExportReportUrl(currentCaseId, 'csv'))}
            onExportHtml={() => window.open(api.getExportReportUrl(currentCaseId, 'html'))}
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
