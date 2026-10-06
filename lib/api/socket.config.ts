import { SocketName } from "@/src/types/socket/socket.types";

export const SOCKET_ENDPOINT = {
  notification: "notification-service/ws",
  inventory: "inventory-service/ws",
} satisfies Record<SocketName, string>;
