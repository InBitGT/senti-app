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
import { CustomerType } from "@/src/types/customer_type/customer_type";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: CustomerType;
  fetchId?: (id: number) => void;
}

export const ModalCustomerTypeDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  fetchId,
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
            </View>
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              <SectionTitle title="Información general" />
              <InfoRow label="Nombre" value={data?.name} />
              <InfoRow label="Descripción" value={data?.description} />

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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
});
