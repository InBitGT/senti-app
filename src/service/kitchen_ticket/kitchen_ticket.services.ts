import { get, put } from "@/apis";
import { ENDPOINT } from "@/lib";
import {
  KitchenTicket,
  UpdateKitchenTicketStatusParams,
} from "@/src/types/kitchen_ticket/kitchen_ticket";

/**
 * Tablero de cocina. Sin `stationIds` trae todo (comportamiento original);
 * con `stationIds` ("3", "0" = General, "0,3") filtra por estación.
 */
export async function kitchenBoardFn(
  branchId: number,
  stationIds?: string,
): Promise<KitchenTicket[]> {
  const response = await get<KitchenTicket[]>(
    stationIds
      ? ENDPOINT.prepStation.board(branchId, stationIds)
      : ENDPOINT.kitchenTicket.board(branchId),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data ?? [];
}

/**
 * Cambia el estado del ticket. "printed" solo registra la impresión
 * y no mueve el ticket de columna.
 * Si el backend usa PUT en lugar de PATCH, cambiar `patch` por `put` aquí.
 */
export async function updateKitchenTicketStatus({
  id,
  ticket_status,
}: UpdateKitchenTicketStatusParams): Promise<KitchenTicket | undefined> {
  const response = await put<KitchenTicket>(ENDPOINT.kitchenTicket.status(id), {
    ticket_status,
  });

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
