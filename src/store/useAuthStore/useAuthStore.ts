import { Claims } from '@/src/types';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

interface AuthState {
  claims: Claims | null;
  setClaims: (token: string) => void;
  clearClaims: () => void;
}

const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name),
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      claims: null,
      setClaims: (token: string) => {
        const decoded = jwtDecode<Claims>(token);
        console.log(decoded, "decoded")
        set({ claims: decoded });
      },
       getClaims: () => get().claims,
      clearClaims: () => set({ claims: null }),
    }),
    {
      name: 'auth-claims',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);