import { PrintJob } from "@/src/service/printer/printTicket";
import { EscPosBuilder } from "@/src/utils/printer/escpos";

/**
 * Crea un trabajo a partir de un "compositor" que escribe sobre un
 * `EscPosBuilder`. El builder ya viene inicializado y al final se agrega
 * el avance de papel para poder cortar.
 *
 * @example
 * printTicket(
 *   createTicketJob("Cierre de caja", (b) =>
 *     b.align("center").bold(true).line("CIERRE").bold(false).separator(),
 *   ),
 * );
 */
export function createTicketJob(
  label: string,
  compose: (builder: EscPosBuilder) => EscPosBuilder | void,
  { feedLines = 4 }: { feedLines?: number } = {},
): PrintJob {
  return {
    label,
    build: () => {
      const builder = new EscPosBuilder().init();
      compose(builder);
      return builder.feed(feedLines).build();
    },
  };
}
