import { updateKitchenTicketStatus } from "@/src/service/kitchen_ticket/kitchen_ticket.services";
import { PrintJob } from "@/src/service/printer/printTicket";
import { KitchenTicket } from "@/src/types/kitchen_ticket/kitchen_ticket";
import {
  kitchenOrderBytes,
  kitchenOrderText,
  kitchenTicketToPrint,
} from "@/src/utils/printer/kitchenTicketPrint";

/**
 * Ticket de una estación tal como se ve en el tablero de cocina (foodprep).
 * Usa los datos que ya están en pantalla, sin volver a pedirlos al backend.
 *
 * @param markPrinted Marca el ticket como "printed" en el backend después
 *   de imprimir. Pásalo en `false` si quien llama ya hace esa actualización
 *   (p. ej. con su propia mutation para refrescar la cache).
 */
export function kitchenTicketJob(
  ticket: KitchenTicket,
  { markPrinted = true }: { markPrinted?: boolean } = {},
): PrintJob {
  return {
    label: `Ticket #${ticket.id}`,
    build: () => {
      if (ticket.items.length === 0) return null;
      const printable = kitchenTicketToPrint(ticket);
      if (__DEV__) console.log(`\n${kitchenOrderText(printable)}\n`);
      return kitchenOrderBytes(printable);
    },
    afterPrint: markPrinted
      ? () =>
          updateKitchenTicketStatus({
            id: ticket.id,
            ticket_status: "printed",
          })
      : undefined,
  };
}
