import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  isLoading: boolean;
  setUserId: (userId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isLoading: true,
  setUserId: (userId) => set({ userId }),
  setLoading: (isLoading) => set({ isLoading }),
}));
