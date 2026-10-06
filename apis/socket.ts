import { SOCKET_ENDPOINT, WS_BASE_URL } from "@/lib";
import { refreshAccessToken } from "@/lib/auth/refreshToken";
import { storage } from "@/lib/storage/storage";
import {
  SocketEnvelope,
  SocketEventMaps,
  SocketName,
  SocketOutgoingMaps,
  SocketParams,
  SocketStatus,
} from "@/src/types/socket/socket.types";
import { Platform } from "react-native";

type RawListener = (payload: unknown) => void;
type StatusListener = (status: SocketStatus) => void;

/** Código con el que el servidor cierra si el token venció o no es válido. */
const AUTH_CLOSE_CODE = 4001;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const HEARTBEAT_INTERVAL = 25000;

const sameParams = (a: SocketParams, b: SocketParams): boolean => {
  const keysA = Object.keys(a);
  return (
    keysA.length === Object.keys(b).length &&
    keysA.every((key) => String(a[key]) === String(b[key]))
  );
};

/**
 * WS_BASE_URL + endpoint + ?param=valor&token=... (respeta un "?" existente).
 */
const buildSocketUrl = (endpoint: string, params: SocketParams): string => {
  const query = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${WS_BASE_URL}${endpoint}${query ? separator + query : ""}`;
};

/** Firma del WebSocket de React Native (acepta headers en el 3er parámetro). */
type NativeWebSocketConstructor = new (
  url: string,
  protocols: string | string[] | null,
  options: { headers: Record<string, string> },
) => WebSocket;

/**
 * Abre el WebSocket. El token ya va en la URL (&token=...).
 * En iOS / Android además se manda `Authorization: Bearer <token>` en el header.
 * En web (navegador / Tauri) NO se pasan más argumentos: si se pasa `null`
 * como 2º parámetro, el navegador lo envía como subprotocolo "null" y el
 * servidor rechaza la conexión.
 */
const openSocket = (url: string, token: string | null): WebSocket => {
  if (Platform.OS === "web" || !token) {
    return new WebSocket(url);
  }
  const NativeWebSocket = WebSocket as unknown as NativeWebSocketConstructor;
  return new NativeWebSocket(url, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const isEnvelope = (value: unknown): value is SocketEnvelope =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  typeof value.type === "string";

class SocketClient<N extends SocketName> {
  private ws: WebSocket | null = null;
  private status: SocketStatus = "idle";
  private retries = 0;
  private manualClose = false;
  private authRetried = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Map<string, Set<RawListener>>();
  private statusListeners = new Set<StatusListener>();
  private pending: string[] = [];
  private params: SocketParams = {};

  constructor(private readonly name: N) {}

  /**
   * Abre la conexión. `params` se agregan a la URL (ej. { branch_id: 7 })
   * y se reutilizan en cada reconexión.
   * Si ya hay conexión con otros parámetros, se cierra y se abre de nuevo.
   */
  async connect(params?: SocketParams): Promise<void> {
    if (params && !sameParams(params, this.params)) {
      this.params = { ...params };
      if (this.status === "connecting" || this.status === "open") {
        this.disconnect();
      }
    }
    if (this.status === "connecting" || this.status === "open") return;
    this.manualClose = false;
    this.setStatus("connecting");

    if (!WS_BASE_URL) {
      this.setStatus("idle");
      return;
    }

    const token = await storage.getItem("access_token");
    if (this.manualClose) return;

    const ws = openSocket(
      buildSocketUrl(
        SOCKET_ENDPOINT[this.name],
        token ? { ...this.params, token } : this.params,
      ),
      token,
    );
    this.ws = ws;

    ws.onopen = () => {
      this.setStatus("open");
      this.retries = 0;
      this.authRetried = false;
      this.startHeartbeat();
      this.flushPending();
    };
    ws.onmessage = (event) => this.handleMessage(event.data);
    ws.onclose = (event) => {
      void this.handleClose(event.code);
    };
  }

  disconnect(): void {
    this.manualClose = true;
    this.clearTimers();
    this.pending = [];
    this.ws?.close(1000, "client disconnect");
    this.ws = null;
    this.setStatus("idle");
  }

  on<K extends keyof SocketEventMaps[N] & string>(
    type: K,
    listener: (payload: SocketEventMaps[N][K]) => void,
  ): () => void {
    const wrapped: RawListener = (payload) =>
      listener(payload as SocketEventMaps[N][K]);
    const set = this.listeners.get(type) ?? new Set<RawListener>();
    set.add(wrapped);
    this.listeners.set(type, set);

    return () => {
      set.delete(wrapped);
      if (set.size === 0) this.listeners.delete(type);
    };
  }

  getStatus(): SocketStatus {
    return this.status;
  }

  /** Avisa cada cambio de estado (para indicadores "en vivo" y resincronizar). */
  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(status: SocketStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  send<K extends keyof SocketOutgoingMaps[N] & string>(
    type: K,
    payload: SocketOutgoingMaps[N][K],
  ): void {
    this.sendRaw(JSON.stringify({ type, payload }));
  }

  private sendRaw(message: string): void {
    if (this.ws && this.status === "open") {
      this.ws.send(message);
    } else {
      this.pending.push(message);
    }
  }

  private flushPending(): void {
    const queue = this.pending;
    this.pending = [];
    queue.forEach((message) => this.ws?.send(message));
  }

  private handleMessage(raw: unknown): void {
    if (typeof raw !== "string") return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!isEnvelope(parsed) || parsed.type === "pong") return;
    // Si el servidor no usa `payload`, se entrega el mensaje completo.
    const payload = "payload" in parsed ? parsed.payload : parsed;
    this.listeners.get(parsed.type)?.forEach((listener) => listener(payload));
  }

  private async handleClose(code: number): Promise<void> {
    this.clearTimers();
    this.ws = null;
    this.setStatus("closed");
    if (this.manualClose) return;

    // Token vencido: se refresca una vez y se reconecta con el nuevo header.
    if (code === AUTH_CLOSE_CODE && !this.authRetried) {
      this.authRetried = true;
      try {
        await refreshAccessToken();
        await this.connect();
      } catch {
        return;
      }
      return;
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      BASE_RETRY_DELAY * 2 ** this.retries,
      MAX_RETRY_DELAY,
    );
    const jitter = Math.random() * 0.3 * delay;
    this.retries += 1;
    this.reconnectTimer = setTimeout(() => {
      void this.connect();
    }, delay + jitter);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendRaw(JSON.stringify({ type: "ping" }));
    }, HEARTBEAT_INTERVAL);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
  }
}

export const sockets = {
  kitchen: new SocketClient("kitchen"),
};

/**
 * Sockets que no se abren al iniciar sesión: los conecta la pantalla que los usa
 * (ej. el tablero de cocina) y los cierra al salir.
 */
const ON_DEMAND_SOCKETS: SocketName[] = ["kitchen"];

export const connectSockets = (): void => {
  (Object.keys(sockets) as SocketName[])
    .filter((name) => !ON_DEMAND_SOCKETS.includes(name))
    .forEach((name) => {
      void sockets[name].connect();
    });
};

export const disconnectSockets = (): void => {
  Object.values(sockets).forEach((client) => client.disconnect());
};
