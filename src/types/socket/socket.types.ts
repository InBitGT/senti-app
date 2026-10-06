export interface SocketEventMaps {
  notification: {
    "notification:new": { id: number; title: string; body: string };
  };
  inventory: {
    "stock:updated": { product_id: number; quantity: number };
  };
}

export interface SocketOutgoingMaps {
  notification: {
    "notification:read": { id: number };
  };
  inventory: Record<never, never>;
}

export interface SocketEnvelope {
  type: string;
  payload: unknown;
}

export type SocketName = keyof SocketEventMaps;
export type SocketStatus = "idle" | "connecting" | "open" | "closed";
