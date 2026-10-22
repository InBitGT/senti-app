import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
import { InfoRow } from "@/components/atom/InfoRow/InfoRow";
import { SectionTitle } from "@/components/atom/SectionTitle/SectionTitle";
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
import { PrepStation } from "@/src/types/prep_station/prep_station.types";
import { formatDateTime } from "@/src/utils/formatDateTime/formatDateTime";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider } from "react-native-paper";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: PrepStation;
}

export const ModalPrepStationDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  const categories = data?.categories ?? [];
  const products = data?.products ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.imgBox}>
              <Text style={styles.imgText}>🍳</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.name ?? "—"}
              </Heading>
              <Text style={styles.code}>Código: {data?.code ?? "—"}</Text>
            </View>
          </View>
        </ModalHeader>

        <ModalBody style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <SectionTitle title="General" />
            <InfoRow label="ID" value={data?.id} />
            <InfoRow label="Creada" value={formatDateTime(data?.created_at)} />
            <InfoRow
              label="Actualizada"
              value={formatDateTime(data?.update_at)}
            />

            <Divider />
            <SectionTitle title={`Categorías (${categories.length})`} />
            {categories.length === 0 ? (
              <EmptyHint label="Sin categorías asignadas" />
            ) : (
              categories.map((category) => (
                <InfoRow
                  key={category.category_id}
                  label={category.category_name}
                  value={category.parent_category_name ?? "Principal"}
                />
              ))
            )}

            <Divider />
            <SectionTitle title={`Productos (${products.length})`} />
            {products.length === 0 ? (
              <EmptyHint label="Sin productos asignados" />
            ) : (
              products.map((product) => (
                <View key={product.product_id} style={styles.productRow}>
                  <Text style={styles.productName}>{product.product_name}</Text>
                  <Text style={styles.productMeta}>
                    SKU: {product.product_sku} · {product.category_name}
                  </Text>
                </View>
              ))
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  productRow: { paddingVertical: 6 },
  productName: { color: "#111827", fontSize: 13, fontWeight: "500" },
  productMeta: { color: "#6b7280", fontSize: 12, marginTop: 2 },
});
