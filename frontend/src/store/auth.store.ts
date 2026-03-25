import { create } from 'zustand';
import type { AuthStoreUser } from '@/types';

interface AuthState {
  user: AuthStoreUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthStoreUser, token: string) => void;
  updateUser: (partial: Partial<AuthStoreUser>) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('siren_token');
const storedUserStr = localStorage.getItem('siren_user');
const storedUser: AuthStoreUser | null = storedUserStr ? JSON.parse(storedUserStr) : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  setAuth: (user: AuthStoreUser, token: string) => {
    localStorage.setItem('siren_token', token);
    localStorage.setItem('siren_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  updateUser: (partial: Partial<AuthStoreUser>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('siren_user', JSON.stringify(updated));
    set({ user: updated });
  },
  logout: () => {
    localStorage.removeItem('siren_token');
    localStorage.removeItem('siren_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
