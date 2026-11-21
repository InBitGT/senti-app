import { PrintJob } from "@/src/service/printer/printTicket";

/**
 * Une varios trabajos en uno solo: se imprimen en la misma conexión, uno
 * detrás de otro. Las partes sin contenido (`build` → null) se omiten y los
 * `afterPrint` de las partes impresas se ejecutan al final.
 */
export function combineJobs(label: string, jobs: PrintJob[]): PrintJob {
  const printed: PrintJob[] = [];

  return {
    label,
    build: async () => {
      printed.length = 0;
      const parts: Uint8Array[] = [];
      for (const job of jobs) {
        const bytes = await job.build();
        if (bytes && bytes.length > 0) {
          parts.push(bytes);
          printed.push(job);
        }
      }
      if (parts.length === 0) return null;
      const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let offset = 0;
      parts.forEach((part) => {
        out.set(part, offset);
        offset += part.length;
      });
      return out;
    },
    afterPrint: () =>
      Promise.allSettled(printed.map((job) => job.afterPrint?.())),
  };
}
