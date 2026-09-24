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

export interface EntryDetail {
  id: number;
  document_number: string;
  document_date: string;
  total: number;
  entry_status: string;
  notes?: string;
  supplier: {
    name: string;
    nit: string;
    phone: string;
    email: string;
    contact_name: string;
    description?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: EntryDetail;
  onViewDetail?: (id: number) => void;
}

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: "#dcfce7", text: "#16a34a", label: "Confirmado" },
    pending: { bg: "#fef9c3", text: "#ca8a04", label: "Pendiente" },
    cancelled: { bg: "#fee2e2", text: "#dc2626", label: "Cancelado" },
  };
  const s = map[status ?? ""] ?? {
    bg: "#f3f4f6",
    text: "#6b7280",
    label: status ?? "—",
  };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
};

export const ModalEntryDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onViewDetail,
}) => {
  const formattedDate = data?.document_date
    ? new Date(data.document_date).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleViewDetail = () => {
    if (!data?.id) return;
    onViewDetail?.(data.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Heading size="md" style={styles.docNumber}>
                {data?.document_number ?? "—"}
              </Heading>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
            <StatusBadge status={data?.entry_status} />
          </View>
        </ModalHeader>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator
        >
          <ModalBody>
            <SectionTitle title="Factura" />
            <InfoRow label="No. Documento" value={data?.document_number} />
            <InfoRow label="Fecha" value={formattedDate} />
            <InfoRow label="Total" value={`Q ${data?.total?.toFixed(2)}`} />
            <InfoRow label="Notas" value={data?.notes} />

            <Divider />

            <SectionTitle title="Proveedor" />
            <InfoRow label="Nombre" value={data?.supplier?.name} />
            <InfoRow label="NIT" value={data?.supplier?.nit} />
            <InfoRow label="Teléfono" value={data?.supplier?.phone} />
            <InfoRow label="Email" value={data?.supplier?.email} />
            <InfoRow label="Contacto" value={data?.supplier?.contact_name} />
          </ModalBody>
        </ScrollView>
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
  headerRow: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  docNumber: { color: "#111827", fontWeight: "600" },
  date: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "500" },
});
