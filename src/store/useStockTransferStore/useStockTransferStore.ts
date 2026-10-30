import { create } from "zustand";

export interface StockTransferStoreState {
  selectedId?: number;
  setSelectedId: (id: number) => void;
  clearSelectedId: () => void;
}

export const useStockTransferStore = create<StockTransferStoreState>((set) => ({
  selectedId: undefined,
  setSelectedId: (id) => set({ selectedId: id }),
  clearSelectedId: () => set({ selectedId: undefined }),
}));
