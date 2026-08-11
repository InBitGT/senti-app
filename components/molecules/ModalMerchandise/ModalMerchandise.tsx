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
import { MerchandiseListItem } from "@/src/types/merchandise/merchandise.types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: MerchandiseListItem;
}

const TYPE_LABELS: Record<string, string> = {
  storable: "Almacenable",
  ingredient: "Ingrediente",
  finished_product: "Producto terminado",
  menu_item: "Ítem de menú",
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => {
  const display =
    value === null || value === undefined
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "Sí"
          : "No"
        : value;

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

const EmptySection = ({ text }: { text: string }) => (
  <Text style={styles.emptyText}>{text}</Text>
);

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: "#dcfce7", text: "#16a34a", label: "Disponible" },
    unavailable: { bg: "#fee2e2", text: "#dc2626", label: "No disponible" },
    low_stock: { bg: "#fef9c3", text: "#ca8a04", label: "Stock bajo" },
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

const TypeBadge = ({ type }: { type?: string }) => (
  <View style={styles.typeBadge}>
    <Text style={styles.typeBadgeText}>
      {type ? (TYPE_LABELS[type] ?? type) : "—"}
    </Text>
  </View>
);

export const ModalMerchandiseDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  const product = data?.product;

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
                {product?.name ?? "—"}
              </Heading>
              <Text style={styles.sku}>SKU: {product?.sku ?? "—"}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={product?.availability_status} />
                <TypeBadge type={product?.type} />
              </View>
            </View>
          </View>
        </ModalHeader>

        <ModalBody style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <DesktopScrollView>
              {/* ── GENERAL ── */}
              <SectionTitle title="General" />
              <InfoRow label="Descripción" value={product?.description} />
              <InfoRow label="Categoría" value={product?.category_name} />
              {product?.parent_category_name && (
                <InfoRow
                  label="Categoría padre"
                  value={product.parent_category_name}
                />
              )}
              <InfoRow label="Marca" value={product?.brand} />
              <InfoRow label="Código de barras" value={product?.barcode} />
              <InfoRow
                label="Unidad de medida"
                value={product?.unit_of_measure_id}
              />
              <InfoRow
                label="Costo promedio"
                value={
                  product?.average_cost != null
                    ? `Q ${product.average_cost.toFixed(2)}`
                    : undefined
                }
              />
              <InfoRow label="Requiere lote" value={product?.requires_batch} />

              {/* ── PRECIO ── */}
              <Divider />
              <SectionTitle title="Precio" />
              {data?.price != null ? (
                <InfoRow
                  label="Precio de venta"
                  value={`${data.price.currency ?? ""} ${data.price.amount.toFixed(2)}`}
                />
              ) : (
                <EmptySection text="Este producto no tiene precio de venta definido." />
              )}

              {/* ── CONVERSIONES Y PRECIOS POR CLIENTE (resumen) ── */}
              <Divider />
              <SectionTitle title="Conversiones y precios especiales" />
              <InfoRow
                label="Conversiones de unidad"
                value={
                  data?.conversions?.length
                    ? `${data.conversions.length} configurada(s)`
                    : "Sin conversiones"
                }
              />
              <InfoRow
                label="Precios por tipo de cliente"
                value={
                  data?.customer_type_prices?.length
                    ? `${data.customer_type_prices.length} configurado(s)`
                    : "Sin precios especiales"
                }
              />

              {/* ── REGLA DE MAYOREO ── */}
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
                <EmptySection text="No aplica regla de mayoreo general." />
              )}

              {/* ── MODIFICADOR ── */}
              {product?.is_modifier && (
                <>
                  <Divider />
                  <SectionTitle title="Modificador" />
                  <InfoRow
                    label="Es modificador"
                    value={product?.is_modifier}
                  />
                  <InfoRow label="Grupo" value={product?.modifier_group} />
                  <InfoRow label="Nombre" value={product?.modifier_name} />
                  <InfoRow
                    label="Cantidad"
                    value={product?.modifier_quantity}
                  />
                  <InfoRow
                    label="Selec. mínima"
                    value={product?.modifier_min_selection}
                  />
                  <InfoRow
                    label="Selec. máxima"
                    value={product?.modifier_max_selection}
                  />
                  <InfoRow
                    label="Ajuste de precio"
                    value={
                      product?.modifier_price_adjustment != null
                        ? `Q ${product.modifier_price_adjustment.toFixed(2)}`
                        : undefined
                    }
                  />
                  <InfoRow
                    label="Por defecto"
                    value={product?.modifier_is_default}
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
  emptyText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: 8,
  },
});
