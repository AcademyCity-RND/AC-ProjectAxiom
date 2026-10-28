import { create } from 'zustand';

interface AuthState {
  token: string | null;
  operatorName: string;
  operatorRole: string;
  isAuthenticated: boolean;
  setAuth: (token: string, name: string, role?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('axiom_token');
  const savedName = localStorage.getItem('axiom_operator') || 'Analis Siber (SATGAS-PUSSIBERAD)';

  return {
    token: savedToken,
    operatorName: savedName,
    operatorRole: 'ADMIN',
    isAuthenticated: true, // Default active session for offline hackathon demo

    setAuth: (token, name, role = 'ADMIN') => {
      localStorage.setItem('axiom_token', token);
      localStorage.setItem('axiom_operator', name);
      set({ token, operatorName: name, operatorRole: role, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('axiom_token');
      localStorage.removeItem('axiom_operator');
      set({ token: null, operatorName: 'Guest', operatorRole: 'USER', isAuthenticated: false });
    },
  };
});
