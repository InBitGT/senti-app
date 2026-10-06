import { SocketName } from "@/src/types/socket/socket.types";

export const SOCKET_ENDPOINT = {
  // El branch_id se agrega al conectar: sockets.kitchen.connect({ branch_id }).
  kitchen: "payment-client-service/api/ws/kitchen",
} satisfies Record<SocketName, string>;
