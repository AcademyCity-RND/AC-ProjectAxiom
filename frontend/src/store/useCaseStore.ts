import { create } from 'zustand';
import { api } from '../services/api';
import type {
  InvestigationCase,
  CytoscapeGraphData,
  AnalyticsData,
  PlatformType,
  TopAttacker,
  LedgerItem,
  CaseSummary,
  SystemStats,
  WatchlistItem,
  WatchlistCreatePayload,
} from '../types';

interface CaseState {
  activeCase: InvestigationCase | null;
  activeGraph: CytoscapeGraphData | null;
  activeAnalytics: AnalyticsData | null;
  activeLedger: {
    top_10_attackers: TopAttacker[];
    full_ledger: LedgerItem[];
  } | null;
  cases: CaseSummary[];
  stats: SystemStats | null;
  watchlist: WatchlistItem[];
  recentCases: Array<{
    case_id: string;
    target: string;
    platform: PlatformType;
    status: string;
    verdict?: string;
    date: string;
  }>;
  isAnalyzing: boolean;
  isPolling: boolean;
  isLoadingCases: boolean;
  isLoadingStats: boolean;
  isLoadingWatchlist: boolean;
  error: string | null;

  setActiveCase: (c: InvestigationCase | null) => void;
  loadCases: (limit?: number, offset?: number) => Promise<void>;
  loadStats: () => Promise<void>;
  loadWatchlist: (tag?: string) => Promise<void>;
  addToWatchlist: (payload: WatchlistCreatePayload) => Promise<void>;
  deleteFromWatchlist: (id: number) => Promise<void>;
  startActorInvestigation: (target: string, platform?: PlatformType, maxCount?: number) => Promise<string>;
  startEventInvestigation: (url: string, maxCount?: number) => Promise<string>;
  loadCaseDetails: (caseId: string) => Promise<void>;
  pollCaseStatus: (caseId: string) => Promise<void>;
  clearError: () => void;
  clearActiveCase: () => void;
  resetStore: () => void;
}

