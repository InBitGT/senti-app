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
import {
    DOCUMENT_TYPE_LABELS,
    FiscalDocument,
} from "@/src/types/fiscal_document/fiscal_document";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: FiscalDocument;
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

const StatusBadge = ({ status }: { status: string }) => {
  const isVoided = status === "voided";
  const isPending = status === "pending";
  const bg = isVoided ? "#fee2e2" : isPending ? "#fef9c3" : "#dcfce7";
  const color = isVoided ? "#dc2626" : isPending ? "#a16207" : "#16a34a";
  const label = isVoided ? "Anulado" : isPending ? "Pendiente" : "Emitido";

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ModalFiscalDocumentDetail: React.FC<Props> = ({
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
                {data?.series}-{data?.number}
              </Heading>
              <Text style={styles.subtitle}>
                {data
                  ? (DOCUMENT_TYPE_LABELS[data.document_type] ??
                    data.document_type)
                  : "—"}
              </Text>
            </View>
            {data && <StatusBadge status={data.document_status} />}
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            {data && (
              <>
                <SectionTitle title="Totales" />
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Subtotal</Text>
                    <Text style={styles.statValue}>
                      {formatCurrency(data.subtotal)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>IVA</Text>
                    <Text style={styles.statValue}>
                      {formatCurrency(data.iva)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={[styles.statValue, { color: "#16a34a" }]}>
                      {formatCurrency(data.total)}
                    </Text>
                  </View>
                </View>

                <Divider />

                <SectionTitle title="Cliente" />
                <InfoRow label="Nombre" value={data.customer_name} />
                <InfoRow label="NIT" value={data.customer_nit} />

                <Divider />

                <SectionTitle title="Documento" />
                <InfoRow label="Serie" value={data.series} />
                <InfoRow label="Número" value={data.number} />
                <InfoRow label="Orden asociada" value={data.order_id} />
                <InfoRow
                  label="Emitido"
                  value={new Date(data.issued_at).toLocaleString("es-GT")}
                />
                {data.document_status === "voided" && (
                  <InfoRow
                    label="Anulado"
                    value={
                      data.voided_at
                        ? new Date(data.voided_at).toLocaleString("es-GT")
                        : "—"
                    }
                  />
                )}

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
  statValue: { fontSize: 14, fontWeight: "700", color: "#111827" },
});
