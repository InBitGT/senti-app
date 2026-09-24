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
import { WarehouseZone } from "@/src/types/warehouse_zone/warehouse_zone";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: WarehouseZone;
}

const ZONE_TYPE_LABELS: Record<string, string> = {
  zone: "Zona",
  aisle: "Pasillo",
  shelf: "Estante",
  rack: "Rack",
  bin: "Contenedor",
};

export const ModalWarehouseZoneDetail: React.FC<Props> = ({
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
                {data?.name || "—"}
              </Heading>
              <Text style={styles.code}>{data?.code}</Text>
            </View>
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              <SectionTitle title="Información general" />
              <InfoRow label="Nombre" value={data?.name} />
              <InfoRow label="Código" value={data?.code} />
              <InfoRow
                label="Tipo"
                value={
                  data
                    ? (ZONE_TYPE_LABELS[data.zone_type] ?? data.zone_type)
                    : "—"
                }
              />

              <Divider />

              <SectionTitle title="Jerarquía" />
              {data?.parent_zone ? (
                <>
                  <InfoRow label="Zona padre" value={data.parent_zone.name} />
                  <InfoRow label="Código padre" value={data.parent_zone.code} />
                  <InfoRow
                    label="Tipo padre"
                    value={
                      ZONE_TYPE_LABELS[data.parent_zone.zone_type] ??
                      data.parent_zone.zone_type
                    }
                  />
                </>
              ) : (
                <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                  Es una zona raíz (sin zona padre).
                </Text>
              )}

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
  code: { color: "#6b7280", fontSize: 13, marginTop: 2 },
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
});
