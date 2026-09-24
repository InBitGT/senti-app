import { AmountBox } from "@/components/atom/AmountBox/AmountBox";
import { Avatar } from "@/components/atom/Avatar/Avatar";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Divider } from "@/components/atom/Divider/Divider";
import { InfoRow } from "@/components/atom/InfoRow/InfoRow";
import { MovementBadge } from "@/components/atom/MovementBadge/MovementBadge";
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
import { CustomerCreditMovement } from "@/src/types/movement_credit/movement_credit";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: CustomerCreditMovement;
}

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
  name: { color: "#111827", fontWeight: "600" },
  subtitle: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
});
