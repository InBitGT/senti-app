/**
 * Impresión térmica (Bluetooth, Android).
 *
 * Patrón:
 *   1. Un ticket es un `PrintJob` (bytes ESC/POS + acción posterior opcional).
 *      Los jobs viven en `./jobs/`.
 *   2. Se imprime siempre con `printTicket(job)`, que usa la impresora de
 *      confianza, encola los trabajos y actualiza el estado de conexión.
 *   3. En componentes React, usar `usePrintTicket()` para tener `isPrinting`
 *      y toasts de resultado.
 */
export * from "./jobs/combineJobs";
export * from "./jobs/createTicketJob";
export * from "./jobs/kitchenOrderJob";
export * from "./jobs/kitchenTicketJob";
export * from "./jobs/saleVoucherJob";
export * from "./jobs/testTicketJob";
export * from "./printer";
export * from "./printOnSale";
export * from "./printTicket";
