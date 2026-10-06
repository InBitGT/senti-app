import { Divider } from "@/components/atom/Divider/Divider";
import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
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
import { ServiceProduct, ServiceVariant } from "@/src/types/service/service";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export interface ModalServiceDetailProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ServiceProduct;
}

const formatCurrency = (value: number | null | undefined) =>
  value != null ? `Q ${value.toFixed(2)}` : undefined;

const formatAdjustment = (variant: ServiceVariant) =>
  variant.adjustment_type === "percentage"
    ? `${variant.price_adjustment}%`
    : formatCurrency(variant.price_adjustment);

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

export function ModalServiceDetail({
  isOpen,
  onClose,
  data,
}: ModalServiceDetailProps) {
  const { height } = useWindowDimensions();
  const bodyMaxHeight = height * 0.55;
  const product = data?.product;
  const variants = data?.variants ?? [];
  const modifiers = data?.modifiers ?? [];
  const ingredients = data?.recipe?.ingredients ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.imgBox}>
              <Text style={styles.imgText}>🛎️</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {product?.name ?? "—"}
              </Heading>
              <Text style={styles.sku}>SKU: {product?.sku ?? "—"}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={product?.availability_status} />
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>Servicio</Text>
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
            <InfoRow label="Descripción" value={product?.description} />
            <InfoRow label="Categoría" value={product?.category_name} />
            {!!product?.parent_category_name && (
              <InfoRow
                label="Categoría padre"
                value={product.parent_category_name}
              />
            )}
            <InfoRow label="Marca" value={product?.brand} />
            <InfoRow label="Código de barras" value={product?.barcode} />

            <Divider />
            <SectionTitle title="Precio" />
            {data?.price != null ? (
              <InfoRow
                label="Precio de venta"
                value={formatCurrency(data.price.amount)}
              />
            ) : (
              <EmptyHint label="Este servicio no tiene precio de venta definido." />
            )}
            <InfoRow
              label="Precios por tipo de cliente"
              value={
                data?.customer_type_prices?.length
                  ? `${data.customer_type_prices.length} configurado(s)`
                  : "Sin precios especiales"
              }
            />

            <Divider />
            <SectionTitle title="Regla de mayoreo" />
            {data?.wholesale_rule ? (
              <>
                <InfoRow
                  label="Cantidad mínima"
                  value={data.wholesale_rule.min_quantity}
                />
                <InfoRow
                  label="Descuento"
                  value={`${data.wholesale_rule.discount_percentage}%`}
                />
              </>
            ) : (
              <EmptyHint label="No aplica regla de mayoreo." />
            )}

            <Divider />
            <SectionTitle title="Variantes" />
            {variants.length > 0 ? (
              variants.map((variant) => (
                <InfoRow
                  key={variant.id}
                  label={variant.name}
                  value={formatAdjustment(variant)}
                />
              ))
            ) : (
              <EmptyHint label="Este servicio no tiene variantes." />
            )}

            <Divider />
            <SectionTitle title="Modificadores" />
            {modifiers.length > 0 ? (
              modifiers.map((modifier) => (
                <InfoRow
                  key={modifier.product_modifier_id}
                  label={modifier.name}
                  value={formatCurrency(modifier.price_adjustment)}
                />
              ))
            ) : (
              <EmptyHint label="Este servicio no tiene modificadores." />
            )}

            <Divider />
            <SectionTitle title="Receta" />
            {ingredients.length > 0 ? (
              ingredients.map((item) => (
                <InfoRow
                  key={item.id}
                  label={
                    item.variant_name
                      ? `${item.ingredient_name} (${item.variant_name})`
                      : item.ingredient_name
                  }
                  value={
                    item.waste_factor > 0
                      ? `${item.quantity} · merma ${item.waste_factor}`
                      : item.quantity
                  }
                />
              ))
            ) : (
              <EmptyHint label="Este servicio no tiene receta." />
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
