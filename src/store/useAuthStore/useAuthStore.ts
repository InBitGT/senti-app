import { storage } from "@/lib/storage/storage";
import { Claims } from "@/src/types";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

interface AuthState {
  claims: Claims | null;
  setClaims: (token: string) => void;
  clearClaims: () => void;
}

const secureStorage: StateStorage = {
  getItem: async (name) => await storage.getItem(name),
  setItem: async (name, value) => await storage.setItem(name, value),
  removeItem: async (name) => await storage.removeItem(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      claims: null,
      setClaims: (token: string) => {
        const decoded = jwtDecode<Claims>(token);
        set({ claims: decoded });
      },
      getClaims: () => get().claims,
      clearClaims: () => {
        set({ claims: null });
        secureStorage.removeItem("auth-claims");
      },
    }),
    {
      name: "auth-claims",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
