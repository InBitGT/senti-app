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
import { CustomerCreditMovement } from "@/src/types/movement_credit/movement_credit";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: CustomerCreditMovement;
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

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MovementBadge = ({ type }: { type: string }) => {
  const isCharge = type === "charge";
  const bg = isCharge ? "#fee2e2" : "#dcfce7";
  const color = isCharge ? "#dc2626" : "#16a34a";
  const label = isCharge ? "Cargo" : "Pago";

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const AmountBox = ({
  movementType,
  amount,
  balanceAfter,
}: {
  movementType: string;
  amount: number;
  balanceAfter: number;
}) => {
  const isCharge = movementType === "charge";
  const color = isCharge ? "#dc2626" : "#16a34a";

  return (
    <View style={styles.amountBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{isCharge ? "Cargo" : "Pago"}</Text>
        <Text style={[styles.amountValue, { color }]}>
          {isCharge ? "+" : "-"}
          {formatCurrency(amount)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>Saldo después</Text>
        <Text style={styles.amountValue}>{formatCurrency(balanceAfter)}</Text>
      </View>
    </View>
  );
};

export const ModalCustomerCreditMovementDetail: React.FC<Props> = ({
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
            <Avatar name={data?.customer?.name ?? "?"} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.customer?.name || "—"}
              </Heading>
              <Text style={styles.subtitle}>
                {data?.created_at
                  ? new Date(data.created_at).toLocaleString("es-GT")
                  : "—"}
              </Text>
            </View>
            {data && <MovementBadge type={data.movement_type} />}
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              {data && (
                <>
                  <SectionTitle title="Movimiento" />
                  <AmountBox
                    movementType={data.movement_type}
                    amount={data.amount}
                    balanceAfter={data.balance_after}
                  />
                  <InfoRow
                    label="Descripción"
                    value={data.description ?? "—"}
                  />
                  <InfoRow
                    label="Orden asociada"
                    value={data.order_id ?? "—"}
                  />
                  <InfoRow
                    label="Ajuste manual (override)"
                    value={data.is_override}
                  />
                  {data.is_override && (
                    <InfoRow
                      label="Autorizado por"
                      value={data.authorized_by ?? "—"}
                    />
                  )}
                  {data.payment_term_days !== null && (
                    <InfoRow
                      label="Nuevo plazo acordado (días)"
                      value={data.payment_term_days}
                    />
                  )}

                  <Divider />

                  <SectionTitle title="Cliente" />
                  <InfoRow label="Nombre" value={data.customer?.name} />
                  <InfoRow
                    label="Documento"
                    value={
                      data.customer
                        ? `${data.customer.document_type} ${data.customer.document_number}`
                        : "—"
                    }
                  />
                  <InfoRow label="Teléfono" value={data.customer?.phone} />

                  <Divider />

                  <SectionTitle title="Registrado por" />
                  <InfoRow
                    label="Nombre"
                    value={`${data.user?.first_name} ${data.user?.last_name}`}
                  />
                  <InfoRow label="Usuario" value={data.user?.username} />
                  <InfoRow label="Rol" value={data.user?.role_name} />

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
  amountBox: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    gap: 8,
  },
  statLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  amountValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
});
