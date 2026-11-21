import {
  kitchenOrderPrintFn,
  updateKitchenTicketStatus,
} from "@/src/service/kitchen_ticket/kitchen_ticket.services";
import { PrintJob } from "@/src/service/printer/printTicket";
import { KitchenOrderPrint } from "@/src/types/kitchen_ticket/kitchen_ticket";
import {
  kitchenOrderBytes,
  kitchenOrderText,
} from "@/src/utils/printer/kitchenTicketPrint";

/**
 * Ticket de cocina de una orden: lo pide al backend, lo imprime y marca
 * cada ticket de estación como "printed".
 */
export function kitchenOrderJob(orderId: number): PrintJob {
  let ticket: KitchenOrderPrint | undefined;

  return {
    label: `Ticket de la orden #${orderId}`,
    build: async () => {
      ticket = await kitchenOrderPrintFn(orderId);
      if (!ticket || ticket.stations.length === 0) return null;
      if (__DEV__) console.log(`\n${kitchenOrderText(ticket)}\n`);
      return kitchenOrderBytes(ticket);
    },
    afterPrint: () =>
      Promise.allSettled(
        (ticket?.stations ?? []).map((station) =>
          updateKitchenTicketStatus({
            id: station.kitchen_ticket_id,
            ticket_status: "printed",
          }),
        ),
      ),
  };
}
