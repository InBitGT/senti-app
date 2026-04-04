import { Module } from '@/src/types';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

interface States {
  module: Module[] | null;
  setModule: (data: Module[]) => void;
  clearClaims: () => void;
}

const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name),
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

export const useDrawerStore = create<States>()(
  persist(
    (set, get) => ({
      module: null,
      setModule: (data: Module[]) => {
        console.log(data, "module")
        set({ module: data });
      },
       getClaims: () => get().module,
      clearClaims: () => set({ module: null }),
    }),
    {
      name: 'drawer-module',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);