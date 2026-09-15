// app/(drawer)/(inventory)/entry_stock_info.tsx
import { Button, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useEntryStockDetail } from "@/src/hooks/useEntryStock/useEntryStock";
import { EntryStockDetailItem } from "@/src/types/entry_stock/entry_stock.types";
import { router } from "expo-router";
import {
    ArrowLeftIcon,
    BoxIcon,
    FileTextIcon,
    PackageIcon,
    ReceiptIcon,
    TruckIcon,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Sí" : "No") : value;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(display)}</Text>
    </View>
  );
};

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardIconWrap}>
        <Icon size={14} color="#6366f1" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> =
  {
    confirmed: { bg: "#dcfce7", text: "#16a34a", label: "Confirmado" },
    pending: { bg: "#fef9c3", text: "#ca8a04", label: "Pendiente" },
    cancelled: { bg: "#fee2e2", text: "#dc2626", label: "Cancelado" },
  };

const StatusBadge = ({ status }: { status?: string }) => {
  const s = STATUS_MAP[status ?? ""] ?? {
    bg: "#f3f4f6",
    text: "#6b7280",
    label: status ?? "—",
  };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: s.text }]} />
      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
};

const formatCurrency = (value?: number) =>
  value === undefined
    ? "—"
    : `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value?: string | null, withTime = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return withTime
    ? date.toLocaleString("es-GT")
    : date.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

const ItemRow = ({ item }: { item: EntryStockDetailItem }) => (
  <View style={styles.itemRow}>
    <View style={styles.itemQtyBadge}>
      <Text style={styles.itemQtyText}>{item.quantity}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemName}>
        {item.product?.name ?? `#${item.product_id}`}
      </Text>
      {(item.product?.sku || item.product?.brand) && (
        <Text style={styles.itemMeta}>
          {[item.product?.brand, item.product?.sku].filter(Boolean).join(" · ")}
        </Text>
      )}
      {item.batch && <Text style={styles.itemMeta}>Lote: {item.batch}</Text>}
      {formatDate(item.expiration_date) && (
        <Text style={styles.itemMeta}>
          Vence: {formatDate(item.expiration_date)}
        </Text>
      )}
      {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
      <Text style={styles.itemUnitPrice}>
        {formatCurrency(item.unit_cost)} c/u · {item.unit}
      </Text>
    </View>
    <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
  </View>
);

export default function EntryStockInfoScreen() {
  const { data, isLoading } = useEntryStockDetail();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <ReceiptIcon size={32} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 8 }}>
          No se encontró el ingreso.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Button
            variant="link"
            size="sm"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ButtonIcon as={ArrowLeftIcon} color="#111827" />
          </Button>
          <Text style={styles.topBarTitle}>Detalle de ingreso</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroType}>Ingreso de inventario</Text>
            <StatusBadge status={data.entry_status} />
          </View>
          <Heading size="2xl" style={styles.heroFolio}>
            {data.document_number}
          </Heading>
          {formatDate(data.document_date) && (
            <Text style={styles.heroDate}>
              {formatDate(data.document_date)}
            </Text>
          )}
          <View style={styles.heroDivider} />
          <View style={styles.heroTotalsRow}>
            <Text style={styles.heroTotalLabel}>Total</Text>
            <Text style={styles.heroTotalMain}>
              {formatCurrency(data.total)}
            </Text>
          </View>
        </View>

        {data.items && data.items.length > 0 && (
          <SectionCard
            title={`Productos (${data.items.length})`}
            icon={PackageIcon}
          >
            {data.items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </SectionCard>
        )}

        {data.supplier && (
          <SectionCard title="Proveedor" icon={TruckIcon}>
            <InfoRow label="Nombre" value={data.supplier.name} />
            <InfoRow label="NIT" value={data.supplier.nit} />
            <InfoRow label="Teléfono" value={data.supplier.phone} />
            <InfoRow label="Email" value={data.supplier.email} />
            <InfoRow label="Contacto" value={data.supplier.contact_name} />
            <InfoRow label="Descripción" value={data.supplier.description} />
          </SectionCard>
        )}

        {data.warehouse && (
          <SectionCard title="Bodega" icon={BoxIcon}>
            <InfoRow label="Nombre" value={data.warehouse.name} />
            <InfoRow label="Código" value={data.warehouse.code} />
            <InfoRow label="Tipo" value={data.warehouse.type} />
            <InfoRow label="Predeterminada" value={data.warehouse.is_default} />
          </SectionCard>
        )}

        {data.notes && (
          <SectionCard title="Notas" icon={FileTextIcon}>
            <Text style={styles.notesText}>{data.notes}</Text>
          </SectionCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: { paddingHorizontal: 0, width: 32 },
  topBarTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  content: { padding: 16, paddingBottom: 32, gap: 12 },

  hero: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eef0f3",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroFolio: { color: "#111827", fontWeight: "700", marginTop: 4 },
  heroDate: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  heroDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 14,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  heroTotalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTotalLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  heroTotalMain: { fontSize: 22, fontWeight: "800", color: "#16a34a" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef0f3",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  label: { color: "#6b7280", fontSize: 13, flex: 1 },
  value: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "500",
    flex: 1.4,
    textAlign: "right",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  itemQtyBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    marginTop: 2,
  },
  itemQtyText: { fontSize: 12, fontWeight: "700", color: "#4b5563" },
  itemName: { color: "#111827", fontSize: 14, fontWeight: "600" },
  itemMeta: { color: "#9ca3af", fontSize: 11.5, marginTop: 2 },
  itemNotes: {
    color: "#9ca3af",
    fontSize: 11.5,
    marginTop: 2,
    fontStyle: "italic",
  },
  itemUnitPrice: { color: "#6b7280", fontSize: 12, marginTop: 4 },
  itemSubtotal: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  notesText: { color: "#374151", fontSize: 13, lineHeight: 19 },
});
