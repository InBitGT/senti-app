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
import { ProductWholesaleRule } from "@/src/types/wholesale/wholesale";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: ProductWholesaleRule;
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

const Badge = ({ active }: { active: boolean }) => (
  <View
    style={[styles.badge, { backgroundColor: active ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: active ? "#16a34a" : "#dc2626" }]}>
      {active ? "Activo" : "Inactivo"}
    </Text>
  </View>
);

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

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
            <Avatar name={data?.product?.name ?? "?"} />
            <View style={{ marginLeft: 12, flex: 1 }}>
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
  subtitle: { color: "#6b7280", fontSize: 13, marginTop: 2 },
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
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: "700" },
});
