import axios from 'axios';
import type {
  PlatformType,
  InvestigationCase,
  CytoscapeGraphData,
  AnalyticsData,
  LedgerItem,
  TopAttacker,
  CaseSummary,
  SystemStats,
  WatchlistItem,
  WatchlistCreatePayload,
  UserAccount,
  UserCreatePayload,
  UserListResponse,
  AuditLogItem,
  AuditLogListResponse,
  AuditSummary,
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
    // Tangani token expired / unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('axiom_token');
    }

    const status = error.response?.status;
    const rawDetail = error.response?.data?.detail || error.response?.data?.message;
    let errorMsg = '';

    if (typeof rawDetail === 'string' && rawDetail.trim()) {
      errorMsg = rawDetail.trim();
    } else if (Array.isArray(rawDetail)) {
      // Format validasi Pydantic (e.g. [{ loc: [...], msg: "..." }])
      errorMsg = rawDetail
        .map((item: any) =>
          item.msg ? `${item.loc?.slice(-1)[0] || 'parameter'}: ${item.msg}` : JSON.stringify(item)
        )
        .join('; ');
    } else if (rawDetail && typeof rawDetail === 'object') {
      errorMsg = JSON.stringify(rawDetail);
    }

    // Jika pesan kosong atau masih berupa pesan mentah Axios ('Request failed with status code ...')
    if (!errorMsg || errorMsg.includes('status code')) {
      switch (status) {
        case 400:
          errorMsg = 'Permintaan tidak valid. Mohon periksa kembali input atau format data Anda.';
          break;
        case 401:
          errorMsg = 'Sesi otentikasi telah berakhir atau tidak valid. Silakan login kembali.';
          break;
        case 403:
          errorMsg = 'Akses ditolak. Anda tidak memiliki izin untuk fitur ini.';
          break;
        case 404:
          errorMsg = 'Data, target akun, atau layanan yang diminta tidak ditemukan.';
          break;
        case 422:
          errorMsg = 'Parameter input tidak sesuai dengan format yang didukung sistem.';
          break;
        case 429:
          errorMsg = 'Batas kuota analisis tercapai (Rate Limit). Mohon tunggu beberapa saat sebelum mencoba lagi.';
          break;
        case 500:
          errorMsg = 'Server sedang mengalami kendala sementara saat memproses data. Silakan coba sesaat lagi.';
          break;
        case 502:
        case 503:
        case 504:
          errorMsg = 'Layanan server sedang dalam pemeliharaan atau proses muat ulang. Silakan coba kembali.';
          break;
        default:
          errorMsg = status
            ? `Terjadi kendala pada server (Kode ${status}). Silakan coba beberapa saat lagi.`
            : 'Terjadi kendala komunikasi jaringan. Pastikan koneksi internet Anda stabil.';
      }
    }

    // Tangani network error (misal offline atau connection refused)
    if (!error.response && error.message) {
      if (error.message.includes('Network Error')) {
        errorMsg = 'Gagal terhubung ke server backend. Pastikan server aktif dan koneksi lancar.';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'Waktu permintaan melebihi batas (Timeout). Server membutuhkan waktu lebih lama.';
      }
    }

    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // 0. Autentikasi Pengguna & Sesi JWT
  login: async (
    username: string,
    password: string
  ): Promise<{ access_token: string; token_type: string; role: string; username: string }> => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  getMe: async (): Promise<{ username: string; role: string; is_active: boolean }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

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
    let detectedPlatform: PlatformType = 'youtube';
    if (eventUrl.includes('instagram.com')) {
      detectedPlatform = 'instagram';
    } else if (eventUrl.includes('x.com') || eventUrl.includes('twitter.com')) {
      detectedPlatform = 'x';
    }
    const response = await apiClient.post('/investigate/event', {
      url: eventUrl,
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

  // 3b. Mengambil Statistik Agregat Sistem dari PostgreSQL
  getStats: async (): Promise<SystemStats> => {
    const response = await apiClient.get('/investigate/stats');
    return response.data;
  },

  // 3c. Mengambil Riwayat Kasus Riil dari PostgreSQL
  getCases: async (
    limit: number = 50,
    offset: number = 0,
    platform?: string,
    statusFilter?: string
  ): Promise<{ total: number; limit: number; offset: number; cases: CaseSummary[] }> => {
    const params: Record<string, any> = { limit, offset };
    if (platform) params.platform = platform;
    if (statusFilter) params.status_filter = statusFilter;
    const response = await apiClient.get('/investigate/cases', { params });
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

  // 7. URL Ekspor Berkas Laporan Resmi (PDF/CSV)
  getExportReportUrl: (caseId: string, format: 'pdf' | 'csv'): string => {
    const base = API_BASE_URL.startsWith('http')
      ? API_BASE_URL
      : `${window.location.origin}${API_BASE_URL}`;
    const token = localStorage.getItem('axiom_token');
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    return `${base}/export/report/${caseId}?format=${format}${tokenParam}`;
  },

  // 7b. Eksekusi Unduh / Buka Berkas Laporan Terotentikasi (Blob Streaming)
  downloadReport: async (
    caseId: string,
    format: 'pdf' | 'csv',
    action: 'download' | 'view' = 'download'
  ): Promise<void> => {
    const response = await apiClient.get(`/export/report/${caseId}?format=${format}`, {
      responseType: 'blob',
    });
    const mimeType = format === 'pdf' ? 'text/html;charset=utf-8' : 'text/csv;charset=utf-8';
    const blob = new Blob([response.data], { type: mimeType });
    const blobUrl = window.URL.createObjectURL(blob);

    if (format === 'pdf') {
      const targetUrl = action === 'download' ? `${blobUrl}#print` : blobUrl;
      const win = window.open(targetUrl, '_blank');
      if (win) {
        if (action === 'download') {
          win.onload = () => {
            try { win.print(); } catch {}
          };
          setTimeout(() => {
            try { win.print(); } catch {}
          }, 600);
        }
      } else {
        window.location.href = targetUrl;
      }
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 120000);
    } else {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `axiom_ledger_${caseId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    }
  },

  // 7c. Unduh Master Dataset Retraining ML (Admin Only)
  downloadMasterDataset: async (): Promise<void> => {
    const response = await apiClient.get('/export/master-dataset', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `axiom_retraining_master_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
  },

  // 7d. Verifikasi Kriptografis & Penelusuran Dokumen via SHA-256 / ID Kasus
  verifyDossierHash: async (
    query: string
  ): Promise<{
    is_verified: boolean;
    match_type: string;
    case_id: string | null;
    target: string | null;
    platform: string | null;
    status: string | null;
    cryptographic_hash: string | null;
    created_at: string | null;
    dossier_url: string | null;
    message: string;
  }> => {
    const response = await apiClient.get(`/export/verify-hash/${encodeURIComponent(query.trim())}`);
    return response.data;
  },

  // 8. Health Check Sistem
  checkHealth: async (): Promise<{ status: string }> => {
    const targetUrl = API_BASE_URL.startsWith('http')
      ? `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/health`
      : '/health';
    const response = await axios.get(targetUrl, { timeout: 3000 });
    return response.data;
  },

  // 9. Modul Watchlist & Manajemen Target Permanen
  getWatchlist: async (tag?: string): Promise<WatchlistItem[]> => {
    const params = tag ? { tag } : undefined;
    const response = await apiClient.get('/watchlist', { params });
    return response.data;
  },

  addToWatchlist: async (payload: WatchlistCreatePayload): Promise<WatchlistItem> => {
    const response = await apiClient.post('/watchlist', payload);
    return response.data;
  },

  deleteFromWatchlist: async (watchlistId: number): Promise<{ status: string; message: string }> => {
    const response = await apiClient.delete(`/watchlist/${watchlistId}`);
    return response.data;
  },

  // 10. Modul Manajemen User & RBAC (Admin Only)
  getUsers: async (): Promise<UserListResponse> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  createUser: async (payload: UserCreatePayload): Promise<UserAccount> => {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  updateUserStatus: async (userId: number, isActive: boolean): Promise<UserAccount> => {
    const response = await apiClient.patch(`/users/${userId}/status`, { is_active: isActive });
    return response.data;
  },

  deleteUser: async (userId: number): Promise<{ status: string; message: string }> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // 11. Modul Audit Forensik & Digital Leak Tracing (Admin Only)
  getAuditLogs: async (params?: {
    operator?: string;
    action?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogListResponse> => {
    const response = await apiClient.get('/audit/logs', { params });
    return response.data;
  },

  getAuditSummary: async (): Promise<AuditSummary> => {
    const response = await apiClient.get('/audit/summary');
    return response.data;
  },

  // 12. Modul Guest Demo Sandbox (Akses Publik)
  getGuestSamples: async (): Promise<{ samples: any[] }> => {
    const response = await apiClient.get('/investigate/guest/samples');
    return response.data;
  },

  guestAnalyze: async (payload: { target: string; platform?: string; mode?: string; sample_count?: number }): Promise<any> => {
    const response = await apiClient.post('/investigate/guest/analyze', payload);
    return response.data;
  },
};
