import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Icon } from "@/components/ui/icon";
import { storage } from "@/lib/storage/storage";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useKitchenSocket } from "@/src/hooks/useKitchenSocket/useKitchenSocket";
import { useKitchenTicket } from "@/src/hooks/useKitchenTicket/useKitchenTicket";
import { useAuthStore } from "@/src/store";
import {
    getModifierLabel,
    KitchenTicket,
    KitchenTicketStatus,
    KitchenTicketStatusUpdate,
    NEXT_KITCHEN_STATUS,
} from "@/src/types/kitchen_ticket/kitchen_ticket";
import { SocketStatus } from "@/src/types/socket/socket.types";
import * as Haptics from "expo-haptics";
import { ChefHat, Printer, RefreshCw } from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    LayoutChangeEvent,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Minutos a partir de los cuales el tiempo se marca en amarillo / rojo. */
const WARN_MINUTES = 10;
const LATE_MINUTES = 20;
/** Tiempo que un ticket recién llegado se muestra con la marca "NUEVO". */
const NEW_HIGHLIGHT_MS = 15_000;
const CLOCK_TICK_MS = 30_000;
/** Ancho mínimo de cada ticket: define cuántos caben por fila. */
const TICKET_MIN_WIDTH = 250;
const TICKET_GAP = 14;
const COMPLETE_ANIMATION_MS = 380;

const MONO = Platform.select({
  ios: "Courier",
  android: "monospace",
  default: "monospace",
});

/** Cada estado tiñe muy suavemente el papel y marca una línea fina arriba. */
const STATUS_STYLE: Record<
  KitchenTicketStatus,
  { paper: string; accent: string; label: string }
> = {
  pending: { paper: "#FFFFFF", accent: "#F59E0B", label: "Pendiente" },
  preparing: { paper: "#F0F9FF", accent: "#0EA5E9", label: "Preparando" },
  ready: { paper: "#F0FDF4", accent: "#16A34A", label: "Listo" },
  completed: { paper: "#FAFAFA", accent: "#9CA3AF", label: "Entregado" },
  cancelled: { paper: "#FEF2F2", accent: "#DC2626", label: "Cancelado" },
};

const TAP_HINT: Partial<Record<KitchenTicketStatus, string>> = {
  pending: "Toca para empezar",
  preparing: "Toca cuando esté listo",
  ready: "Toca para entregar",
};

/** Última sucursal vista en el tablero (se recuerda en este dispositivo). */
const BRANCH_STORAGE_KEY = "kitchen-board-branch";
/** Con más sucursales que esto se usa un select en lugar de botones. */
const MAX_BRANCH_CHIPS = 4;

const INK = "#1C1917";
const MUTED = "#78716C";

type Filter = "all" | KitchenTicketStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "preparing", label: "Preparando" },
  { value: "ready", label: "Listos" },
];

function useNow(intervalMs: number): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function minutesSince(iso: string | null, now: number): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

