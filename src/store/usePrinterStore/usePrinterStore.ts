import { storage } from "@/lib/storage/storage";
import { PairedPrinter } from "@/src/service/printer/printer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PrinterState {
  printer: PairedPrinter | null;
  setPrinter: (printer: PairedPrinter | null) => void;
}

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set) => ({
      printer: null,
      setPrinter: (printer) => set({ printer }),
    }),
    {
      name: "senti-printer",
      storage: createJSONStorage(() => storage),
    },
  ),
);
