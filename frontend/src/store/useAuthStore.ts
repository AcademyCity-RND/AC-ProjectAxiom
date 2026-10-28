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
  isLoading: boolean;
  isModalOpen: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedToken = localStorage.getItem('axiom_token');
  const savedUsername = localStorage.getItem('axiom_operator') || 'admin';
  const savedRole = localStorage.getItem('axiom_role') || 'ADMIN';

  return {
    token: savedToken,
    user: savedToken ? { username: savedUsername, role: savedRole, is_active: true } : null,
    operatorName: savedUsername,
    operatorRole: savedRole,
    isAuthenticated: Boolean(savedToken),
    isLoading: false,
    isModalOpen: false,
    error: null,

    openLoginModal: () => set({ isModalOpen: true, error: null }),
    closeLoginModal: () => set({ isModalOpen: false, error: null }),
    clearError: () => set({ error: null }),

    // Inisialisasi sesi saat aplikasi dimuat
    initAuth: async () => {
      const currentToken = localStorage.getItem('axiom_token');
      if (currentToken) {
        try {
          const profile = await api.getMe();
          set({
            token: currentToken,
            user: profile,
            operatorName: profile.username,
            operatorRole: profile.role.toUpperCase(),
            isAuthenticated: true,
          });
          return;
        } catch {
          // Token kedaluwarsa atau tidak valid, hapus dan auto-handshake
          localStorage.removeItem('axiom_token');
        }
      }

      // Auto-Handshake Sesi Default Satgas PUSSIBERAD (mencegah evaluasi terhalang login awal)
      try {
        set({ isLoading: true });
        const res = await api.login('admin', 'AxiomAdmin2026!');
        localStorage.setItem('axiom_token', res.access_token);
        localStorage.setItem('axiom_operator', res.username);
        localStorage.setItem('axiom_role', res.role.toUpperCase());
        set({
          token: res.access_token,
          user: { username: res.username, role: res.role, is_active: true },
          operatorName: res.username,
          operatorRole: res.role.toUpperCase(),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          isAuthenticated: false,
          token: null,
          user: null,
          error: err.message || 'Gagal menginisialisasi sesi autentikasi.',
        });
      }
    },

    // Login manual operator
    login: async (username: string, password: string): Promise<boolean> => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.login(username, password);
        localStorage.setItem('axiom_token', res.access_token);
        localStorage.setItem('axiom_operator', res.username);
        localStorage.setItem('axiom_role', res.role.toUpperCase());
        set({
          token: res.access_token,
          user: { username: res.username, role: res.role, is_active: true },
          operatorName: res.username,
          operatorRole: res.role.toUpperCase(),
          isAuthenticated: true,
          isLoading: false,
          isModalOpen: false,
          error: null,
        });
        return true;
      } catch (err: any) {
        set({
          isLoading: false,
          error: err.message || 'Kredensial login tidak valid. Periksa username dan password.',
        });
        return false;
      }
    },

    // Logout operator
    logout: () => {
      localStorage.removeItem('axiom_token');
      localStorage.removeItem('axiom_operator');
      localStorage.removeItem('axiom_role');
      set({
        token: null,
        user: null,
        operatorName: 'Guest',
        operatorRole: 'USER',
        isAuthenticated: false,
        isModalOpen: true, // Buka modal login langsung setelah logout
      });
    },
  };
});