function formatElapsed(minutes: number): string {
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function haptic(kind: "tap" | "new"): void {
  if (Platform.OS === "web") return;
  const promise =
    kind === "new"
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  promise.catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Ticket
// ---------------------------------------------------------------------------

/** Borde dentado discreto, como papel cortado de la impresora. */
function TornEdge({ color }: { color: string }) {
  return (
    <View style={styles.tornEdge}>
      {Array.from({ length: 60 }, (_, index) => (
        <View key={index} style={[styles.tooth, { borderTopColor: color }]} />
      ))}
    </View>
  );
}

interface TicketProps {
  ticket: KitchenTicket;
  now: number;
  isNew: boolean;
  isUpdating: boolean;
  onAdvance: (ticket: KitchenTicket, status: KitchenTicketStatusUpdate) => void;
  onPrint: (ticket: KitchenTicket) => void;
}

function KitchenTicketReceipt({
  ticket,
  now,
  isNew,
  isUpdating,
  onAdvance,
  onPrint,
}: TicketProps) {
  const theme = STATUS_STYLE[ticket.ticket_status];
  const next = NEXT_KITCHEN_STATUS[ticket.ticket_status];
  const elapsed = minutesSince(ticket.created_at, now);

  // Valores animados estables durante la vida del ticket.
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const useNative = Platform.OS !== "web";

  // Rebote leve al cambiar de estado.
  useEffect(() => {
    scale.setValue(0.97);
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: useNative,
    }).start();
  }, [ticket.ticket_status, scale, useNative]);

  const timeColor =
    ticket.ticket_status === "ready"
      ? MUTED
      : elapsed >= LATE_MINUTES
        ? "#DC2626"
        : elapsed >= WARN_MINUTES
          ? "#D97706"
          : MUTED;

  const handlePress = (): void => {
    if (!next || isUpdating || isLeaving) return;
    haptic("tap");

    if (next.status === "completed") {
      // Tercer toque: el ticket se encoge, se desvanece y sale del tablero.
      setIsLeaving(true);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.5,
          duration: COMPLETE_ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: useNative,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: COMPLETE_ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: useNative,
        }),
      ]).start(() => onAdvance(ticket, "completed"));
      return;
    }

    onAdvance(ticket, next.status);
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Pressable
        onPress={handlePress}
        disabled={!next || isUpdating || isLeaving}
        accessibilityRole="button"
        accessibilityLabel={`Ticket ${ticket.id}, ${theme.label}. ${TAP_HINT[ticket.ticket_status] ?? ""}`}
        style={({ pressed }) => [styles.ticket, pressed && { opacity: 0.85 }]}
      >
        <View
          style={[
            styles.paper,
            { backgroundColor: theme.paper, borderTopColor: theme.accent },
          ]}
        >
          {/* Encabezado */}
          <View style={styles.headerRow}>
            <View style={styles.rowCenter}>
              <Text style={[styles.mono, styles.ticketNo]}>#{ticket.id}</Text>
              {isNew && <View style={styles.newDot} />}
            </View>
            <Text style={[styles.mono, styles.time, { color: timeColor }]}>
              {formatElapsed(elapsed)}
            </Text>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            Orden {ticket.order_id} · {formatClock(ticket.created_at)}
            {ticket.customer_name ? ` · ${ticket.customer_name}` : ""}
          </Text>

          <View style={styles.dashed} />

          {/* Productos */}
          <View style={styles.lines}>
            {ticket.items.map((item) => (
              <View key={item.order_item_id}>
                <View style={styles.lineRow}>
                  <Text style={[styles.mono, styles.qty]}>{item.quantity}</Text>
                  <Text style={[styles.mono, styles.product]}>
                    {item.product_name}
                  </Text>
                </View>
                {!!item.variant_name && (
                  <Text style={[styles.mono, styles.sub]}>
                    {item.variant_name}
                  </Text>
                )}
                {item.modifiers.map((modifier, index) => (
                  <Text
                    key={`${item.order_item_id}-${modifier.product_modifier_id ?? index}`}
                    style={[styles.mono, styles.sub]}
                  >
                    + {getModifierLabel(modifier)}
                  </Text>
                ))}
                {!!item.notes && (
                  <Text style={[styles.mono, styles.note]}>“{item.notes}”</Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.dashed} />

          {/* Pie */}
          <View style={styles.footerRow}>
            <View style={styles.rowCenter}>
              <View
                style={[styles.statusDot, { backgroundColor: theme.accent }]}
              />
              {isUpdating ? (
                <ActivityIndicator size="small" color={theme.accent} />
              ) : (
                <Text style={styles.hint}>
                  {TAP_HINT[ticket.ticket_status] ?? theme.label}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => onPrint(ticket)}
              disabled={isUpdating || isLeaving}
              accessibilityLabel="Imprimir ticket"
              hitSlop={10}
            >
              <Icon
                as={Printer}
                size="sm"
                style={{ color: ticket.printed_at ? theme.accent : "#A8A29E" }}
              />
            </Pressable>
          </View>
        </View>
        <TornEdge color={theme.paper} />
      </Pressable>
    </Animated.View>
  );
}

function TicketGrid({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number>(0);
  const items = React.Children.toArray(children);

  const columns =
    width === 0
      ? 1
      : Math.max(
          1,
          Math.floor((width + TICKET_GAP) / (TICKET_MIN_WIDTH + TICKET_GAP)),
        );
  const itemWidth =
    width === 0 ? "100%" : (width - TICKET_GAP * (columns - 1)) / columns;

  const handleLayout = (event: LayoutChangeEvent): void => {
    const next = event.nativeEvent.layout.width;
    if (next !== width) setWidth(next);
  };

  return (
    <View onLayout={handleLayout} style={styles.grid}>
      {items.map((child, index) => (
        <View
          key={React.isValidElement(child) && child.key ? child.key : index}
          style={{ width: itemWidth }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

function ConnectionStatus({ status }: { status: SocketStatus }) {
  const isLive = status === "open";
  const label =
    status === "open"
      ? "En vivo"
      : status === "connecting"
        ? "Conectando"
        : status === "closed"
          ? "Reconectando"
          : "Sin conexión";
  return (
    <View style={styles.rowCenter}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: isLive ? "#16A34A" : "#F59E0B" },
        ]}
      />
      <Text style={styles.connectionText}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export function KitchenBoardScreen() {
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const now = useNow(CLOCK_TICK_MS);

  // Sucursales del usuario (claims). Si tiene varias, puede elegir cuál ver;
  // por defecto se abre la última que vio, o la primera de la lista.
  const branches = useMemo(() => claims?.branches ?? [], [claims]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    storage
      .getItem(BRANCH_STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && saved) setSelectedBranchId(Number(saved));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const branchId = useMemo<number | null>(() => {
    const isValid = branches.some((b) => b.branch_id === selectedBranchId);
    if (isValid) return selectedBranchId;
    return branches[0]?.branch_id ?? null;
  }, [branches, selectedBranchId]);

  const handleSelectBranch = (id: number): void => {
    if (id === branchId) return;
    setSelectedBranchId(id);
    setFilter("all");
    storage.setItem(BRANCH_STORAGE_KEY, String(id)).catch(() => undefined);
  };
  const [filter, setFilter] = useState<Filter>("all");
  const [newIds, setNewIds] = useState<Set<number>>(() => new Set());

  const { tickets, isLoading, isError, refetch, changeStatus } =
    useKitchenTicket(branchId);

  const highlightTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => highlightTimers.current.forEach((timer) => clearTimeout(timer)),
    [],
  );

  const handleTicketCreated = useCallback((ticket: KitchenTicket) => {
    haptic("new");
    setNewIds((prev) => new Set(prev).add(ticket.id));
    highlightTimers.current.push(
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(ticket.id);
          return next;
        });
      }, NEW_HIGHLIGHT_MS),
    );
  }, []);

  const socketStatus = useKitchenSocket({
    branchId,
    onTicketCreated: handleTicketCreated,
  });

  const counts = useMemo<Record<KitchenTicketStatus, number>>(() => {
    const result: Record<KitchenTicketStatus, number> = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };
    tickets.forEach((ticket) => {
      result[ticket.ticket_status] += 1;
    });
    return result;
  }, [tickets]);

  // Orden del riel: primero lo listo para entregar, luego lo que se prepara,
  // luego lo pendiente; dentro de cada grupo, el más antiguo primero.
  const visibleTickets = useMemo<KitchenTicket[]>(() => {
    const priority: Record<KitchenTicketStatus, number> = {
      ready: 0,
      preparing: 1,
      pending: 2,
      completed: 3,
      cancelled: 4,
    };
    return tickets
      .filter((ticket) => filter === "all" || ticket.ticket_status === filter)
      .sort(
        (a, b) =>
          priority[a.ticket_status] - priority[b.ticket_status] ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
  }, [tickets, filter]);

  const updateStatus = (
    ticket: KitchenTicket,
    status: KitchenTicketStatusUpdate,
  ): void => {
    changeStatus.mutate(
      { id: ticket.id, ticket_status: status },
      {
        onSuccess: () => {
          if (status === "printed") {
            showToast({
              message: `Ticket #${ticket.id} impreso`,
              type: "success",
            });
          }
          if (status === "completed") {
            showToast({
              message: `Ticket #${ticket.id} entregado`,
              type: "success",
            });
          }
        },
        onError: () =>
          showToast({
            message: `No se pudo actualizar el ticket #${ticket.id}`,
            type: "error",
          }),
      },
    );
  };

  const updatingId = changeStatus.isPending
    ? (changeStatus.variables?.id ?? null)
    : null;

  // ---------- Usuario sin sucursales ----------
  if (branchId === null) {
    return (
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <View style={styles.centered}>
          <Icon as={ChefHat} size="xl" style={{ color: "#D6D3D1" }} />
          <Text style={styles.centerTitle}>Tablero de cocina</Text>
          <Text style={styles.centerText}>
            Tu usuario no tiene sucursales asignadas.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const branchName =
    branches.find((b) => b.branch_id === branchId)?.branch_name ?? "";

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <View style={{ flex: 1, minWidth: 160 }}>
          <Text style={styles.topTitle}>Tablero de cocina</Text>
          <Text style={styles.topSubtitle}>
            {branchName} · {tickets.length} activos
          </Text>
        </View>
        <ConnectionStatus status={socketStatus} />
        <Pressable
          onPress={() => void refetch()}
          accessibilityLabel="Recargar tablero"
          hitSlop={10}
        >
          <Icon as={RefreshCw} size="sm" style={{ color: MUTED }} />
        </Pressable>
      </View>

      {/* Sucursal: siempre visible; si tiene varias, se puede cambiar aquí */}
      {branches.length > 0 &&
        (branches.length <= MAX_BRANCH_CHIPS ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.branchBar}
            contentContainerStyle={styles.branchChips}
          >
            {branches.map((branch) => {
              const isActive = branch.branch_id === branchId;
              return (
                <Pressable
                  key={branch.branch_id}
                  onPress={() => handleSelectBranch(branch.branch_id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.branchChip,
                    isActive && styles.branchChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.branchChipText,
                      isActive && styles.branchChipTextActive,
                    ]}
                  >
                    {branch.branch_name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.branchSelect}>
            <AppSelect
              placeholder="Sucursal"
              searchable
              options={branches.map((branch) => ({
                label: branch.branch_name,
                value: String(branch.branch_id),
              }))}
              value={String(branchId)}
              onChange={(value: string) => handleSelectBranch(Number(value))}
            />
          </View>
        ))}

      {/* Filtros */}
      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const isActive = item.value === filter;
          const count =
            item.value === "all" ? tickets.length : counts[item.value];
          return (
            <Pressable
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {item.label}
              </Text>
              <Text style={styles.filterCount}>{count}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.centerText}>No se pudo cargar el tablero.</Text>
          <Pressable onPress={() => void refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : visibleTickets.length === 0 ? (
        <View style={styles.centered}>
          <Icon as={ChefHat} size="xl" style={{ color: "#D6D3D1" }} />
          <Text style={styles.centerText}>
            {filter === "all"
              ? "No hay tickets por ahora. Los nuevos aparecerán aquí."
              : "No hay tickets en este estado."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.rail}>
          <TicketGrid>
            {visibleTickets.map((ticket) => (
              <KitchenTicketReceipt
                key={ticket.id}
                ticket={ticket}
                now={now}
                isNew={newIds.has(ticket.id)}
                isUpdating={updatingId === ticket.id}
                onAdvance={updateStatus}
                onPrint={(item) => updateStatus(item, "printed")}
              />
            ))}
          </TicketGrid>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F4",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  // ---------- Barra superior ----------
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: INK,
  },
  topSubtitle: {
    fontSize: 13,
    color: MUTED,
  },
  connectionText: {
    fontSize: 12,
    color: MUTED,
  },
  // ---------- Sucursal ----------
  branchBar: {
    flexGrow: 0,
  },
  branchChips: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  branchChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D6D3D1",
  },
  branchChipActive: {
    backgroundColor: INK,
    borderColor: INK,
  },
  branchChipText: {
    fontSize: 13,
    color: MUTED,
  },
  branchChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  branchSelect: {
    width: "100%",
    maxWidth: 320,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  // ---------- Filtros ----------
  filters: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {
    borderBottomColor: INK,
  },
  filterText: {
    fontSize: 14,
    color: MUTED,
  },
  filterTextActive: {
    color: INK,
    fontWeight: "600",
  },
  filterCount: {
    fontSize: 12,
    color: "#A8A29E",
  },
  rail: {
    padding: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: TICKET_GAP,
    width: "100%",
  },
  // ---------- Ticket ----------
  ticket: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  paper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  tornEdge: {
    flexDirection: "row",
    height: 5,
    overflow: "hidden",
  },
  tooth: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  mono: {
    fontFamily: MONO,
    color: INK,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketNo: {
    fontSize: 18,
    fontWeight: "700",
  },
  newDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#0EA5E9",
  },
  time: {
    fontSize: 13,
  },
  meta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  dashed: {
    marginVertical: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D6D3D1",
  },
  lines: {
    gap: 10,
  },
  lineRow: {
    flexDirection: "row",
    gap: 10,
  },
  qty: {
    minWidth: 18,
    fontSize: 15,
    fontWeight: "700",
  },
  product: {
    flex: 1,
    fontSize: 15,
  },
  sub: {
    fontSize: 13,
    color: MUTED,
    marginLeft: 28,
    marginTop: 1,
  },
  note: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#B45309",
    marginLeft: 28,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hint: {
    fontSize: 12,
    color: MUTED,
  },
  // ---------- Estados vacíos ----------
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: INK,
  },
  centerText: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: INK,
  },
  retryText: {
    color: INK,
    fontSize: 14,
    fontWeight: "600",
  },
});
