import axios from 'axios';
import type {
  PlatformType,
  InvestigationCase,
  CytoscapeGraphData,
  AnalyticsData,
  LedgerItem,
  TopAttacker,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor untuk menyematkan JWT Bearer Token otomatis
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('axiom_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor penanganan error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.detail || error.message || 'Terjadi kesalahan sistem';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // 1. Memulai Investigasi Target Akun (@username)
  startActorInvestigation: async (
    target: string,
    platform: PlatformType = 'x',
    maxInteractions: number = 150
  ): Promise<{ status: string; message: string; case_id: string; platform?: string }> => {
    const response = await apiClient.post('/investigate/actor', {
      target,
      platform,
      max_interactions: maxInteractions,
    });
    return { ...response.data, platform };
  },

  // 2. Memulai Investigasi Event / Narasi / URL Konten
  startEventInvestigation: async (
    eventUrl: string,
    maxComments: number = 200
  ): Promise<{ status: string; message: string; case_id: string; platform?: string }> => {
    const detectedPlatform = eventUrl.includes('instagram.com') ? 'instagram' : 'youtube';
    const response = await apiClient.post('/investigate/event', {
      event_url: eventUrl,
      max_comments: maxComments,
    });
    return { ...response.data, platform: detectedPlatform };
  },

  // 3. Polling / Detail Status Kasus Investigasi
  getCaseStatus: async (caseId: string): Promise<InvestigationCase> => {
    const response = await apiClient.get(`/investigate/${caseId}`);
    return response.data;
  },
  getCaseDetails: async (caseId: string): Promise<InvestigationCase> => {
    const response = await apiClient.get(`/investigate/${caseId}`);
    return response.data;
  },

  // 4. Mengambil Data Graf Jejaring (Cytoscape SNA format)
  getNetworkGraph: async (caseId: string): Promise<CytoscapeGraphData> => {
    const response = await apiClient.get(`/investigate/${caseId}/graph`);
    return response.data;
  },
  getCaseGraph: async (caseId: string): Promise<CytoscapeGraphData> => {
    const response = await apiClient.get(`/investigate/${caseId}/graph`);
    return response.data;
  },

  // 5. Mengambil Hasil Analitik Lanjutan (Circadian 24x7, Entropi, Drift)
  getAnalytics: async (caseId: string): Promise<{ case_id: string; status: string; analytics: AnalyticsData }> => {
    const response = await apiClient.get(`/investigate/${caseId}/analytics`);
    return response.data;
  },
  getCaseAnalytics: async (caseId: string): Promise<{ case_id: string; status: string; analytics: AnalyticsData }> => {
    const response = await apiClient.get(`/investigate/${caseId}/analytics`);
    return response.data;
  },

  // 6. Mengambil Data Dual-Tier Forensic Audit Ledger
  getAuditLedger: async (
    caseId: string
  ): Promise<{
    case_id: string;
    total_records: number;
    top_10_attackers: TopAttacker[];
    full_ledger: LedgerItem[];
  }> => {
    const response = await apiClient.get(`/export/ledger/${caseId}`);
    return response.data;
  },

  // 7. URL Ekspor Berkas Laporan Resmi (HTML/PDF/CSV)
  getExportReportUrl: (caseId: string, format: 'html' | 'pdf' | 'csv'): string => {
    const base = API_BASE_URL.startsWith('http')
      ? API_BASE_URL
      : `${window.location.origin}${API_BASE_URL}`;
    return `${base}/export/report/${caseId}?format=${format}`;
  },

  // 8. Health Check Sistem
  checkHealth: async (): Promise<{ status: string }> => {
    const targetUrl = API_BASE_URL.startsWith('http')
      ? `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/health`
      : '/health';
    const response = await axios.get(targetUrl, { timeout: 3000 });
    return response.data;
  },
};
