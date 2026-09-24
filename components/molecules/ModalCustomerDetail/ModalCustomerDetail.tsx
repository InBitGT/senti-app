import { Avatar } from "@/components/atom/Avatar/Avatar";
import { Badge } from "@/components/atom/Badge/Badge";
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
import { Customer } from "@/src/types/customer/customer";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: Customer;
}

export const ModalCustomerDetail: React.FC<Props> = ({
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
            <Avatar name={data?.name ?? "?"} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.name || "—"}
              </Heading>
              <Text style={styles.subtitle}>{data?.customer_type?.name}</Text>
            </View>
            <Badge active={data?.status ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              <SectionTitle title="Información personal" />
              <InfoRow label="Nombre" value={data?.name} />
              <InfoRow label="Teléfono" value={data?.phone} />
              <InfoRow label="Email" value={data?.email} />
              <InfoRow label="Dirección" value={data?.address} />

              <Divider />

              <SectionTitle title="Documento" />
              <InfoRow label="Tipo" value={data?.document_type} />
              <InfoRow label="Número" value={data?.document_number} />

              <Divider />

              <SectionTitle title="Tipo de cliente" />
              <InfoRow label="Nombre" value={data?.customer_type?.name} />
              <InfoRow
                label="Descripción"
                value={data?.customer_type?.description}
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
});
