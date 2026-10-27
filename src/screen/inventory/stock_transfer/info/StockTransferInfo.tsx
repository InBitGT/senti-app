import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { InfoRow } from "@/components/atom/InfoRow/InfoRow";
import {
  formatQ,
  formatRate,
  TransferStatusBadge,
} from "@/components/templates/StockTransferTable/StockTransferTable";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockTransferDetail } from "@/src/hooks/useStockTransfer/useStockTransfer";
import { useAuthStore } from "@/src/store";
import { useStockTransferStore } from "@/src/store/useStockTransferStore/useStockTransferStore";
import {
  StockTransferItem,
  TransferEndpoint,
  TransferLink,
  TransferReceptionItem,
  TransferUser,
} from "@/src/types/stock_transfer/stock_transfer.types";
import { router } from "expo-router";
import {
  ArrowLeftIcon,
  ArrowRight,
  ClipboardCheck,
  ClockIcon,
  FileTextIcon,
  HistoryIcon,
  PackageCheck,
  PackageIcon,
  SendIcon,
  Undo2,
  XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardIconWrap}>
        <Icon size={14} color="#6366f1" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const MOVEMENT_LABELS: Record<string, string> = {
  transfer_out: "Salida por traslado",
  transfer_in: "Entrada por traslado",
  transfer_loss: "Pérdida en traslado",
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString("es-GT");
};

const userName = (user?: TransferUser | null) =>
  user ? `${user.first_name} ${user.last_name}`.trim() || user.username : null;

const EndpointBlock = ({
  label,
  endpoint,
}: {
  label: string;
  endpoint: TransferEndpoint;
}) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.endpointLabel}>{label}</Text>
    <Text style={styles.endpointName}>{endpoint.warehouse_name_snapshot}</Text>
    <Text style={styles.endpointMeta}>
      {[endpoint.warehouse_code_snapshot, endpoint.branch_name_snapshot]
        .filter(Boolean)
        .join(" · ")}
    </Text>
  </View>
);

const QtyChips = ({
  item,
}: {
  item: Pick<
    StockTransferItem,
    "qty_sent" | "qty_accepted" | "qty_rejected" | "qty_missing"
  >;
}) => (
  <View style={styles.chipRow}>
    <Text style={styles.chip}>Enviado {item.qty_sent}</Text>
    {item.qty_accepted > 0 && (
      <Text style={[styles.chip, styles.chipOk]}>
        Aceptado {item.qty_accepted}
      </Text>
    )}
    {item.qty_rejected > 0 && (
      <Text style={[styles.chip, styles.chipWarn]}>
        Rechazado {item.qty_rejected}
      </Text>
    )}
    {item.qty_missing > 0 && (
      <Text style={[styles.chip, styles.chipBad]}>
        Faltante {item.qty_missing}
      </Text>
    )}
  </View>
);

const ItemRow = ({
  item,
  reception,
}: {
  item: StockTransferItem;
  reception?: TransferReceptionItem;
}) => (
  <View style={styles.itemRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemName}>{item.snapshot.product_name}</Text>
      <Text style={styles.itemMeta}>
        {[item.snapshot.product_sku, item.snapshot.uom_code]
          .filter(Boolean)
          .join(" · ")}
      </Text>
      {!!item.snapshot.batch_number && (
        <Text style={styles.itemMeta}>
          Lote: {item.snapshot.batch_number}
          {item.snapshot.batch_expiration
            ? ` · Vence ${new Date(item.snapshot.batch_expiration).toLocaleDateString("es-GT")}`
            : ""}
        </Text>
      )}
      <QtyChips item={item} />
      {!!reception?.rejection_reason_label && (
        <Text style={styles.itemMeta}>
          Motivo: {reception.rejection_reason_label}
        </Text>
      )}
      {!!item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
      {!!item.reception_notes && (
        <Text style={styles.itemNotes}>Recepción: {item.reception_notes}</Text>
      )}
      <Text style={styles.itemUnitPrice}>{formatQ(item.unit_cost)} c/u</Text>
    </View>
    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.itemSubtotal}>{formatQ(item.value_sent)}</Text>
      {item.value_lost > 0 && (
        <Text style={styles.lostText}>-{formatQ(item.value_lost)}</Text>
      )}
    </View>
  </View>
);

const LinkRow = ({
  label,
  link,
  onPress,
}: {
  label: string;
  link: TransferLink;
  onPress: (id: number) => void;
}) => (
  <Pressable style={styles.linkRow} onPress={() => onPress(link.id)}>
    <Undo2 size={14} color="#6366f1" />
    <Text style={styles.linkText}>
      {label}: {link.number}
    </Text>
  </Pressable>
);

