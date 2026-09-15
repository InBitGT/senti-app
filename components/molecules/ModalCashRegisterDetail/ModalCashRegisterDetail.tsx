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
import { useAuthStore } from "@/src/store";
import { CashRegister } from "@/src/types/cash_register/cash_register";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: CashRegister;
}

const Badge = ({ active }: { active: boolean }) => (
  <View
    style={[styles.badge, { backgroundColor: active ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: active ? "#16a34a" : "#dc2626" }]}>
      {active ? "Activa" : "Inactiva"}
    </Text>
  </View>
);

export const ModalCashRegisterDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { claims } = useAuthStore();

  const warehouseName = useMemo(() => {
    if (!data) return undefined;
    for (const branch of claims?.branches ?? []) {
      const found = branch.warehouses.find(
        (w) => w.warehouse_id === data.warehouse_id,
      );
      if (found) return found.warehouse_name;
    }
    return undefined;
  }, [claims, data]);

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
              <Text style={styles.subtitle}>{data?.code}</Text>
            </View>
            <Badge active={data?.status ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              <SectionTitle title="Información general" />
              <InfoRow label="Nombre" value={data?.name} />
              <InfoRow label="Código" value={data?.code} />
              <InfoRow
                label="Bodega"
                value={warehouseName ?? `#${data?.warehouse_id}`}
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
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
});
