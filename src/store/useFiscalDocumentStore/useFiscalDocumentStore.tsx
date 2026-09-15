// @/src/store/useFiscalDocumentStore.ts
import { create } from "zustand";

interface FiscalDocumentStore {
  selectedId?: number;
  setSelectedId: (id: number) => void;
  clearSelectedId: () => void;
}

export const useFiscalDocumentStore = create<FiscalDocumentStore>((set) => ({
  selectedId: undefined,
  setSelectedId: (id) => set({ selectedId: id }),
  clearSelectedId: () => set({ selectedId: undefined }),
}));
