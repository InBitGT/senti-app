import {
  kitchenOrderPrintFn,
  updateKitchenTicketStatus,
} from "@/src/service/kitchen_ticket/kitchen_ticket.services";
import {
  isPrinterSupported,
  PrintBytesFn,
} from "@/src/service/printer/printer";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";
import {
  kitchenOrderBytes,
  kitchenOrderText,
} from "@/src/utils/printer/kitchenTicketPrint";
import { useState } from "react";

export function usePrintKitchenOrder() {
  const printer = usePrinterStore((s) => s.printer);
  const [isPrinting, setIsPrinting] = useState(false);

  async function printOrder(orderId: number): Promise<boolean> {
    if (!isPrinterSupported()) {
      throw new Error("La impresión solo está disponible en Android.");
    }
    setIsPrinting(true);
    try {
      const ticket = await kitchenOrderPrintFn(orderId);
      if (!ticket || ticket.stations.length === 0) return false;
      if (__DEV__) console.log(`\n${kitchenOrderText(ticket)}\n`);
      if (!printer) throw new Error("Configura una impresora.");
      await PrintBytesFn(printer.address, kitchenOrderBytes(ticket));
      await Promise.allSettled(
        ticket.stations.map((station) =>
          updateKitchenTicketStatus({
            id: station.kitchen_ticket_id,
            ticket_status: "printed",
          }),
        ),
      );
      return true;
    } finally {
      setIsPrinting(false);
    }
  }

  return { printer, isPrinting, printOrder };
}
