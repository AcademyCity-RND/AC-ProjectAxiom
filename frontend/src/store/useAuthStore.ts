import { useCaseStore } from './useCaseStore';
import { create } from 'zustand';
import { api } from '../services/api';

export interface UserProfile {
  username: string;
  role: string;
  is_active: boolean;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  operatorName: string;
  operatorRole: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedToken = localStorage.getItem('axiom_token');
  const savedUsername = localStorage.getItem('axiom_operator') || '';
  const savedRole = (localStorage.getItem('axiom_role') || '').toLowerCase();

  return {
    token: savedToken,
    user: savedToken && savedUsername ? { username: savedUsername, role: savedRole, is_active: true } : null,
    operatorName: savedUsername,
    operatorRole: savedRole,
    isAuthenticated: Boolean(savedToken),
    isInitialized: false,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    // Inisialisasi sesi saat pertama kali aplikasi dibuka atau direfresh
    initAuth: async () => {
      const currentToken = localStorage.getItem('axiom_token');
      if (!currentToken) {
        // Tidak ada token -> Wajib Login (TIDAK ADA AUTO-LOGIN)
        set({
          token: null,
          user: null,
          operatorName: '',
          operatorRole: '',
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      // Verifikasi keabsahan token ke endpoint /auth/me di backend
      try {
        set({ isLoading: true });
        const profile = await api.getMe();
        const normalizedRole = (profile.role || 'user').toLowerCase();
        localStorage.setItem('axiom_operator', profile.username);
        localStorage.setItem('axiom_role', normalizedRole);
        set({
          token: currentToken,
          user: profile,
          operatorName: profile.username,
          operatorRole: normalizedRole,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } catch (err) {
        // Token kedaluwarsa atau tidak valid di backend -> Bersihkan sesi & paksa login
        console.warn('[Auth] Token tidak valid atau sesi kedaluwarsa:', err);
        localStorage.removeItem('axiom_token');
        localStorage.removeItem('axiom_operator');
        localStorage.removeItem('axiom_role');
        set({
          token: null,
          user: null,
          operatorName: '',
          operatorRole: '',
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
      }
    },

    // Login resmi personel
    login: async (username: string, password: string): Promise<boolean> => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.login(username, password);
        const normalizedRole = (res.role || 'user').toLowerCase();
        // Bersihkan state investigasi sesi sebelumnya agar tidak bocor antar-akun
        useCaseStore.getState().resetStore();
        localStorage.setItem('axiom_token', res.access_token);
        localStorage.setItem('axiom_operator', res.username);
        localStorage.setItem('axiom_role', normalizedRole);

        set({
          token: res.access_token,
          user: { username: res.username, role: normalizedRole, is_active: true },
          operatorName: res.username,
          operatorRole: normalizedRole,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (err: any) {
        const errorMsg =
          err.message || 'Kredensial login tidak valid. Pastikan username dan password benar.';
        set({
          isLoading: false,
          error: errorMsg,
        });
        return false;
      }
    },

    // Logout resmi: hapus seluruh sesi, bersihkan memory store, dan refresh halaman ke awal
    logout: () => {
      // Bersihkan seluruh data kerja dan kasus investigasi
      useCaseStore.getState().resetStore();
      localStorage.removeItem('axiom_token');
      localStorage.removeItem('axiom_operator');
      localStorage.removeItem('axiom_role');
      localStorage.removeItem('axiom_recent_cases');
      sessionStorage.clear();
      set({
        token: null,
        user: null,
        operatorName: '',
        operatorRole: '',
        isAuthenticated: false,
        error: null,
      });
      // Refresh penuh ke halaman utama agar seluruh state komponen dan memori kembali bersih
      window.location.href = '/';
    },
  };
});
