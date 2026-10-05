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
import { Ingredient } from "@/src/types/ingredient/ingredient";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export interface ModalIngredientDetailProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Ingredient;
}

const formatCurrency = (value: number | null | undefined) =>
  value != null ? `Q ${value.toFixed(2)}` : undefined;

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: "#dcfce7", text: "#16a34a", label: "Disponible" },
    unavailable: { bg: "#fee2e2", text: "#dc2626", label: "No disponible" },
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

export function ModalIngredientDetail({
  isOpen,
  onClose,
  data,
}: ModalIngredientDetailProps) {
  const { height } = useWindowDimensions();
  const bodyMaxHeight = height * 0.55;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.imgBox}>
              <Text style={styles.imgText}>📦</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.name ?? "—"}
              </Heading>
              <Text style={styles.sku}>SKU: {data?.sku ?? "—"}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={data?.availability_status} />
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>Ingrediente</Text>
                </View>
              </View>
            </View>
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView
            style={{ maxHeight: bodyMaxHeight }}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            <SectionTitle title="General" />
            <InfoRow label="Descripción" value={data?.description} />
            <InfoRow label="Categoría" value={data?.category_name} />
            {!!data?.parent_category_name && (
              <InfoRow
                label="Categoría padre"
                value={data.parent_category_name}
              />
            )}
            <InfoRow label="Marca" value={data?.brand} />
            <InfoRow label="Código de barras" value={data?.barcode} />
            <InfoRow
              label="Costo promedio"
              value={formatCurrency(data?.average_cost)}
            />

            <InfoRow
              label="Es modificador"
              value={data?.is_modifier ? "Sí" : "No"}
            />

            {data?.is_modifier && (
              <>
                <Divider />
                <SectionTitle title="Modificador" />
                <InfoRow label="Nombre" value={data?.modifier_name} />
                <InfoRow label="Cantidad" value={data?.modifier_quantity} />
                <InfoRow
                  label="Selec. mínima"
                  value={data?.modifier_min_selection}
                />
                <InfoRow
                  label="Selec. máxima"
                  value={data?.modifier_max_selection}
                />
                <InfoRow
                  label="Ajuste de precio"
                  value={formatCurrency(data?.modifier_price_adjustment)}
                />
                <InfoRow
                  label="Por defecto"
                  value={data?.modifier_is_default ? "Sí" : "No"}
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
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", maxHeight: "85%" },
  header: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  imgBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  imgText: { fontSize: 24 },
  name: { color: "#111827", fontWeight: "600" },
  sku: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "500" },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
  },
  typeBadgeText: { fontSize: 11, fontWeight: "500", color: "#4338ca" },
});
