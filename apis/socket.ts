import { SOCKET_ENDPOINT, WS_BASE_URL } from "@/lib";
import { refreshAccessToken } from "@/lib/auth/refreshToken";
import { storage } from "@/lib/storage/storage";
import {
    SocketEnvelope,
    SocketEventMaps,
    SocketName,
    SocketOutgoingMaps,
    SocketStatus,
} from "@/src/types/socket/socket.types";

type RawListener = (payload: unknown) => void;

const AUTH_CLOSE_CODE = 4001;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const HEARTBEAT_INTERVAL = 25000;

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
  private pending: string[] = [];

  constructor(private readonly name: N) {}

  async connect(): Promise<void> {
    if (this.status === "connecting" || this.status === "open") return;
    this.manualClose = false;
    this.status = "connecting";

    const token = await storage.getItem("access_token");
    if (!token || !WS_BASE_URL || this.manualClose) {
      this.status = "idle";
      return;
    }

    const ws = new WebSocket(
      `${WS_BASE_URL}${SOCKET_ENDPOINT[this.name]}?token=${encodeURIComponent(token)}`,
    );
    this.ws = ws;

    ws.onopen = () => {
      this.status = "open";
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
    this.status = "idle";
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
    this.listeners
      .get(parsed.type)
      ?.forEach((listener) => listener(parsed.payload));
  }

  private async handleClose(code: number): Promise<void> {
    this.clearTimers();
    this.ws = null;
    this.status = "closed";
    if (this.manualClose) return;

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
  notification: new SocketClient("notification"),
  inventory: new SocketClient("inventory"),
};

export const connectSockets = (): void => {
  Object.values(sockets).forEach((client) => {
    void client.connect();
  });
};

export const disconnectSockets = (): void => {
  Object.values(sockets).forEach((client) => client.disconnect());
};
