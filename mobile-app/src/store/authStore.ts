import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  name: string;
  storeName?: string;
  role: 'owner' | 'driver';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';

  setUser: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'light',

  setUser: (user, accessToken, refreshToken) => {
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
  },
}));
