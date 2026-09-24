import { create } from "zustand";

export interface EntryStockStoreState {
  selectedId?: number;
  setSelectedId: (id: number) => void;
  clearSelectedId: () => void;
}

export const useEntryStockStore = create<EntryStockStoreState>((set) => ({
  selectedId: undefined,
  setSelectedId: (id) => set({ selectedId: id }),
  clearSelectedId: () => set({ selectedId: undefined }),
}));
