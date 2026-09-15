import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Divider } from "@/components/atom/Divider/Divider";
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
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { formatDateTime } from "@/src/utils/formatDateTime/formatDateTime";
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

const StatusBadge = ({ status }: { status?: boolean }) => (
  <View
    style={[styles.badge, { backgroundColor: status ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: status ? "#16a34a" : "#dc2626" }]}>
      {status ? "Activo" : "Inactivo"}
    </Text>
  </View>
);

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
            <DesktopScrollView>
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

              <Divider />

              <SectionTitle title="Metadatos" />
              <InfoRow label="ID" value={data?.id} />
              <InfoRow label="Tenant" value={data?.tenant_id} />
              <InfoRow
                label="Creado"
                value={formatDateTime(data?.created_at)}
              />
              <InfoRow
                label="Actualizado"
                value={formatDateTime(data?.update_at)}
              />
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
});
