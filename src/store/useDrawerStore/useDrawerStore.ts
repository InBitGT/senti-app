import { storage } from "@/lib/storage/storage";
import { Module } from "@/src/types";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

interface States {
  module: Module[] | null;
  setModule: (data: Module[]) => void;
  clearClaims: () => void;
}

const secureStorage: StateStorage = {
  getItem: async (name) => await storage.getItem(name),
  setItem: async (name, value) => await storage.setItem(name, value),
  removeItem: async (name) => await storage.removeItem(name),
};

export const useDrawerStore = create<States>()(
  persist(
    (set, get) => ({
      module: null,
      setModule: (data: Module[]) => {
        set({ module: data });
      },
      getClaims: () => get().module,
      clearClaims: () => set({ module: null }),
    }),
    {
      name: "drawer-module",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
