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
import {
  DOCUMENT_TYPE_LABELS,
  FiscalDocument,
} from "@/src/types/fiscal_document/fiscal_document";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: FiscalDocument;
  onViewDetail?: (id: number) => void;
}

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

export const ModalFiscalDocumentDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onViewDetail,
}) => {
  const handleViewDetail = () => {
    if (!data?.id) return;
    onViewDetail?.(data.id);
  };

  const userFullName = data
    ? `${data.user_first_name ?? ""} ${data.user_last_name ?? ""}`.trim() || "—"
    : "—";

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
            <DesktopScrollView>
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
                  <InfoRow
                    label="Registro activo"
                    value={data.status ? "Sí" : "No"}
                  />

                  <Divider />

                  <SectionTitle title="Emisión" />
                  <InfoRow label="Sucursal" value={data.branch_name || "—"} />
                  <InfoRow label="Emitido por" value={userFullName} />

                  {data.items && data.items.length > 0 && (
                    <>
                      <Divider />

                      <SectionTitle title={`Ítems (${data.items.length})`} />
                      {data.items.map((item, index) => (
                        <View
                          key={`${item.product_id}-${index}`}
                          style={[
                            styles.itemRow,
                            index === data.items!.length - 1 && {
                              borderBottomWidth: 0,
                            },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>
                              {item.product_name}
                              {item.variant_name
                                ? ` · ${item.variant_name}`
                                : ""}
                            </Text>
                            {item.category_name && (
                              <Text style={styles.itemCategory}>
                                {item.category_name}
                              </Text>
                            )}
                            <Text style={styles.itemMeta}>
                              {item.quantity} x{" "}
                              {formatCurrency(item.unit_price)}
                            </Text>
                            {item.discount > 0 && (
                              <Text style={styles.itemDiscount}>
                                Descuento: -{formatCurrency(item.discount)}
                              </Text>
                            )}
                            {item.notes && (
                              <Text style={styles.itemNotes}>{item.notes}</Text>
                            )}
                          </View>
                          <Text style={styles.itemTotal}>
                            {formatCurrency(item.subtotal)}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </>
              )}
            </DesktopScrollView>
          </ScrollView>
        </ModalBody>

        <ModalFooter>
          <Button variant="solid" size="sm" onPress={handleViewDetail}>
            <ButtonText>Ver detalle</ButtonText>
          </Button>
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
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 8,
  },
  itemName: { fontSize: 13, color: "#111827", fontWeight: "500" },
  itemCategory: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  itemMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  itemDiscount: { fontSize: 12, color: "#dc2626", marginTop: 2 },
  itemNotes: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 2,
  },
  itemTotal: { fontSize: 13, fontWeight: "600", color: "#111827" },
});
