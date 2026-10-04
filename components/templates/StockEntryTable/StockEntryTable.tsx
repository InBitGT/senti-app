// StockEntryTable.tsx
import { Action, ActionsMenu, SummaryCard } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { FilterPill } from "@/components/atom/FilterPill/FilterPill";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  EntryStatus,
  StockEntry,
} from "@/src/types/entry_stock/entry_stock.types";
import { SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { DataTable } from "react-native-paper";
import { Buttons } from "../CustomTable";

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}

const STATUS_CONFIG: Record<EntryStatus, StatusConfig> = {
  confirmed: { label: "Confirmado", color: "#27500A", bg: "#EAF3DE" },
  pending: { label: "Pendiente", color: "#633806", bg: "#FAEEDA" },
  cancelled: { label: "Cancelado", color: "#791F1F", bg: "#FCEBEB" },
};

// Orden de los filtros; tipado sin necesidad de casts sobre Object.entries.
const STATUS_ORDER: EntryStatus[] = ["confirmed", "pending", "cancelled"];

interface StockEntryTableProps {
  data: StockEntry[];
  onRowPress?: (row: StockEntry) => void;
  itemsPerPage?: number;
  button?: Buttons[];
  actions?: Action<StockEntry>[];
}

export function StockEntryTable({
  data,
  onRowPress,
  itemsPerPage = 8,
  button,
  actions,
}: StockEntryTableProps) {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [activeStatus, setActiveStatus] = useState<EntryStatus | null>(null);

  const hasActions = actions !== undefined && actions.length > 0;

  // Los filtros reinician la página en el mismo evento,
  // en lugar de hacerlo dentro de un useEffect.
  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const handleStatusChange = (status: EntryStatus | null): void => {
    setActiveStatus(status);
    setPage(0);
  };

  const validData = useMemo<StockEntry[]>(
    () => data.filter((r) => r?.id != null),
    [data],
  );

  const countByStatus = useMemo<Partial<Record<EntryStatus, number>>>(() => {
    const map: Partial<Record<EntryStatus, number>> = {};
    validData.forEach((r) => {
      map[r.entry_status] = (map[r.entry_status] ?? 0) + 1;
    });
    return map;
  }, [validData]);

  const filtered = useMemo<StockEntry[]>(() => {
    let rows = validData;

    if (activeStatus) {
      rows = rows.filter((r) => r.entry_status === activeStatus);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.document_number.toLowerCase().includes(term) ||
          r.supplier.name.toLowerCase().includes(term) ||
          r.warehouse.name.toLowerCase().includes(term) ||
          (r.notes ?? "").toLowerCase().includes(term),
      );
    }

    return rows;
  }, [validData, activeStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  // Valor derivado: si los datos cambian desde el padre y la página queda
  // fuera de rango, se ajusta sin necesidad de un efecto.
  const safePage = Math.min(page, totalPages - 1);
  const from = safePage * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filtered.length);
  const paginated = filtered.slice(from, to);

  const summary = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let totalAmount = 0;
    filtered.forEach((r) => {
      if (r.entry_status === "confirmed") confirmed += 1;
      if (r.entry_status === "pending") pending += 1;
      totalAmount += r.total;
    });
    return { confirmed, pending, totalAmount };
  }, [filtered]);

  return (
    <VStack style={styles.container}>
      <HStack className="justify-between items-center mb-4">
        <View style={{ flex: 1, marginRight: button?.length ? 12 : 0 }}>
          <AppInput
            placeholder="Buscar documento, proveedor, bodega…"
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        <HStack className="gap-3">
          {button?.map((btn, index) => (
            <AppButton
              key={btn.key ?? `btn-${index}`}
              label={btn.name}
              icon={btn.icon}
              variant="black"
              outline
              fullWidth={false}
              onPress={btn.onPress}
              shrinkOnMobile
            />
          ))}
        </HStack>
      </HStack>

      <HStack style={styles.pillRow}>
        <FilterPill
          label={`Todos (${validData.length})`}
          active={activeStatus === null}
          onPress={() => handleStatusChange(null)}
        />
        {STATUS_ORDER.map((status) => {
          const count = countByStatus[status];
          if (!count) return null;
          const cfg = STATUS_CONFIG[status];
          return (
            <FilterPill
              key={status}
              label={`${cfg.label} (${count})`}
              active={activeStatus === status}
              color={cfg.color}
              bg={cfg.bg}
              onPress={() =>
                handleStatusChange(activeStatus === status ? null : status)
              }
            />
          );
        })}
      </HStack>

      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 1.5 }}>Documento</DataTable.Title>
          <DataTable.Title style={{ flex: 2 }}>Proveedor</DataTable.Title>
          <DataTable.Title style={{ flex: 2 }}>Bodega</DataTable.Title>
          <DataTable.Title numeric style={{ justifyContent: "center" }}>
            Total
          </DataTable.Title>
          <DataTable.Title style={{ flex: 1.5, justifyContent: "center" }}>
            Fecha
          </DataTable.Title>
          {hasActions && (
            <DataTable.Title style={{ marginLeft: 10 }}>
              Acciones
            </DataTable.Title>
          )}
        </DataTable.Header>

        {paginated.length === 0 ? (
          <DataTable.Row style={styles.row}>
            <DataTable.Cell>
              <Text style={styles.muted}>Sin ingresos</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => (
            <DataTable.Row
              key={row.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              <DataTable.Cell style={{ flex: 1.5, marginVertical: 10 }}>
                <View style={{ width: "100%" }}>
                  <Text style={styles.docNumber} numberOfLines={1}>
                    {row.document_number}
                  </Text>
                  <Text style={styles.subText}>#{row.id}</Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                <View style={{ width: "100%" }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.supplier.name}
                  </Text>
                  <Text style={styles.subText} numberOfLines={1}>
                    {row.supplier.contact_name}
                  </Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                <View style={{ width: "100%" }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.warehouse.name}
                  </Text>
                  <Text style={styles.subText} numberOfLines={1}>
                    {row.warehouse.type}
                  </Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                <Text style={styles.total}>Q{row.total.toFixed(2)}</Text>
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  flex: 1.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.subText}>
                  {new Date(row.document_date).toLocaleDateString("es-GT")}
                </Text>
              </DataTable.Cell>

              {hasActions && (
                <DataTable.Cell>
                  <ActionsMenu row={row} actions={actions ?? []} />
                </DataTable.Cell>
              )}
            </DataTable.Row>
          ))
        )}

        <DataTable.Pagination
          page={safePage}
          numberOfPages={totalPages}
          onPageChange={setPage}
          label={
            filtered.length > 0
              ? `${from + 1}-${to} de ${filtered.length}`
              : "0 de 0"
          }
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>

      <HStack style={[styles.summaryRow, { marginBottom: 12 }]}>
        <SummaryCard label="Ingresos" value={String(filtered.length)} />
        <SummaryCard label="Confirmados" value={String(summary.confirmed)} />
        <SummaryCard label="Pendientes" value={String(summary.pending)} />
        <SummaryCard
          label="Total"
          value={`Q${summary.totalAmount.toFixed(2)}`}
        />
      </HStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
  pillRow: { flexWrap: "wrap", gap: 6, marginBottom: 12 },

  table: {
    backgroundColor: "#fff",
    borderColor: "#d4d4d4",
    borderWidth: 0.5,
    borderRadius: 15,
    marginBottom: 12,
  },
  headerRow: { borderBottomWidth: 0.5, borderBottomColor: "#d4d4d4" },
  row: { borderBottomWidth: 0.5, borderBottomColor: "#d4d4d4", minHeight: 64 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "500" },
  docNumber: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  productName: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  subText: { fontSize: 11, color: "#888" },
  total: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  muted: { fontSize: 13, color: "#aaa" },
  summaryRow: { gap: 8, flexWrap: "wrap" },
});
