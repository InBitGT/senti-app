import { Button, ButtonText } from "@/components/ui/button";
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
import {
    ADJUSTMENT_STATUS_STYLES,
    StockAdjustmentCount,
} from "@/src/types/stock_adjustment/stock_adjustment.types";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: StockAdjustmentCount;
  onApprove?: (row: StockAdjustmentCount) => void;
  onReject?: (row: StockAdjustmentCount) => void;
  isApproving?: boolean;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => {
  const display =
    typeof value === "boolean" ? (value ? "Sí" : "No") : (value ?? "—");

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(display)}</Text>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

const StatusBadge = ({ status }: { status: string }) => {
  const style = ADJUSTMENT_STATUS_STYLES[status] ?? {
    bg: "#f3f4f6",
    color: "#374151",
    label: status,
  };
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>
        {style.label}
      </Text>
    </View>
  );
};

export const ModalStockAdjustmentDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onApprove,
  isApproving,
  onReject,
}) => {
  const canApprove = data?.adjustment_status === "pending_approval";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Heading size="md" style={styles.name}>
                Ajuste #{data?.id ?? "—"}
              </Heading>
              <Text style={styles.subtitle}>{data?.warehouse?.name}</Text>
            </View>
            {data && <StatusBadge status={data.adjustment_status} />}
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <SectionTitle title="Información general" />
            <InfoRow label="Bodega" value={data?.warehouse?.name} />
            <InfoRow label="Conteo #" value={data?.stock_count_id} />
            <InfoRow label="Notas" value={data?.notes} />

            <Divider />

            <SectionTitle title="Aprobación" />
            <InfoRow label="Solicitado por" value={data?.requested_by_name} />
            <InfoRow label="Aprobado por" value={data?.approved_by ?? "—"} />
            <InfoRow
              label="Fecha de ajuste"
              value={
                data?.adjustment_date
                  ? new Date(data.adjustment_date).toLocaleString("es-GT")
                  : "—"
              }
            />

            <Divider />

            <SectionTitle title="Registro" />
            <InfoRow
              label="Creado"
              value={
                data?.created_at
                  ? new Date(data.created_at).toLocaleString("es-GT")
                  : "—"
              }
            />
            <InfoRow
              label="Actualizado"
              value={
                data?.update_at
                  ? new Date(data.update_at).toLocaleString("es-GT")
                  : "—"
              }
            />
          </ScrollView>
        </ModalBody>

        <ModalFooter style={{ justifyContent: "space-between" }}>
          <Button variant="outline" size="sm" onPress={onClose}>
            <ButtonText>Cerrar</ButtonText>
          </Button>
          {canApprove && (
            <Button
              size="sm"
              style={{ backgroundColor: "#d4d4d4" }}
              onPress={() => data && onApprove?.(data)}
              disabled={isApproving}
            >
              <ButtonText>Rechazado</ButtonText>
            </Button>
          )}
          {canApprove && (
            <Button
              size="sm"
              style={{ backgroundColor: "#16a34a" }}
              onPress={() => data && onApprove?.(data)}
              disabled={isApproving}
            >
              {isApproving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ButtonText>Aprobar</ButtonText>
              )}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", maxHeight: "85%" },
  header: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  name: { color: "#111827", fontWeight: "600" },
  subtitle: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  label: { color: "#6b7280", fontSize: 13, flex: 1 },
  value: { color: "#111827", fontSize: 13, flex: 1.5, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 12 },
});
