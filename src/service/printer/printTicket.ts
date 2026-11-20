import {
  isPrinterSupported,
  PairedPrinter,
  PrintBytesFn,
} from "@/src/service/printer/printer";
import { usePrinterStatusStore } from "@/src/store/usePrinterStatusStore/usePrinterStatusStore";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";

/**
 * Un trabajo de impresión. Todo lo que se imprime en la térmica sigue este
 * patrón, así se puede imprimir desde cualquier parte con `printTicket(job)`.
 *
 * Para crear uno nuevo, agrega un archivo en `src/service/printer/jobs/`
 * con una función que devuelva un `PrintJob` (ver `createTicketJob`).
 */
export interface PrintJob {
  /** Nombre legible del ticket, para logs y mensajes. */
  label: string;
  /**
   * Genera los bytes ESC/POS. Devolver `null` significa "no hay nada que
   * imprimir" y el trabajo se omite sin error.
   */
  build: () => Promise<Uint8Array | null> | Uint8Array | null;
  /** Se ejecuta solo si la impresión fue exitosa (p. ej. marcar "printed"). */
  afterPrint?: () => Promise<unknown> | unknown;
}

export type PrintResult = "printed" | "empty";

export interface PrintOptions {
  /** Impresora a usar; por defecto la de confianza guardada. */
  printer?: PairedPrinter | null;
}

// Cola: los trabajos se envían de uno en uno y en orden, porque la
// impresora térmica acepta una sola conexión a la vez.
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/**
 * Imprime un trabajo en la impresora térmica.
 *
 * @returns `"printed"` si se imprimió, `"empty"` si el trabajo no tenía
 *   contenido.
 * @throws Error con un mensaje listo para mostrar al usuario si no hay
 *   soporte, no hay impresora configurada o falla la conexión.
 */
export function printTicket(
  job: PrintJob,
  options: PrintOptions = {},
): Promise<PrintResult> {
  return enqueue(async () => {
    const status = usePrinterStatusStore.getState();
    try {
      if (!isPrinterSupported()) {
        throw new Error("La impresión solo está disponible en Android.");
      }
      const printer = options.printer ?? usePrinterStore.getState().printer;
      if (!printer) {
        throw new Error(
          "No hay impresora configurada. Ve a Configuración > Impresora.",
        );
      }

      const bytes = await job.build();
      if (!bytes || bytes.length === 0) {
        status.setLastJob({ label: job.label, ok: true, result: "empty" });
        return "empty";
      }

      await PrintBytesFn(printer.address, bytes);

      try {
        await job.afterPrint?.();
      } catch (error) {
        // Ya se imprimió: un fallo aquí no debe reportarse como error de impresión.
        console.warn(`[printer] afterPrint de "${job.label}" falló`, error);
      }

      status.setLastJob({ label: job.label, ok: true, result: "printed" });
      return "printed";
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No se pudo imprimir.";
      status.setLastJob({ label: job.label, ok: false, error: message });
      throw error instanceof Error ? error : new Error(message);
    }
  });
}
