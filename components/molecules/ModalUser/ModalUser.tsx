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
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  two_fa_enabled: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: number;
    name: string;
    description: string;
    status: boolean;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: UserDetail;
}

export const ModalUserDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const fullName = data ? `${data.first_name} ${data.last_name}` : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <Avatar name={data?.first_name ?? "?"} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {fullName || "—"}
              </Heading>
              <Text style={styles.username}>@{data?.username}</Text>
            </View>
            <Badge active={data?.is_active ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              <SectionTitle title="Información personal" />
              <InfoRow label="Nombre" value={fullName} />
              <InfoRow label="Usuario" value={data?.username} />
              <InfoRow label="Email" value={data?.email} />
              <InfoRow label="Teléfono" value={data?.phone} />

              <Divider />

              <SectionTitle title="Rol" />
              <InfoRow label="Nombre" value={data?.role?.name} />
              <InfoRow label="Descripción" value={data?.role?.description} />

              <Divider />

              <SectionTitle title="Dirección" />
              <InfoRow label="Línea 1" value={data?.address?.line1} />
              <InfoRow label="Línea 2" value={data?.address?.line2} />
              <InfoRow label="Ciudad" value={data?.address?.city} />
              <InfoRow label="Depto." value={data?.address?.state} />
              <InfoRow label="País" value={data?.address?.country} />
              <InfoRow label="C. Postal" value={data?.address?.postal_code} />

              <Divider />

              <SectionTitle title="Seguridad" />
              <InfoRow label="2FA habilitado" value={data?.two_fa_enabled} />
              <InfoRow label="Cuenta activa" value={data?.is_active} />

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
                  data?.updated_at
                    ? new Date(data.updated_at).toLocaleString("es-GT")
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: "#111827", fontWeight: "600" },
  username: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
});
