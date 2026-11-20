import { storage } from "@/lib/storage/storage";
import { PairedPrinter } from "@/src/service/printer/printer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * - `auto`: el ticket de cocina se imprime solo al completar una venta.
 * - `on_demand`: solo se imprime cuando el usuario presiona "Imprimir orden".
 */
export type PrintMode = "auto" | "on_demand";

interface PrinterState {
  printer: PairedPrinter | null;
  printMode: PrintMode;
  setPrinter: (printer: PairedPrinter | null) => void;
  setPrintMode: (printMode: PrintMode) => void;
}

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set) => ({
      printer: null,
      printMode: "auto",
      setPrinter: (printer) => set({ printer }),
      setPrintMode: (printMode) => set({ printMode }),
    }),
    {
      name: "senti-printer",
      storage: createJSONStorage(() => storage),
    },
  ),
);
