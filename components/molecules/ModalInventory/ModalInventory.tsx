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
import { InventoryStockItem } from "@/src/types/inventory/inventory";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: InventoryStockItem;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value ?? "—"}</Text>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const StatusBadge = ({ availableQty }: { availableQty: number }) => {
  const isEmpty = availableQty <= 0;
  const bg = isEmpty ? "#fee2e2" : "#dcfce7";
  const color = isEmpty ? "#dc2626" : "#16a34a";
  const label = isEmpty ? "Sin stock" : "Disponible";
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ModalInventoryStockDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.product_name ?? "—"}
              </Heading>
              <Text style={styles.sku}>
                SKU: {data?.sku ?? "—"} · {data?.warehouse_name}
              </Text>
            </View>
            {data && <StatusBadge availableQty={data.available_qty} />}
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            {data && (
              <>
                <SectionTitle title="Existencias" />
                <View style={styles.statsRow}>
                  <StatBox
                    label="En existencia"
                    value={data.total_qty_on_hand}
                    color="#111827"
                  />
                  <StatBox
                    label="Reservado"
                    value={data.total_qty_reserved}
                    color="#6b7280"
                  />
                  <StatBox
                    label="Disponible"
                    value={data.available_qty}
                    color="#16a34a"
                  />
                </View>

                <InfoRow
                  label="Unidad de medida"
                  value={data.unit_of_measure || "—"}
                />
                <InfoRow
                  label="Costo promedio"
                  value={formatCurrency(data.average_cost)}
                />
                <InfoRow label="Líneas de lote" value={data.batch_lines} />

                <Divider />

                <SectionTitle title="Bodega" />
                <InfoRow label="Nombre" value={data.warehouse_name} />
                <InfoRow label="ID de bodega" value={data.warehouse_id} />
                <InfoRow label="ID de producto" value={data.product_id} />
              </>
            )}
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
  headerRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  name: { color: "#111827", fontWeight: "600" },
  sku: { color: "#6b7280", fontSize: 12, marginTop: 2 },
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
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  statBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: "700" },
});
