import { CashRegisterSession } from "@/src/types/cash_register_session/cash_register_session";
import { create } from "zustand";

interface CashRegisterState {
  session: CashRegisterSession | null;
  setSession: (session: CashRegisterSession | null) => void;
  clearSession: () => void;
}

// Guarda la sesión de caja abierta del usuario actual. Checkout.tsx lee
// `session.id` de acá para `cash_register_session_id` en vez de inventarlo.
export const useCashRegisterSessionStore = create<CashRegisterState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
