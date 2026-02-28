import { create } from 'zustand';
import type { UserDTO } from '@/types';

interface AuthState {
  user: UserDTO | null;
  setUser: (user: UserDTO | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