export const useCaseStore = create<CaseState>((set, get) => {
  // Load riwayat kasus lokal sebagai fallback awal
  const savedHistory = localStorage.getItem('axiom_recent_cases');
  const initialRecent = savedHistory ? JSON.parse(savedHistory) : [];

  return {
    activeCase: null,
    activeGraph: null,
    activeAnalytics: null,
    activeLedger: null,
    cases: [],
    stats: null,
    watchlist: [],
    recentCases: initialRecent,
    isAnalyzing: false,
    isPolling: false,
    isLoadingCases: false,
    isLoadingStats: false,
    isLoadingWatchlist: false,
    error: null,

    setActiveCase: (c) => set({ activeCase: c }),
    clearError: () => set({ error: null }),

    clearActiveCase: () =>
      set({
        activeCase: null,
        activeGraph: null,
        activeAnalytics: null,
        activeLedger: null,
        isAnalyzing: false,
        isPolling: false,
        error: null,
      }),

    resetStore: () => {
      localStorage.removeItem('axiom_recent_cases');
      set({
        activeCase: null,
        activeGraph: null,
        activeAnalytics: null,
        activeLedger: null,
        cases: [],
        stats: null,
        watchlist: [],
        recentCases: [],
        isAnalyzing: false,
        isPolling: false,
        isLoadingCases: false,
        isLoadingStats: false,
        isLoadingWatchlist: false,
        error: null,
      });
    },

    // Mengambil daftar riwayat kasus resmi dari PostgreSQL
    loadCases: async (limit = 50, offset = 0) => {
      set({ isLoadingCases: true });
      try {
        const res = await api.getCases(limit, offset);
        set({ cases: res.cases, isLoadingCases: false });
      } catch (err: any) {
        console.warn('[loadCases error]:', err.message);
        set({ isLoadingCases: false });
      }
    },

    // Mengambil metrik statistik sistem riil dari PostgreSQL
    loadStats: async () => {
      set({ isLoadingStats: true });
      try {
        const res = await api.getStats();
        set({ stats: res, isLoadingStats: false });
      } catch (err: any) {
        console.warn('[loadStats error]:', err.message);
        set({ isLoadingStats: false });
      }
    },

    // Mengambil daftar target Watchlist resmi dari database
    loadWatchlist: async (tag?: string) => {
      set({ isLoadingWatchlist: true });
      try {
        const items = await api.getWatchlist(tag);
        set({ watchlist: items, isLoadingWatchlist: false });
      } catch (err: any) {
        console.warn('[loadWatchlist error]:', err.message);
        set({ isLoadingWatchlist: false });
      }
    },

    addToWatchlist: async (payload: WatchlistCreatePayload) => {
      try {
        const newItem = await api.addToWatchlist(payload);
        set((state) => ({ watchlist: [newItem, ...state.watchlist] }));
      } catch (err: any) {
        throw new Error(err.message || 'Gagal menambahkan target ke watchlist');
      }
    },

    deleteFromWatchlist: async (id: number) => {
      try {
        await api.deleteFromWatchlist(id);
        set((state) => ({ watchlist: state.watchlist.filter((w) => w.id !== id) }));
      } catch (err: any) {
        throw new Error(err.message || 'Gagal menghapus target dari watchlist');
      }
    },

    // Memulai investigasi akun target (@handle)
    startActorInvestigation: async (target, platform = 'x', maxCount = 150) => {
      set({ isAnalyzing: true, error: null });
      try {
        const res = await api.startActorInvestigation(target, platform, maxCount);
        const caseId = res.case_id;

        const newEntry = {
          case_id: caseId,
          target,
          platform,
          status: 'queued',
          date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        const updatedRecent = [newEntry, ...get().recentCases.slice(0, 9)];
        localStorage.setItem('axiom_recent_cases', JSON.stringify(updatedRecent));
        set({ recentCases: updatedRecent });

        get().pollCaseStatus(caseId);
        return caseId;
      } catch (err: any) {
        set({ isAnalyzing: false, error: err.message || 'Gagal memulai investigasi target.' });
        throw err;
      }
    },

    // Memulai audit event postingan / video publik (URL)
    startEventInvestigation: async (url, maxCount = 200) => {
      set({ isAnalyzing: true, error: null });
      try {
        const res = await api.startEventInvestigation(url, maxCount);
        const caseId = res.case_id;
        const platform = (res.platform || 'youtube') as PlatformType;

        const newEntry = {
          case_id: caseId,
          target: url,
          platform,
          status: 'queued',
          date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        const updatedRecent = [newEntry, ...get().recentCases.slice(0, 9)];
        localStorage.setItem('axiom_recent_cases', JSON.stringify(updatedRecent));
        set({ recentCases: updatedRecent });

        get().pollCaseStatus(caseId);
        return caseId;
      } catch (err: any) {
        set({ isAnalyzing: false, error: err.message || 'Gagal memulai audit postingan event.' });
        throw err;
      }
    },

    // Polling status kasus hingga selesai (completed/failed)
    pollCaseStatus: async (caseId: string) => {
      set({ isPolling: true });
      let attempts = 0;
      const maxAttempts = 60; // Max 2 menit polling (tiap 2 detik)

      const intervalId = setInterval(async () => {
        attempts += 1;
        try {
          const caseData = await api.getCaseDetails(caseId);
          set({ activeCase: caseData });

          if (caseData.status === 'completed') {
            clearInterval(intervalId);
            set({ isPolling: false, isAnalyzing: false });

            // Ambil graf jejaring, analitik, dan ledger audit secara paralel
            try {
              const [graphData, analyticsRes, ledgerRes] = await Promise.all([
                api.getCaseGraph(caseId),
                api.getCaseAnalytics(caseId),
                api.getAuditLedger(caseId),
              ]);
              set({
                activeGraph: graphData,
                activeAnalytics: analyticsRes.analytics,
                activeLedger: {
                  top_10_attackers: ledgerRes.top_10_attackers,
                  full_ledger: ledgerRes.full_ledger,
                },
              });
            } catch (auxErr) {
              console.warn('[Auxiliary data fetch error]:', auxErr);
            }

            // Segarkan list kasus dan statistik dari database PostgreSQL
            get().loadCases();
            get().loadStats();

            // Update status di recentCases lokal
            const updated = get().recentCases.map((rc) =>
              rc.case_id === caseId
                ? {
                    ...rc,
                    status: 'completed',
                    verdict: caseData.detection?.predicted_class || 'COMPLETED',
                  }
                : rc
            );
            localStorage.setItem('axiom_recent_cases', JSON.stringify(updated));
            set({ recentCases: updated });
          } else if (caseData.status === 'failed' || attempts >= maxAttempts) {
            clearInterval(intervalId);
            set({
              isPolling: false,
              isAnalyzing: false,
              error: caseData.status === 'failed' ? 'Proses investigasi gagal.' : 'Waktu analisis melebihi batas.',
            });
            get().loadCases();
            get().loadStats();
          }
        } catch (err: any) {
          console.warn('[Polling check issue]:', err.message);
          if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            set({ isPolling: false, isAnalyzing: false });
          }
        }
      }, 2000);
    },

    // Memuat data kasus yang sudah selesai dari database
    loadCaseDetails: async (caseId: string) => {
      set({ isAnalyzing: true, error: null });
      try {
        const [caseData, graphData, analyticsRes, ledgerRes] = await Promise.all([
          api.getCaseDetails(caseId),
          api.getCaseGraph(caseId),
          api.getCaseAnalytics(caseId),
          api.getAuditLedger(caseId),
        ]);
        set({
          activeCase: caseData,
          activeGraph: graphData,
          activeAnalytics: analyticsRes.analytics,
          activeLedger: {
            top_10_attackers: ledgerRes.top_10_attackers,
            full_ledger: ledgerRes.full_ledger,
          },
          isAnalyzing: false,
        });
      } catch (err: any) {
        set({ isAnalyzing: false, error: err.message || 'Gagal memuat detail kasus.' });
      }
    },
  };
});
