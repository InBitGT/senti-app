import { createTicketJob } from "@/src/service/printer/jobs/createTicketJob";

/** Ticket de prueba para verificar impresora, acentos y ancho de papel. */
export function testTicketJob() {
  return createTicketJob("Prueba de impresión", (b) =>
    b
      .align("center")
      .bold(true)
      .tall(true)
      .line("SENTI")
      .tall(false)
      .bold(false)
      .line("Prueba de impresión")
      .line("áéíóú ñÑ ¿¡")
      .separator(),
  );
}
