import { Vaucher } from "@/src/types/vaucher/vaucher";
import { create } from "zustand";

interface OrderState {
  order: Vaucher | null;
  setOrder: (order: Vaucher) => void;
  clearOrder: () => void;
}

// Guarda la última orden cobrada para que la pantalla de voucher
// (payment) pueda leerla sin depender de parámetros de ruta.
export const useVaucherStore = create<OrderState>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
  clearOrder: () => set({ order: null }),
}));
