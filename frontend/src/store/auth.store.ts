import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('siren_token');
const storedUserStr = localStorage.getItem('siren_user');
const storedUser: User | null = storedUserStr ? JSON.parse(storedUserStr) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  setAuth: (user: User, token: string) => {
    localStorage.setItem('siren_token', token);
    localStorage.setItem('siren_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('siren_token');
    localStorage.removeItem('siren_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
