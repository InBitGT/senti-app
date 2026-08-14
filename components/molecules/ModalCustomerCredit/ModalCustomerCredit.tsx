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
import { CustomerCredit } from "@/src/types/credit/credit";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: CustomerCredit;
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
  labels = ["Con crédito", "Sin crédito"],
}: {
  active: boolean;
  labels?: [string, string];
}) => (
  <View
    style={[styles.badge, { backgroundColor: active ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: active ? "#16a34a" : "#dc2626" }]}>
      {active ? labels[0] : labels[1]}
    </Text>
  </View>
);

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Días entre hoy y credit_due_date. Positivo = faltan días, negativo = ya venció.
const getDaysRemaining = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

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

const UsageBar = ({ used, limit }: { used: number; limit: number }) => {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 90 ? "#dc2626" : pct >= 60 ? "#d97706" : "#16a34a";

  return (
    <View style={{ marginTop: 4, marginBottom: 4 }}>
      <View style={styles.usageTrack}>
        <View
          style={[
            styles.usageFill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
        {pct}% del límite utilizado
      </Text>
    </View>
  );
};

const DueDateBadge = ({ dueDate }: { dueDate: string }) => {
  const days = getDaysRemaining(dueDate);
  const isOverdue = days < 0;
  const isSoon = days >= 0 && days <= 5;

  const bg = isOverdue ? "#fee2e2" : isSoon ? "#fef9c3" : "#dcfce7";
  const color = isOverdue ? "#dc2626" : isSoon ? "#a16207" : "#16a34a";
  const label = isOverdue
    ? `Vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`
    : days === 0
      ? "Vence hoy"
      : `Faltan ${days} día${days === 1 ? "" : "s"}`;

  return (
    <View
      style={[styles.badge, { backgroundColor: bg, alignSelf: "flex-start" }]}
    >
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

export const ModalCustomerCreditDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  const hasDueDate = Boolean(data?.credit_due_date);

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
                {data?.customer?.customer_type?.name}
              </Text>
            </View>
            <Badge active={data?.has_credit ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            {data && (
              <>
                <SectionTitle title="Crédito" />

                <View style={styles.statsRow}>
                  <StatBox
                    label="Límite"
                    value={formatCurrency(data.credit_limit)}
                    color="#111827"
                  />
                  {hasDueDate && (
                    <>
                      <InfoRow
                        label="Fecha límite"
                        value={new Date(
                          data.credit_due_date as string,
                        ).toLocaleDateString("es-GT")}
                      />
                      <View style={{ marginTop: 6 }}>
                        <DueDateBadge
                          dueDate={data.credit_due_date as string}
                        />
                      </View>
                    </>
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
                </View>

                <UsageBar used={data.credit_used} limit={data.credit_limit} />

                <Divider />

                <SectionTitle title="Plazo de pago" />
                <InfoRow label="Días de plazo" value={data.payment_term_days} />
                <InfoRow
                  label="Fecha límite"
                  value={new Date(data.credit_due_date).toLocaleDateString(
                    "es-GT",
                  )}
                />
                <View style={{ marginTop: 6 }}>
                  <DueDateBadge dueDate={data.credit_due_date} />
                </View>

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
                <InfoRow label="Email" value={data.customer?.email} />

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
  usageTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  usageFill: { height: 8, borderRadius: 4 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  statBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "700" },
});
