import { KitchenTicketSocketEvent } from "@/src/types/kitchen_ticket/kitchen_ticket";

export interface SocketEventMaps {
  kitchen: {
    kitchen_ticket_created: KitchenTicketSocketEvent;
    kitchen_ticket_updated: KitchenTicketSocketEvent;
  };
}

export interface SocketOutgoingMaps {
  kitchen: Record<never, never>;
}

/**
 * Mensaje del servidor. Algunos servicios mandan los datos en `payload`
 * ({ type, payload }) y otros al mismo nivel que `type` ({ type, ticket }).
 */
export interface SocketEnvelope {
  type: string;
  payload?: unknown;
}

export type SocketName = keyof SocketEventMaps;
export type SocketStatus = "idle" | "connecting" | "open" | "closed";

/** Parámetros extra de la URL del socket (ej. { branch_id: 7 }). */
export type SocketParams = Record<string, string | number>;
