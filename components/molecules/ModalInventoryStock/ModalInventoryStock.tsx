import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
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
import { InventoryStockDetail } from "@/src/types/inventory_stock/inventory_stock.types";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: InventoryStockDetail;
}

interface InfoRowProps {
  label: string;
  value: string | number | boolean | undefined | null;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>
      {value === null || value === undefined || value === ""
        ? "—"
        : typeof value === "boolean"
          ? value
            ? "Sí"
            : "No"
          : value}
    </Text>
  </View>
);

export const ModalInventoryStockDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  const SCREEN_HEIGHT = Dimensions.get("window").height;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent
        style={[styles.container, { maxHeight: SCREEN_HEIGHT * 0.75 }]}
      >
        <ModalHeader>
          <Heading size="lg" style={styles.title}>
            Detalle de Movimiento
          </Heading>
        </ModalHeader>

        <ModalBody style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <DesktopScrollView>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bodega</Text>
                <InfoRow label="Nombre" value={data?.warehouse?.name} />
                <InfoRow label="Código" value={data?.warehouse?.code} />
                <InfoRow label="Tipo" value={data?.warehouse?.type} />
                <InfoRow
                  label="Descripción"
                  value={data?.warehouse?.description}
                />
                <InfoRow
                  label="Por defecto"
                  value={data?.warehouse?.is_default}
                />
                <InfoRow
                  label="Usa zonas"
                  value={data?.warehouse?.uses_zones}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Producto</Text>
                <InfoRow label="Nombre" value={data?.product?.name} />
                <InfoRow label="SKU" value={data?.product?.sku} />
                <InfoRow label="Cód. barras" value={data?.product?.barcode} />
                <InfoRow label="Marca" value={data?.product?.brand} />
                <InfoRow label="Tipo" value={data?.product?.type} />
                <InfoRow
                  label="Requiere lote"
                  value={data?.product?.requires_batch}
                />
                <InfoRow
                  label="Disponibilidad"
                  value={data?.product?.availability_status}
                />
                {data?.product?.is_modifier && (
                  <>
                    <InfoRow
                      label="Grupo modificador"
                      value={data.product.modifier_group}
                    />
                    <InfoRow
                      label="Nombre modificador"
                      value={data.product.modifier_name}
                    />
                  </>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Movimiento</Text>
                <InfoRow label="Tipo" value={data?.movement_type} />
                <InfoRow label="Razón" value={data?.reason} />
                <InfoRow label="Cantidad" value={data?.qty} />
                <InfoRow
                  label="Costo unit."
                  value={
                    data?.unit_cost != null
                      ? `Q${data.unit_cost.toFixed(2)}`
                      : undefined
                  }
                />
                <InfoRow
                  label="Total"
                  value={
                    data?.qty != null && data?.unit_cost != null
                      ? `Q${(data.qty * data.unit_cost).toFixed(2)}`
                      : undefined
                  }
                />
                <InfoRow label="Referencia" value={data?.reference_number} />
                {!!data?.notes && <InfoRow label="Notas" value={data.notes} />}
              </View>

              {data?.batch && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lote</Text>
                    <InfoRow
                      label="Número de lote"
                      value={data.batch.batch_number}
                    />
                  </View>
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
  container: { backgroundColor: "#fff", maxHeight: "80%" },
  title: { color: "#000" },
  section: { marginBottom: 4 },
  sectionTitle: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: { color: "#374151", fontWeight: "500", flex: 1 },
  value: { color: "#111827", flex: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },
});
