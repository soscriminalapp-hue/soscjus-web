'use client';

import { create } from 'zustand';
import type { AuthUser } from '@/lib/types';
import { tokens } from '@/lib/tokens';
import { api } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean; // já leu o localStorage
  setUser: (u: AuthUser | null) => void;
  hydrate: () => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (u) => set({ user: u }),
  hydrate: () => {
    const u = tokens.getUser();
    set({ user: u, hydrated: true });
  },
  logout: async () => {
    await api.logout();
    set({ user: null });
  },
}));
