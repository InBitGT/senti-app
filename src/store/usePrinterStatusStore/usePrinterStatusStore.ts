import { create } from "zustand";

export type PrinterConnection = "unknown" | "checking" | "connected" | "error";

/** Resultado del último trabajo enviado con `printTicket`. */
export interface PrintJobResult {
  /** Incrementa con cada trabajo, para detectar resultados nuevos. */
  id: number;
  label: string;
  ok: boolean;
  result?: "printed" | "empty";
  error?: string;
  at: number;
}

interface PrinterStatusState {
  /** Dirección de la impresora a la que se refiere el estado. */
  address: string | null;
  status: PrinterConnection;
  error: string | null;
  checkedAt: number | null;
  lastJob: PrintJobResult | null;
  setLastJob: (job: Omit<PrintJobResult, "id" | "at">) => void;
  setChecking: (address: string) => void;
  setConnected: (address: string) => void;
  setError: (address: string, error: string) => void;
  reset: () => void;
}

/**
 * Estado de conexión de la impresora térmica (en memoria, no se persiste:
 * se vuelve a verificar en cada sesión).
 */
export const usePrinterStatusStore = create<PrinterStatusState>()((set) => ({
  address: null,
  status: "unknown",
  error: null,
  checkedAt: null,
  lastJob: null,
  setLastJob: (job) =>
    set((s) => ({
      lastJob: { ...job, id: (s.lastJob?.id ?? 0) + 1, at: Date.now() },
    })),
  setChecking: (address) => set({ address, status: "checking", error: null }),
  setConnected: (address) =>
    set({ address, status: "connected", error: null, checkedAt: Date.now() }),
  setError: (address, error) =>
    set({ address, status: "error", error, checkedAt: Date.now() }),
  reset: () =>
    set({ address: null, status: "unknown", error: null, checkedAt: null }),
}));
