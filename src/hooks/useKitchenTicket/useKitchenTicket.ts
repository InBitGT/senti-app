import {
  kitchenBoardFn,
  updateKitchenTicketStatus,
} from "@/src/service/kitchen_ticket/kitchen_ticket.services";
import {
  isBoardStatus,
  KitchenTicket,
  KitchenTicketStatus,
  UpdateKitchenTicketStatusParams,
} from "@/src/types/kitchen_ticket/kitchen_ticket";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Sin estaciones: ["kitchen-board", branchId] (igual que antes).
 * Con estaciones: ["kitchen-board", branchId, "0,3"] para no mezclar caches.
 */
export const kitchenBoardKey = (
  branchId: number | null,
  stationIds?: string,
) =>
  stationIds
    ? (["kitchen-board", branchId, stationIds] as const)
    : (["kitchen-board", branchId] as const);

/** true si el ticket pertenece a las estaciones del tablero (0 = General). */
export function belongsToStations(
  ticket: KitchenTicket,
  stationIds?: string,
): boolean {
  if (!stationIds || ticket.prep_station_id === undefined) return true;
  const ids = stationIds.split(",").map((id) => Number(id));
  return ids.includes(ticket.prep_station_id ?? 0);
}

/**
 * Inserta o reemplaza un ticket en la cache del tablero.
 * Si ya no pertenece al tablero (completed / cancelled) se quita.
 */
export function upsertKitchenTicket(
  queryClient: QueryClient,
  branchId: number,
  ticket: KitchenTicket,
  stationIds?: string,
): void {
  queryClient.setQueryData<KitchenTicket[]>(
    kitchenBoardKey(branchId, stationIds),
    (current) => {
      const list = current ?? [];
      const others = list.filter((item) => item.id !== ticket.id);
      if (
        ticket.branch_id !== branchId ||
        !isBoardStatus(ticket.ticket_status) ||
        !belongsToStations(ticket, stationIds)
      ) {
        return others;
      }
      return [...others, ticket].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    },
  );
}

function withStatus(
  ticket: KitchenTicket,
  status: KitchenTicketStatus,
): KitchenTicket {
  const now = new Date().toISOString();
  return {
    ...ticket,
    ticket_status: status,
    started_at: status === "preparing" ? now : ticket.started_at,
    ready_at: status === "ready" ? now : ticket.ready_at,
    completed_at: status === "completed" ? now : ticket.completed_at,
  };
}

export function useKitchenTicket(branchId: number | null, stationIds?: string) {
  const queryClient = useQueryClient();
  const key = kitchenBoardKey(branchId, stationIds);

  const board = useQuery({
    queryKey: key,
    queryFn: () => kitchenBoardFn(branchId ?? 0, stationIds),
    enabled: branchId !== null,
  });

  const changeStatus = useMutation({
    mutationFn: updateKitchenTicketStatus,
    // Actualización optimista: el ticket cambia de columna al instante.
    onMutate: async (params: UpdateKitchenTicketStatusParams) => {
      if (branchId === null || params.ticket_status === "printed") {
        return { previous: undefined };
      }
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<KitchenTicket[]>(key);
      const ticket = previous?.find((item) => item.id === params.id);
      if (ticket) {
        upsertKitchenTicket(
          queryClient,
          branchId,
          withStatus(ticket, params.ticket_status),
          stationIds,
        );
      }
      return { previous };
    },
    onError: (_error, _params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (ticket) => {
      if (ticket && branchId !== null && isKitchenTicketPayload(ticket)) {
        upsertKitchenTicket(queryClient, branchId, ticket, stationIds);
      }
    },
  });

  return {
    tickets: board.data ?? [],
    isLoading: board.isLoading,
    isError: board.isError,
    refetch: board.refetch,
    changeStatus,
  };
}

/** El endpoint de estado puede no devolver el ticket completo. */
function isKitchenTicketPayload(ticket: KitchenTicket): boolean {
  return (
    Array.isArray(ticket.items) && typeof ticket.ticket_status === "string"
  );
}