export default function StockTransferInfoScreen() {
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const setSelectedId = useStockTransferStore((s) => s.setSelectedId);
  const { data, isLoading, reception, dispatch, cancel } =
    useStockTransferDetail();

  const [confirmDispatch, setConfirmDispatch] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <PackageIcon size={32} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 8 }}>
          No se encontró el traslado.
        </Text>
      </SafeAreaView>
    );
  }

  const userId = claims?.sub ?? 0;
  const isDraft = data.status === "draft";
  // Solo quien pertenece a la sucursal destino puede recibir.
  const canReceive =
    data.status === "in_transit" &&
    (claims?.branches ?? []).some(
      (b) => b.branch_id === data.destination.branch?.id,
    );

  const receptionByItem = new Map(
    (reception?.items ?? []).map((i) => [i.item_id, i]),
  );

  const handleDispatch = () => {
    dispatch.mutate(
      { id: data.id, body: { user_id: userId } },
      {
        onSuccess: () => {
          setConfirmDispatch(false);
          showToast({ type: "success", message: "Traslado despachado" });
        },
        onError: (err) => {
          setConfirmDispatch(false);
          showToast({
            type: "error",
            message:
              err instanceof Error && err.message === "OUT_OF_STOCK"
                ? "No hay stock suficiente en la bodega origen."
                : err instanceof Error
                  ? err.message
                  : "Error al despachar el traslado",
          });
        },
      },
    );
  };

  const handleCancel = () => {
    cancel.mutate(
      {
        id: data.id,
        body: { user_id: userId, reason: cancelReason.trim() || undefined },
      },
      {
        onSuccess: () => {
          setConfirmCancel(false);
          setCancelReason("");
          showToast({ type: "success", message: "Traslado cancelado" });
        },
        onError: (err) => {
          showToast({
            type: "error",
            message:
              err instanceof Error ? err.message : "Error al cancelar",
          });
        },
      },
    );
  };

  const totals = reception?.totals ?? data.totals;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Button
            variant="link"
            size="sm"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ButtonIcon as={ArrowLeftIcon} color="#111827" />
          </Button>
          <Text style={styles.topBarTitle}>Detalle de traslado</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroType}>
              {data.transfer_type === "return"
                ? "Retorno de traslado"
                : "Traslado entre bodegas"}
            </Text>
            <TransferStatusBadge
              status={data.status}
              label={data.status_label}
            />
          </View>
          <Heading size="2xl" style={styles.heroFolio}>
            {data.number}
          </Heading>
          <Text style={styles.heroDate}>{formatDate(data.created_at)}</Text>

          <View style={styles.endpoints}>
            <EndpointBlock label="Origen" endpoint={data.origin} />
            <ArrowRight size={18} color="#9ca3af" />
            <EndpointBlock label="Destino" endpoint={data.destination} />
          </View>

          {data.parent_transfer && (
            <LinkRow
              label="Traslado original"
              link={data.parent_transfer}
              onPress={setSelectedId}
            />
          )}
          {data.return_transfer && (
            <LinkRow
              label="Retorno generado"
              link={data.return_transfer}
              onPress={setSelectedId}
            />
          )}

          <View style={styles.heroDivider} />
          <View style={styles.heroTotalsRow}>
            <Text style={styles.heroTotalLabel}>Valor enviado</Text>
            <Text style={styles.heroTotalMain}>
              {formatQ(totals.value_sent)}
            </Text>
          </View>

          {(isDraft || canReceive) && (
            <View style={styles.actions}>
              {isDraft && (
                <>
                  <AppButton
                    label="Despachar"
                    icon={SendIcon}
                    variant="black"
                    onPress={() => setConfirmDispatch(true)}
                  />
                  <AppButton
                    label="Cancelar traslado"
                    icon={XCircle}
                    variant="black"
                    outline
                    onPress={() => setConfirmCancel(true)}
                  />
                </>
              )}
              {canReceive && (
                <AppButton
                  label={
                    data.transfer_type === "return"
                      ? "Recibir retorno"
                      : "Recibir traslado"
                  }
                  icon={PackageCheck}
                  variant="black"
                  onPress={() =>
                    router.navigate(
                      "/(drawer)/(inventory)/(form)/stock_transfer_receive_form",
                    )
                  }
                />
              )}
            </View>
          )}
        </View>

        <SectionCard title={`Productos (${data.items.length})`} icon={PackageIcon}>
          {data.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              reception={receptionByItem.get(item.id)}
            />
          ))}
        </SectionCard>

        {reception && (
          <SectionCard title="Acta de recepción" icon={ClipboardCheck}>
            <InfoRow label="Recibido por" value={userName(reception.received_by)} />
            <InfoRow label="Fecha" value={formatDate(reception.received_at)} />
            <InfoRow
              label="Horas en tránsito"
              value={reception.hours_in_transit ?? "—"}
            />
            <InfoRow label="Unidades enviadas" value={totals.qty_sent} />
            <InfoRow label="Unidades aceptadas" value={totals.qty_accepted} />
            <InfoRow label="Unidades rechazadas" value={totals.qty_rejected} />
            <InfoRow label="Unidades faltantes" value={totals.qty_missing} />
            <InfoRow label="Valor aceptado" value={formatQ(totals.value_accepted)} />
            <InfoRow label="Valor rechazado" value={formatQ(totals.value_rejected)} />
            <InfoRow label="Pérdida" value={formatQ(totals.value_lost)} />
            <InfoRow
              label="Cumplimiento"
              value={formatRate(totals.compliance_rate)}
            />
          </SectionCard>
        )}

        {data.timeline.length > 0 && (
          <SectionCard title="Línea de tiempo" icon={ClockIcon}>
            {data.timeline.map((t, idx) => (
              <View key={`${t.action}-${idx}`} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{t.label}</Text>
                  <Text style={styles.itemMeta}>
                    {[userName(t.user), formatDate(t.at)]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
              </View>
            ))}
            {!!data.cancel_reason && (
              <Text style={styles.itemNotes}>
                Motivo de cancelación: {data.cancel_reason}
              </Text>
            )}
          </SectionCard>
        )}

        {!!data.movements?.length && (
          <SectionCard title="Movimientos de kárdex" icon={HistoryIcon}>
            {data.movements.map((m) => (
              <View key={m.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {MOVEMENT_LABELS[m.movement_type] ?? m.movement_type}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {m.warehouse_name} · {formatDate(m.created_at)}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  {m.qty} × {formatQ(m.unit_cost)}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {!!data.notes && (
          <SectionCard title="Notas" icon={FileTextIcon}>
            <Text style={styles.notesText}>{data.notes}</Text>
          </SectionCard>
        )}
      </ScrollView>

      <Modal isOpen={confirmDispatch} onClose={() => setConfirmDispatch(false)}>
        <ModalBackdrop />
        <ModalContent style={{ backgroundColor: "#fff" }}>
          <ModalHeader>
            <Heading size="lg" style={{ color: "#000" }}>
              Despachar traslado
            </Heading>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: "#000" }}>
              El traslado pasará a En tránsito y se descontará el stock de{" "}
              {data.origin.warehouse_name_snapshot}.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setConfirmDispatch(false)}
            >
              <ButtonText style={{ color: "#6b7280" }}>Volver</ButtonText>
            </Button>
            <Button
              size="sm"
              style={{ marginLeft: 10, backgroundColor: "#111827" }}
              onPress={handleDispatch}
              isDisabled={dispatch.isPending}
            >
              <ButtonText style={{ color: "#fff" }}>Despachar</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={confirmCancel} onClose={() => setConfirmCancel(false)}>
        <ModalBackdrop />
        <ModalContent style={{ backgroundColor: "#fff" }}>
          <ModalHeader>
            <Heading size="lg" style={{ color: "#000" }}>
              Cancelar traslado
            </Heading>
          </ModalHeader>
          <ModalBody>
            <AppInput
              label="Motivo (opcional)"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              textareaHeight={80}
              inputStyle={{ color: "#000" }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setConfirmCancel(false)}
            >
              <ButtonText style={{ color: "#6b7280" }}>Volver</ButtonText>
            </Button>
            <Button
              size="sm"
              style={{ marginLeft: 10, backgroundColor: "#dc2626" }}
              onPress={handleCancel}
              isDisabled={cancel.isPending}
            >
              <ButtonText style={{ color: "#fff" }}>Cancelar traslado</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: { paddingHorizontal: 0, width: 32 },
  topBarTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  content: { padding: 16, paddingBottom: 32, gap: 12 },

  hero: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eef0f3",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroFolio: { color: "#111827", fontWeight: "700", marginTop: 4 },
  heroDate: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  endpoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  endpointLabel: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  endpointName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  endpointMeta: { fontSize: 12, color: "#6b7280" },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  linkText: { fontSize: 13, color: "#6366f1", fontWeight: "600" },
  heroDivider: {
    height: 1,
    marginVertical: 14,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  heroTotalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTotalLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  heroTotalMain: { fontSize: 22, fontWeight: "800", color: "#16a34a" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef0f3",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },

  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  itemName: { color: "#111827", fontSize: 14, fontWeight: "600" },
  itemMeta: { color: "#9ca3af", fontSize: 11.5, marginTop: 2 },
  itemNotes: {
    color: "#9ca3af",
    fontSize: 11.5,
    marginTop: 2,
    fontStyle: "italic",
  },
  itemUnitPrice: { color: "#6b7280", fontSize: 12, marginTop: 4 },
  itemSubtotal: { color: "#111827", fontSize: 14, fontWeight: "700" },
  lostText: { color: "#dc2626", fontSize: 12, marginTop: 2 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  chip: {
    fontSize: 11,
    color: "#4b5563",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  chipOk: { color: "#27500A", backgroundColor: "#EAF3DE" },
  chipWarn: { color: "#633806", backgroundColor: "#FAEEDA" },
  chipBad: { color: "#791F1F", backgroundColor: "#FCEBEB" },

  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
    marginTop: 6,
  },

  notesText: { color: "#374151", fontSize: 13, lineHeight: 19 },
});
