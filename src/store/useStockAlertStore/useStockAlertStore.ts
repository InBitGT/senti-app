import { create } from "zustand";

interface StockAlert {
  productId: number;
  productName: string;
}

interface StockAlertState {
  alert: StockAlert | null;
  setAlert: (alert: StockAlert) => void;
  clearAlert: () => void;
}

export const useStockAlertStore = create<StockAlertState>((set) => ({
  alert: null,
  setAlert: (alert) => set({ alert }),
  clearAlert: () => set({ alert: null }),
}));
