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
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: UnitOfMeasure;
}

const UOM_TYPE_LABELS: Record<string, string> = {
  unit: "Unidad",
  weight: "Peso",
  volume: "Volumen",
  length: "Longitud",
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => {
  const display =
    value === null || value === undefined
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "Sí"
          : "No"
        : value;

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

const StatusBadge = ({ status }: { status?: boolean }) => (
  <View
    style={[styles.badge, { backgroundColor: status ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: status ? "#16a34a" : "#dc2626" }]}>
      {status ? "Activo" : "Inactivo"}
    </Text>
  </View>
);

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ModalUnitDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.imgBox}>
              <Text style={styles.imgText}>📏</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.name ?? "—"}
              </Heading>
              <Text style={styles.code}>Código: {data?.code ?? "—"}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={data?.status} />
              </View>
            </View>
          </View>
        </ModalHeader>

        <ModalBody style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <SectionTitle title="General" />
            <InfoRow label="Nombre" value={data?.name} />
            <InfoRow label="Código" value={data?.code} />
            <InfoRow
              label="Tipo"
              value={
                data?.uom_type
                  ? (UOM_TYPE_LABELS[data.uom_type] ?? data.uom_type)
                  : undefined
              }
            />
            <InfoRow label="Estado" value={data?.status} />

            <View style={styles.divider} />

            <SectionTitle title="Metadatos" />
            <InfoRow label="ID" value={data?.id} />
            <InfoRow label="Tenant" value={data?.tenant_id} />
            <InfoRow label="Creado" value={formatDateTime(data?.created_at)} />
            <InfoRow
              label="Actualizado"
              value={formatDateTime(data?.update_at)}
            />
          </ScrollView>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" size="sm" onPress={onClose}>
            <ButtonText>Cerrar</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", maxHeight: "85%" },
  header: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  imgBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  imgText: { fontSize: 24 },
  name: { color: "#111827", fontWeight: "600" },
  code: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "500" },
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
