export type KitchenTicketStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

/** Estados que se pueden enviar al endpoint de cambio de estado. */
export type KitchenTicketStatusUpdate =
  | "preparing"
  | "ready"
  | "completed"
  | "printed";

export interface KitchenTicketModifier {
  product_modifier_id?: number;
  name?: string;
  modifier_name?: string;
  quantity?: number;
}

export interface KitchenTicketItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  notes: string | null;
  is_custom: boolean;
  modifiers: KitchenTicketModifier[];
}

export interface KitchenTicket {
  id: number;
  order_id: number;
  branch_id: number;
  branch_name: string;
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  customer_id: number | null;
  customer_name: string | null;
  ticket_status: KitchenTicketStatus;
  channel: string;
  created_at: string;
  printed_at: string | null;
  started_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  items: KitchenTicketItem[];
}

export interface UpdateKitchenTicketStatusParams {
  id: number;
  ticket_status: KitchenTicketStatusUpdate;
}

/** Columnas visibles en el tablero (completed y cancelled salen del tablero). */
export const BOARD_STATUSES: KitchenTicketStatus[] = [
  "pending",
  "preparing",
  "ready",
];

export const KITCHEN_STATUS_LABEL: Record<KitchenTicketStatus, string> = {
  pending: "Pendientes",
  preparing: "En preparación",
  ready: "Listos",
  completed: "Entregados",
  cancelled: "Cancelados",
};

/** Siguiente estado de cada columna y el texto del botón que lo dispara. */
export const NEXT_KITCHEN_STATUS: Partial<
  Record<
    KitchenTicketStatus,
    { status: KitchenTicketStatusUpdate; label: string }
  >
> = {
  pending: { status: "preparing", label: "Empezar" },
  preparing: { status: "ready", label: "Marcar listo" },
  ready: { status: "completed", label: "Entregar" },
};

export function isBoardStatus(status: KitchenTicketStatus): boolean {
  return BOARD_STATUSES.includes(status);
}

// ---------------------------------------------------------------------------
// Mensajes del WebSocket (sockets.kitchen)
// ---------------------------------------------------------------------------

/** Forma del mensaje: { "type": "kitchen_ticket_created", "ticket": { ... } } */
export interface KitchenTicketSocketEvent {
  type: string;
  ticket: KitchenTicket;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Valida el ticket que llega por socket antes de meterlo a la cache. */
export function isKitchenTicket(value: unknown): value is KitchenTicket {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.branch_id === "number" &&
    typeof value.ticket_status === "string" &&
    Array.isArray(value.items)
  );
}

export function getModifierLabel(modifier: KitchenTicketModifier): string {
  const name = modifier.modifier_name || modifier.name || "Extra";
  return modifier.quantity && modifier.quantity > 1
    ? `${modifier.quantity}× ${name}`
    : name;
}
