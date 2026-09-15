// app/invoices_info.tsx
import { Button, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useFiscalDocumentDetail } from "@/src/hooks/useFicalDocument/useFicalDocument";
import { useFiscalDocumentStore } from "@/src/store/useFiscalDocumentStore/useFiscalDocumentStore";
import {
  DOCUMENT_TYPE_LABELS,
  FiscalDocumentItem,
} from "@/src/types/fiscal_document/fiscal_document";
import { router } from "expo-router";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  PackageIcon,
  ReceiptIcon,
  UserIcon,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString("es-GT");
};

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

const StatusBadge = ({ status }: { status: string }) => {
  const isVoided = status === "voided";
  const isPending = status === "pending";
  const bg = isVoided ? "#fee2e2" : isPending ? "#fef9c3" : "#dcfce7";
  const color = isVoided ? "#dc2626" : isPending ? "#a16207" : "#16a34a";
  const label = isVoided ? "Anulado" : isPending ? "Pendiente" : "Emitido";

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ItemRow = ({ item }: { item: FiscalDocumentItem }) => (
  <View style={styles.itemRow}>
    <View style={styles.itemQtyBadge}>
      <Text style={styles.itemQtyText}>{item.quantity}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemName}>{item.product_name}</Text>
      {(item.variant_name || item.category_name) && (
        <Text style={styles.itemMeta}>
          {[item.variant_name, item.category_name].filter(Boolean).join(" · ")}
        </Text>
      )}
      {item.notes && <Text style={styles.itemNotes}>“{item.notes}”</Text>}
      <Text style={styles.itemUnitPrice}>
        {formatCurrency(item.unit_price)} c/u
        {item.discount > 0
          ? `  ·  -${formatCurrency(item.discount)} desc.`
          : ""}
      </Text>
    </View>
    <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
  </View>
);

export default function InvoicesInfoScreen() {
  const { selectedId } = useFiscalDocumentStore();
  const { data, isLoading } = useFiscalDocumentDetail(selectedId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!data || selectedId === null) {
    return (
      <SafeAreaView style={styles.center}>
        <ReceiptIcon size={32} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 8 }}>
          No se encontró el documento.
        </Text>
      </SafeAreaView>
    );
  }

  const isVoided = data.document_status === "voided";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Button
          variant="link"
          size="sm"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ButtonIcon as={ArrowLeftIcon} color="#111827" />
        </Button>
        <Text style={styles.topBarTitle}>Detalle del documento</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: tipo, folio, total */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroType}>
              {DOCUMENT_TYPE_LABELS[data.document_type] ?? data.document_type}
            </Text>
            <StatusBadge status={data.document_status} />
          </View>
          <Heading size="2xl" style={styles.heroFolio}>
            {data.series}-{data.number}
          </Heading>
          <View style={styles.heroDivider} />
          <View style={styles.heroTotalsRow}>
            <View>
              <Text style={styles.heroTotalLabel}>Subtotal</Text>
              <Text style={styles.heroTotalSub}>
                {formatCurrency(data.subtotal)}
              </Text>
            </View>
            <View>
              <Text style={styles.heroTotalLabel}>IVA</Text>
              <Text style={styles.heroTotalSub}>
                {formatCurrency(data.iva)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heroTotalLabel}>Total</Text>
              <Text
                style={[
                  styles.heroTotalMain,
                  { color: isVoided ? "#dc2626" : "#16a34a" },
                ]}
              >
                {formatCurrency(data.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Productos */}
        {data.items && data.items.length > 0 && (
          <SectionCard
            title={`Productos (${data.items.length})`}
            icon={PackageIcon}
          >
            {data.items.map((item, index) => (
              <ItemRow key={`${item.product_id}-${index}`} item={item} />
            ))}
          </SectionCard>
        )}

        {/* Cliente */}
        <SectionCard title="Cliente" icon={UserIcon}>
          <InfoRow label="Nombre" value={data.customer_name} />
          <InfoRow label="NIT" value={data.customer_nit} />
        </SectionCard>

        <SectionCard title="Documento" icon={BuildingIcon}>
          <InfoRow label="Serie" value={data.series} />
          <InfoRow label="Número" value={data.number} />
          <InfoRow label="Orden asociada" value={data.order_id} />
          {formatDate(data.issued_at) && (
            <InfoRow label="Emitido" value={formatDate(data.issued_at)!} />
          )}
          {isVoided && formatDate(data.voided_at) && (
            <InfoRow label="Anulado" value={formatDate(data.voided_at)!} />
          )}
        </SectionCard>

        {/* Atendido por — solo si el backend lo manda */}
        {(data.user_first_name || data.user_last_name) && (
          <SectionCard title="Atendido por" icon={UserIcon}>
            <InfoRow
              label="Usuario"
              value={[data.user_first_name, data.user_last_name]
                .filter(Boolean)
                .join(" ")}
            />
          </SectionCard>
        )}

        {/* Registro — solo se muestra si al menos un campo viene con fecha válida */}
        {(formatDate(data.created_at) || formatDate(data.update_at)) && (
          <SectionCard title="Registro" icon={CalendarIcon}>
            {formatDate(data.created_at) && (
              <InfoRow label="Creado" value={formatDate(data.created_at)!} />
            )}
            {formatDate(data.update_at) && (
              <InfoRow
                label="Actualizado"
                value={formatDate(data.update_at)!}
              />
            )}
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
  heroDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 14,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  heroTotalsRow: { flexDirection: "row", justifyContent: "space-between" },
  heroTotalLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  heroTotalSub: { fontSize: 14, fontWeight: "600", color: "#374151" },
  heroTotalMain: { fontSize: 20, fontWeight: "800" },

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
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

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
});
