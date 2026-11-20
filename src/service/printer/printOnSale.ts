import { combineJobs } from "@/src/service/printer/jobs/combineJobs";
import { kitchenOrderJob } from "@/src/service/printer/jobs/kitchenOrderJob";
import { saleVoucherJob } from "@/src/service/printer/jobs/saleVoucherJob";
import { isPrinterSupported } from "@/src/service/printer/printer";
import { PrintJob, printTicket } from "@/src/service/printer/printTicket";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";
import { PaymentMethod } from "@/src/types/payment_methods/payment_methods";
import { Vaucher } from "@/src/types/vaucher/vaucher";

export interface SaleJobOptions {
  paymentMethods?: PaymentMethod[];
}

/**
 * Lo que se imprime por cada venta: el comprobante y, si la orden generó
 * tickets de cocina, el ticket de cocina. Lo usan la impresión automática
 * y el botón "Imprimir / Reimprimir orden".
 */
export function saleJob(
  order: Vaucher,
  options: SaleJobOptions = {},
): PrintJob {
  const jobs = [saleVoucherJob(order, options)];
  if ((order.kitchen_tickets?.length ?? 0) > 0) {
    jobs.push(kitchenOrderJob(order.id));
  }
  return combineJobs(`Orden #${order.id}`, jobs);
}

// Órdenes ya impresas automáticamente en esta sesión, para no duplicar.
const autoPrinted = new Set<number>();

/** Indica si la orden ya se imprimió automáticamente al venderse. */
export function wasAutoPrinted(orderId: number): boolean {
  return autoPrinted.has(orderId);
}

/**
 * Se llama cada vez que se genera el voucher de una venta. Si el modo de
 * impresión es "Al hacer una venta", imprime la orden (ver `saleJob`).
 *
 * No lanza errores: el resultado queda en `usePrinterStatusStore.lastJob`
 * (y el estado de conexión actualiza el aviso del POS).
 */
export async function printOnSale(
  order: Vaucher,
  options: SaleJobOptions = {},
): Promise<void> {
  const { printMode, printer } = usePrinterStore.getState();
  if (printMode !== "auto" || !printer || !isPrinterSupported()) return;
  if (autoPrinted.has(order.id)) return;

  autoPrinted.add(order.id);
  try {
    await printTicket(saleJob(order, options));
  } catch (error) {
    // Se permite reintentar con "Reimprimir orden".
    console.warn(`[printer] auto-impresión de la orden #${order.id}`, error);
  }
}
