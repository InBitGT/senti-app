import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockTransferDetail } from "@/src/hooks/useStockTransfer/useStockTransfer";
import { useAuthStore } from "@/src/store";
import {
  REJECTION_REASON_LABELS,
  ReceiveTransferItem,
  RejectionReason,
  StockTransferItem,
} from "@/src/types/stock_transfer/stock_transfer.types";
import { router } from "expo-router";
import { ArrowLeftIcon, CheckCheck, PackageCheck } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LineState {
  accepted: string;
  rejected: string;
  reason: RejectionReason | "";
  notes: string;
}

const toQty = (value: string) => {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const REASON_OPTIONS = (
  Object.keys(REJECTION_REASON_LABELS) as RejectionReason[]
).map((r) => ({ label: REJECTION_REASON_LABELS[r], value: r }));

// Valida una línea; devuelve el mensaje de error o null.
function lineError(
  item: StockTransferItem,
  line: LineState,
  isReturn: boolean,
): string | null {
  const accepted = toQty(line.accepted);
  const rejected = toQty(line.rejected);
  if (accepted + rejected > item.qty_sent) {
    return "Aceptado + rechazado no puede superar lo enviado.";
  }
  if (isReturn && rejected > 0) {
    return "Un retorno no se puede rechazar.";
  }
  if (rejected > 0 && !line.reason) {
    return "Indica el motivo del rechazo.";
  }
  const missing = item.qty_sent - accepted - rejected;
  if ((rejected > 0 || missing > 0) && !line.notes.trim()) {
    return "Agrega una nota explicando la diferencia.";
  }
  return null;
}

export default function ReceiveTransferForm() {
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const { data, isLoading, receive } = useStockTransferDetail();

  const [notes, setNotes] = useState("");
  // Solo se guardan las ediciones; por defecto se propone recibir todo lo enviado.
  const [edits, setEdits] = useState<Record<number, Partial<LineState>>>({});

  const isReturn = data?.transfer_type === "return";

  const lines = useMemo(() => {
    const map: Record<number, LineState> = {};
    for (const item of data?.items ?? []) {
      map[item.id] = {
        accepted: String(item.qty_sent),
        rejected: "0",
        reason: "",
        notes: "",
        ...edits[item.id],
      };
    }
    return map;
  }, [data, edits]);

  const updateLine = (id: number, patch: Partial<LineState>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const acceptAll = () => {
    if (!data) return;
    setEdits((prev) => {
      const next = { ...prev };
      for (const item of data.items) {
        next[item.id] = {
          ...next[item.id],
          accepted: String(item.qty_sent),
          rejected: "0",
        };
      }
      return next;
    });
  };

  const totals = useMemo(() => {
    let sent = 0;
    let accepted = 0;
    let rejected = 0;
    for (const item of data?.items ?? []) {
      const line = lines[item.id];
      sent += item.qty_sent;
      if (!line) continue;
      accepted += toQty(line.accepted);
      rejected += toQty(line.rejected);
    }
    return { sent, accepted, rejected, missing: sent - accepted - rejected };
  }, [data, lines]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!data || data.status !== "in_transit") {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#9ca3af" }}>
          Este traslado no está en tránsito.
        </Text>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    for (const item of data.items) {
      const line = lines[item.id];
      const error = line ? lineError(item, line, isReturn) : "Línea inválida";
      if (error) {
        showToast({
          type: "error",
          message: `${item.snapshot.product_name}: ${error}`,
        });
        return;
      }
    }

    // El backend exige mandar todos los ítems; item_id es items[].id.
    const items: ReceiveTransferItem[] = data.items.map((item) => {
      const line = lines[item.id];
      const rejected = toQty(line.rejected);
      return {
        item_id: item.id,
        qty_accepted: toQty(line.accepted),
        qty_rejected: rejected,
        ...(rejected > 0 && line.reason
          ? { rejection_reason: line.reason }
          : {}),
        ...(line.notes.trim() ? { notes: line.notes.trim() } : {}),
      };
    });

    receive.mutate(
      {
        id: data.id,
        body: {
          user_id: claims?.sub ?? 0,
          notes: notes.trim() || undefined,
          items,
        },
      },
      {
        onSuccess: (res) => {
          showToast({
            type: "success",
            message: res?.return_transfer
              ? `Recibido. Se generó el retorno ${res.return_transfer.number}`
              : "Traslado recibido",
          });
          router.back();
        },
        onError: (err) => {
          showToast({
            type: "error",
            message:
              err instanceof Error ? err.message : "Error al recibir",
          });
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.topBar}>
        <Button
          variant="link"
          size="sm"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ButtonIcon as={ArrowLeftIcon} color="#111827" />
        </Button>
        <Text style={styles.topBarTitle}>
          {isReturn ? "Recibir retorno" : "Recibir traslado"} {data.number}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <DesktopScrollView>
          <View style={styles.card}>
            <Text style={styles.hint}>
              {isReturn
                ? "Un retorno solo se puede aceptar o declarar faltante."
                : "Lo aceptado entra a la bodega destino, lo rechazado regresa al origen en un retorno automático y lo faltante queda como pérdida."}
            </Text>
            <View style={{ alignSelf: "flex-start", marginTop: 10 }}>
              <AppButton
                label="Aceptar todo"
                icon={CheckCheck}
                variant="black"
                outline
                fullWidth={false}
                onPress={acceptAll}
              />
            </View>
          </View>

          {data.items.map((item) => {
            const line = lines[item.id];
            if (!line) return null;
            const rejected = toQty(line.rejected);
            const missing = item.qty_sent - toQty(line.accepted) - rejected;
            const error = lineError(item, line, isReturn);
            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.itemName}>{item.snapshot.product_name}</Text>
                <Text style={styles.itemMeta}>
                  {[
                    item.snapshot.product_sku,
                    item.snapshot.batch_number
                      ? `Lote ${item.snapshot.batch_number}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                <Text style={styles.sentText}>
                  Enviado: {item.qty_sent} {item.snapshot.uom_code ?? ""}
                </Text>

                <View style={styles.qtyRow}>
                  <View style={{ flex: 1 }}>
                    <AppInput
                      label="Aceptado"
                      keyboardType="numeric"
                      value={line.accepted}
                      onChangeText={(v) => updateLine(item.id, { accepted: v })}
                      inputStyle={{ color: "#000" }}
                    />
                  </View>
                  {!isReturn && (
                    <View style={{ flex: 1 }}>
                      <AppInput
                        label="Rechazado"
                        keyboardType="numeric"
                        value={line.rejected}
                        onChangeText={(v) =>
                          updateLine(item.id, { rejected: v })
                        }
                        inputStyle={{ color: "#000" }}
                      />
                    </View>
                  )}
                  <View style={styles.missingBox}>
                    <Text style={styles.missingLabel}>Faltante</Text>
                    <Text
                      style={[
                        styles.missingValue,
                        missing > 0 && { color: "#dc2626" },
                      ]}
                    >
                      {missing}
                    </Text>
                  </View>
                </View>

                {rejected > 0 && !isReturn && (
                  <AppSelect
                    label="Motivo del rechazo"
                    placeholder="Selecciona un motivo"
                    options={REASON_OPTIONS}
                    value={line.reason}
                    onChange={(v) =>
                      updateLine(item.id, { reason: v as RejectionReason })
                    }
                  />
                )}

                {(rejected > 0 || missing > 0) && (
                  <AppInput
                    label="Nota de la diferencia"
                    value={line.notes}
                    onChangeText={(v) => updateLine(item.id, { notes: v })}
                    multiline
                    textareaHeight={70}
                    inputStyle={{ color: "#000" }}
                  />
                )}

                {!!error && <Text style={styles.errorText}>{error}</Text>}
              </View>
            );
          })}

          <View style={styles.card}>
            <AppInput
              label="Notas de la recepción (opcional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              textareaHeight={80}
              inputStyle={{ color: "#000" }}
            />
            <View style={styles.summary}>
              <Text style={styles.summaryText}>Enviado {totals.sent}</Text>
              <Text style={styles.summaryText}>
                Aceptado {totals.accepted}
              </Text>
              {!isReturn && (
                <Text style={styles.summaryText}>
                  Rechazado {totals.rejected}
                </Text>
              )}
              <Text style={styles.summaryText}>Faltante {totals.missing}</Text>
            </View>
            <AppButton
              label="Confirmar recepción"
              icon={PackageCheck}
              variant="black"
              isLoading={receive.isPending}
              onPress={handleSubmit}
            />
          </View>
        </DesktopScrollView>
      </ScrollView>
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
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef0f3",
    gap: 8,
    marginBottom: 12,
  },
  hint: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  itemName: { color: "#111827", fontSize: 14, fontWeight: "600" },
  itemMeta: { color: "#9ca3af", fontSize: 11.5 },
  sentText: { color: "#374151", fontSize: 13, fontWeight: "500" },
  qtyRow: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  missingBox: { minWidth: 70, alignItems: "center", paddingBottom: 10 },
  missingLabel: { fontSize: 11, color: "#9ca3af" },
  missingValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  errorText: { fontSize: 12, color: "#dc2626" },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryText: { fontSize: 13, color: "#374151", fontWeight: "500" },
});
