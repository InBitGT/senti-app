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
import { WarehouseDetail } from "@/src/types/warehouse/warehouse.types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: WarehouseDetail;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean;
}) => {
  const display =
    typeof value === "boolean" ? (value ? "Sí" : "No") : (value ?? "—");

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(display)}</Text>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

const Avatar = ({ name }: { name: string }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
  </View>
);

const Badge = ({
  active,
  label,
}: {
  active: boolean;
  label?: [string, string];
}) => (
  <View
    style={[styles.badge, { backgroundColor: active ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: active ? "#16a34a" : "#dc2626" }]}>
      {active ? (label?.[0] ?? "Activo") : (label?.[1] ?? "Inactivo")}
    </Text>
  </View>
);

export const ModalWarehouseDetail: React.FC<Props> = ({
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
              <Text style={styles.code}>{data?.code}</Text>
            </View>
            <Badge
              active={data?.is_default ?? false}
              label={["Predeterminada", "Adicional"]}
            />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <SectionTitle title="Información general" />
            <InfoRow label="Código" value={data?.code} />
            <InfoRow label="Nombre" value={data?.name} />
            <InfoRow label="Tipo" value={data?.type} />
            <InfoRow label="Descripción" value={data?.description} />

            <Divider />

            <SectionTitle title="Sucursal" />
            <InfoRow label="Nombre" value={data?.branch?.name} />

            <Divider />

            <SectionTitle title="Configuración" />
            <InfoRow label="Por defecto" value={data?.is_default} />
            <InfoRow label="Usa zonas" value={data?.uses_zones} />

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
  avatarText: { fontSize: 20, fontWeight: "600", color: "#4338ca" },
  name: { color: "#111827", fontWeight: "600" },
  code: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
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
  label: { color: "#6b7280", fontSize: 13, flex: 1 },
  value: { color: "#111827", fontSize: 13, flex: 1.5, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 12 },
});
