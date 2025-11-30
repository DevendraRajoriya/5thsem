import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  user: { name: string; email: string } | null;
  setLoading: (loading: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  user: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setUser: (user) => set({ user }),
}));
