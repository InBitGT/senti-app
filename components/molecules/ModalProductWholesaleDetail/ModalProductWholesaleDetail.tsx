import { Badge } from "@/components/atom/Badge/Badge";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Divider } from "@/components/atom/Divider/Divider";
import { InfoRow } from "@/components/atom/InfoRow/InfoRow";
import { SectionTitle } from "@/components/atom/SectionTitle/SectionTitle";
import { StatBox } from "@/components/atom/StatBox/StatBox";
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
import { ProductWholesaleRule } from "@/src/types/wholesale/wholesale";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: ProductWholesaleRule;
}

export const ModalProductWholesaleDetail: React.FC<Props> = ({
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
                {data?.product?.name || "—"}
              </Heading>
              <Text style={styles.subtitle}>{data?.product?.sku}</Text>
            </View>
            <Badge active={data?.status ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              {data && (
                <>
                  <SectionTitle title="Regla de descuento" />
                  <View style={styles.statsRow}>
                    <StatBox
                      label="Cantidad mínima"
                      value={String(data.min_quantity)}
                      color="#111827"
                    />
                    <StatBox
                      label="Descuento"
                      value={`${data.discount_percentage}%`}
                      color="#16a34a"
                    />
                  </View>
                  <Text
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                  >
                    A partir de {data.min_quantity} unidades, el cliente obtiene{" "}
                    {data.discount_percentage}% de descuento en este producto.
                  </Text>

                  <Divider />

                  <SectionTitle title="Producto" />
                  <InfoRow label="Nombre" value={data.product?.name} />
                  <InfoRow label="SKU" value={data.product?.sku} />
                  <InfoRow label="Marca" value={data.product?.brand ?? "—"} />
                  <InfoRow label="Tipo" value={data.product?.type} />

                  <Divider />

                  <SectionTitle title="Registro" />
                  <InfoRow
                    label="Creado"
                    value={new Date(data.created_at).toLocaleString("es-GT")}
                  />
                  <InfoRow
                    label="Actualizado"
                    value={new Date(data.update_at).toLocaleString("es-GT")}
                  />
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
  subtitle: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
});
