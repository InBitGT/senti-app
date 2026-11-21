import { useCustomToast } from "@/src/hooks/useCustomToast";
import {
  isPrinterSupported,
  PrintJob,
  PrintOptions,
  PrintResult,
  printTicket,
} from "@/src/service/printer";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";
import { useState } from "react";

interface PrintMessages {
  /** Toast al imprimir. `false` para no mostrarlo. */
  success?: string | false;
  /** Toast cuando el trabajo no tenía contenido. `false` para no mostrarlo. */
  empty?: string | false;
}

/**
 * Hook para imprimir cualquier `PrintJob` desde un componente.
 * Maneja `isPrinting` y muestra toasts de éxito / error.
 *
 * @example
 * const { print, isPrinting } = usePrintTicket();
 * await print(kitchenOrderJob(order.id), { success: "Ticket impreso" });
 */
export function usePrintTicket() {
  const { showToast } = useCustomToast();
  const printer = usePrinterStore((s) => s.printer);
  const printMode = usePrinterStore((s) => s.printMode);
  const [isPrinting, setIsPrinting] = useState(false);

  async function print(
    job: PrintJob,
    messages: PrintMessages = {},
    options?: PrintOptions,
  ): Promise<PrintResult | null> {
    setIsPrinting(true);
    try {
      const result = await printTicket(job, options);
      const message =
        result === "printed"
          ? (messages.success ?? `${job.label}: impreso`)
          : (messages.empty ?? `${job.label}: no hay nada que imprimir`);
      if (message) {
        showToast({
          message,
          type: result === "printed" ? "success" : "error",
        });
      }
      return result;
    } catch (error: unknown) {
      showToast({
        message: error instanceof Error ? error.message : "No se pudo imprimir",
        type: "error",
      });
      return null;
    } finally {
      setIsPrinting(false);
    }
  }

  return {
    supported: isPrinterSupported(),
    printer,
    printMode,
    isPrinting,
    print,
  };
}
