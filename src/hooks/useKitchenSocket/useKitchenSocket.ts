import { sockets } from "@/apis/socket";
import {
  belongsToStations,
  kitchenBoardKey,
  upsertKitchenTicket,
} from "@/src/hooks/useKitchenTicket/useKitchenTicket";
import {
  isKitchenTicket,
  KitchenTicket,
  KitchenTicketSocketEvent,
} from "@/src/types/kitchen_ticket/kitchen_ticket";
import { SocketParams, SocketStatus } from "@/src/types/socket/socket.types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

interface UseKitchenSocketOptions {
  branchId: number | null;
  /**
   * Estaciones a escuchar ("3", "0" = General, "0,3").
   * Sin valor se escucha toda la sucursal (comportamiento original).
   */
  stationIds?: string;
  /** Se llama cuando llega un ticket nuevo (sonido / vibración / resaltado). */
  onTicketCreated?: (ticket: KitchenTicket) => void;
}

/**
 * Escucha el socket de cocina (`sockets.kitchen`, SOCKET_ENDPOINT.kitchen)
 * de la sucursal elegida: payment-client-service/api/ws/kitchen?branch_id=<id>.
 * Si el usuario cambia de sucursal, se reconecta con el nuevo branch_id.
 * Este socket no lleva token en la URL, solo el branch_id.
 * La conexión, el heartbeat y la reconexión los maneja SocketClient;
 * aquí solo se conecta al abrir el tablero y se desconecta al salir.
 *
 * - Cada ticket recibido actualiza la cache de react-query del tablero.
 * - Al reconectar, o al volver la app a primer plano, se recarga el tablero por
 *   REST para no perder tickets que llegaron mientras no había conexión.
 */
export function useKitchenSocket({
  branchId,
  stationIds,
  onTicketCreated,
}: UseKitchenSocketOptions): SocketStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SocketStatus>(() =>
    sockets.kitchen.getStatus(),
  );

  const onCreatedRef = useRef(onTicketCreated);
  useEffect(() => {
    onCreatedRef.current = onTicketCreated;
  }, [onTicketCreated]);

  useEffect(() => {
    if (branchId === null) return;

    const client = sockets.kitchen;
    let wasDisconnected = false;
    const params: SocketParams = stationIds
      ? { branch_id: branchId, prep_station_ids: stationIds }
      : { branch_id: branchId };

    const resync = (): void => {
      void queryClient.invalidateQueries({
        queryKey: kitchenBoardKey(branchId, stationIds),
      });
    };

    const applyTicket = (
      event: KitchenTicketSocketEvent,
      isNew: boolean,
    ): void => {
      if (!isKitchenTicket(event.ticket)) return;
      upsertKitchenTicket(queryClient, branchId, event.ticket, stationIds);
      if (
        isNew &&
        event.ticket.branch_id === branchId &&
        belongsToStations(event.ticket, stationIds)
      ) {
        onCreatedRef.current?.(event.ticket);
      }
    };

    const offCreated = client.on("kitchen_ticket_created", (event) =>
      applyTicket(event, true),
    );
    const offUpdated = client.on("kitchen_ticket_updated", (event) =>
      applyTicket(event, false),
    );

    const offStatus = client.onStatusChange((next) => {
      setStatus(next);
      if (next === "closed") wasDisconnected = true;
      if (next === "open" && wasDisconnected) {
        wasDisconnected = false;
        resync();
      }
    });

    const appStateSub = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        if (state !== "active") return;
        resync();
        void client.connect(params);
      },
    );

    // El socket de cocina se abre por sucursal: ?branch_id=<sucursal elegida>.
    void client.connect(params);

    return () => {
      offCreated();
      offUpdated();
      offStatus();
      appStateSub.remove();
      client.disconnect();
    };
  }, [branchId, stationIds, queryClient]);

  return status;
}
