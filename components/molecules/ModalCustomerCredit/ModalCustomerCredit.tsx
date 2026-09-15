import { Avatar } from "@/components/atom/Avatar/Avatar";
import { Badge } from "@/components/atom/Badge/Badge";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Divider } from "@/components/atom/Divider/Divider";
import { DueDateBadge } from "@/components/atom/DueDateBadge/DueDateBadge";
import { InfoRow } from "@/components/atom/InfoRow/InfoRow";
import { SectionTitle } from "@/components/atom/SectionTitle/SectionTitle";
import { StatBox } from "@/components/atom/StatBox/StatBox";
import { UsageBar } from "@/components/atom/UsageBar/UsageBar";
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
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: CustomerCredit;
}

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
            <DesktopScrollView>
              {data && (
                <>
                  <SectionTitle title="Crédito" />

                  <View style={styles.statsRow}>
                    <StatBox
                      label="Límite"
                      value={formatCurrency(data.credit_limit)}
                      color="#111827"
                    />
                    <StatBox
                      label="Disponible"
                      value={formatCurrency(data.credit_available)}
                      color="#16a34a"
                    />
                    <StatBox
                      label="Usado"
                      value={formatCurrency(data.credit_used)}
                      color="#dc2626"
                    />
                  </View>

                  <UsageBar used={data.credit_used} limit={data.credit_limit} />

                  <Divider />

                  <SectionTitle title="Plazo de pago" />
                  <InfoRow
                    label="Días de plazo"
                    value={data.payment_term_days}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
});
