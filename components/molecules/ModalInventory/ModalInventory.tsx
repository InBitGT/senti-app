import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Divider } from "@/components/atom/Divider/Divider";
import { InfoRow } from "@/components/atom/InfoRow/InfoRow";
import { SectionTitle } from "@/components/atom/SectionTitle/SectionTitle";
import { StatBox } from "@/components/atom/StatBox/StatBox";
import { StatusBadge } from "@/components/atom/StatusBadge/StatusBadge";
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
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: InventoryStockItem;
}

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
            <DesktopScrollView>
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
            </DesktopScrollView>
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
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
});
