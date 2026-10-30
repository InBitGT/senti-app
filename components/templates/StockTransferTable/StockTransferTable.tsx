// StockTransferTable.tsx
import { SummaryCard } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import {
  AppSelect,
  AppSelectOption,
} from "@/components/atom/AppSelect/AppSelect";
import { FilterPill } from "@/components/atom/FilterPill/FilterPill";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  StockTransfer,
  TransferStatus,
  TransferSummary,
} from "@/src/types/stock_transfer/stock_transfer.types";
import {
  ArrowRight,
  SearchIcon,
  SlidersHorizontal,
  Undo2,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";
import { Buttons } from "../CustomTable";

type OptionalColumnKey = "qty" | "value" | "created_at";

interface OptionalColumn {
  key: OptionalColumnKey;
  label: string;
}

// Ocultas por defecto para que en mobile no se traslapen los datos.
const OPTIONAL_COLUMNS: OptionalColumn[] = [
  { key: "qty", label: "Unidades" },
  { key: "value", label: "Valor" },
  { key: "created_at", label: "Fecha" },
];

interface StatusConfig {
  color: string;
  bg: string;
}

export const TRANSFER_STATUS_CONFIG: Record<TransferStatus, StatusConfig> = {
  draft: { color: "#444441", bg: "#F1EFE8" },
  in_transit: { color: "#0C447C", bg: "#E6F1FB" },
  received: { color: "#27500A", bg: "#EAF3DE" },
  received_with_differences: { color: "#633806", bg: "#FAEEDA" },
  rejected: { color: "#791F1F", bg: "#FCEBEB" },
  cancelled: { color: "#5F5E5A", bg: "#EDEDEB" },
};

export const formatQ = (value?: number | null) =>
  `Q${(value ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatRate = (value?: number | null) =>
  value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`;

export const TransferStatusBadge = ({
  status,
  label,
}: {
  status: TransferStatus;
  label: string;
}) => {
  const cfg = TRANSFER_STATUS_CONFIG[status] ?? TRANSFER_STATUS_CONFIG.draft;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{label}</Text>
    </View>
  );
};

interface StockTransferTableProps {
  data: StockTransfer[];
  summary?: TransferSummary;
  onRowPress?: (row: StockTransfer) => void;
  /** Paginación del servidor (page empieza en 1). Sin ella no se pagina. */
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  activeStatus?: TransferStatus | null;
  onStatusChange?: (status: TransferStatus | null) => void;
  emptyLabel?: string;
  search?: string;
  onSearchChange?: (text: string) => void;
  /** Select de sucursal: solo se muestra si hay más de una opción. */
  branchOptions?: AppSelectOption[];
  branchId?: string;
  onBranchChange?: (value: string) => void;
  /** Select de vista (por recibir / historial), junto a los botones. */
  viewOptions?: AppSelectOption[];
  view?: string;
  onViewChange?: (value: string) => void;
  button?: Buttons[];
}

export function StockTransferTable({
  data,
  summary,
  onRowPress,
  page = 1,
  totalPages = 1,
  total,
  pageSize,
  onPageChange,
  activeStatus = null,
  onStatusChange,
  emptyLabel = "Sin traslados",
  search = "",
  onSearchChange,
  branchOptions = [],
  branchId,
  onBranchChange,
  viewOptions,
  view,
  onViewChange,
  button,
}: StockTransferTableProps) {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    qty: false,
    value: false,
    created_at: false,
  });

  const toggleColumn = (key: OptionalColumnKey): void => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const count = total ?? data.length;
  const from = pageSize ? (page - 1) * pageSize : 0;
  const to = from + data.length;

  return (
    <VStack style={styles.container}>
      <VStack className="mb-4 gap-2">
        {/* Solo se muestra si el usuario tiene más de una sucursal en sus claims */}
        {branchOptions.length > 1 && onBranchChange && (
          <HStack className="items-center gap-2">
            <View style={{ width: 240 }}>
              <AppSelect
                placeholder="Selecciona una sucursal"
                searchable={branchOptions.length > 6}
                options={branchOptions}
                value={branchId}
                onChange={onBranchChange}
              />
            </View>
          </HStack>
        )}

        <HStack className="justify-between items-center gap-2">
          <View className="flex-1 sm:w-64 sm:flex-none">
            {onSearchChange && (
              <AppInput
                placeholder="Buscar por número (TRF-…)"
                value={search}
                onChangeText={onSearchChange}
                leftIcon={<SearchIcon size={16} color="#9ca3af" />}
                inputStyle={{ color: "#000" }}
              />
            )}
          </View>

          <HStack className="gap-2 items-center">
            {viewOptions && onViewChange && (
              <View style={{ width: 180 }}>
                <AppSelect
                  searchable={false}
                  options={viewOptions}
                  value={view}
                  onChange={onViewChange}
                />
              </View>
            )}

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <AppButton
                  label="Columnas"
                  icon={SlidersHorizontal}
                  outline
                  outlineBorderColor="#949292"
                  outlineTextColor="#000000"
                  fullWidth={false}
                  shrinkOnMobile
                  onPress={() => setMenuVisible(true)}
                />
              }
              contentStyle={{ backgroundColor: "#ffffff" }}
            >
              {OPTIONAL_COLUMNS.map((col) => (
                <Menu.Item
                  key={col.key}
                  onPress={() => toggleColumn(col.key)}
                  title={col.label}
                  leadingIcon={() => (
                    <View style={{ transform: [{ scale: 0.8 }] }}>
                      <Checkbox
                        status={
                          visibleColumns[col.key] ? "checked" : "unchecked"
                        }
                        onPress={() => toggleColumn(col.key)}
                      />
                    </View>
                  )}
                />
              ))}
            </Menu>

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
      </VStack>

      {onStatusChange && summary && (
        <HStack style={styles.pillRow}>
          <FilterPill
            label={`Todos (${summary.total_transfers})`}
            active={activeStatus === null}
            onPress={() => onStatusChange(null)}
          />
          {summary.by_status.map((s) => {
            const cfg = TRANSFER_STATUS_CONFIG[s.status];
            return (
              <FilterPill
                key={s.status}
                label={`${s.label} (${s.total})`}
                active={activeStatus === s.status}
                color={cfg?.color}
                bg={cfg?.bg}
                onPress={() =>
                  onStatusChange(activeStatus === s.status ? null : s.status)
                }
              />
            );
          })}
        </HStack>
      )}

      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 1.4 }}>Traslado</DataTable.Title>
          <DataTable.Title style={{ flex: 3 }}>Origen → Destino</DataTable.Title>
          <DataTable.Title style={{ flex: 1.6 }}>Estado</DataTable.Title>
          {visibleColumns.qty && (
            <DataTable.Title numeric>Unidades</DataTable.Title>
          )}
          {visibleColumns.value && (
            <DataTable.Title numeric>Valor</DataTable.Title>
          )}
          {visibleColumns.created_at && (
            <DataTable.Title style={{ flex: 1.2, justifyContent: "center" }}>
              Fecha
            </DataTable.Title>
          )}
        </DataTable.Header>

        {data.length === 0 ? (
          <DataTable.Row style={styles.row}>
            <DataTable.Cell>
              <Text style={styles.muted}>{emptyLabel}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          data.map((row) => (
            <DataTable.Row
              key={row.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              <DataTable.Cell style={{ flex: 1.4, marginVertical: 10 }}>
                <View style={{ width: "100%" }}>
                  <HStack className="items-center gap-1">
                    {row.transfer_type === "return" && (
                      <Undo2 size={12} color="#633806" />
                    )}
                    <Text style={styles.docNumber} numberOfLines={1}>
                      {row.number}
                    </Text>
                  </HStack>
                  <Text style={styles.subText}>
                    {row.transfer_type === "return"
                      ? `Retorno de ${row.parent_transfer?.number ?? "—"}`
                      : `${row.totals.lines} línea(s)`}
                  </Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell style={{ flex: 3, marginVertical: 10 }}>
                <HStack className="items-center gap-2" style={{ width: "100%" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {row.origin.warehouse_name_snapshot}
                    </Text>
                    <Text style={styles.subText} numberOfLines={1}>
                      {row.origin.branch_name_snapshot}
                    </Text>
                  </View>
                  <ArrowRight size={14} color="#888" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {row.destination.warehouse_name_snapshot}
                    </Text>
                    <Text style={styles.subText} numberOfLines={1}>
                      {row.destination.branch_name_snapshot}
                    </Text>
                  </View>
                </HStack>
              </DataTable.Cell>

              <DataTable.Cell style={{ flex: 1.6 }}>
                <TransferStatusBadge
                  status={row.status}
                  label={row.status_label}
                />
              </DataTable.Cell>

              {visibleColumns.qty && (
                <DataTable.Cell numeric>
                  <Text style={styles.total}>{row.totals.qty_sent}</Text>
                </DataTable.Cell>
              )}

              {visibleColumns.value && (
                <DataTable.Cell numeric>
                  <Text style={styles.total}>
                    {formatQ(row.totals.value_sent)}
                  </Text>
                </DataTable.Cell>
              )}

              {visibleColumns.created_at && (
                <DataTable.Cell
                  style={{ flex: 1.2, justifyContent: "center" }}
                >
                  <Text style={styles.subText}>
                    {new Date(row.created_at).toLocaleDateString("es-GT")}
                  </Text>
                </DataTable.Cell>
              )}
            </DataTable.Row>
          ))
        )}

        {onPageChange && (
          <DataTable.Pagination
            page={page - 1}
            numberOfPages={Math.max(1, totalPages)}
            onPageChange={(p) => onPageChange(p + 1)}
            label={count > 0 ? `${from + 1}-${to} de ${count}` : "0 de 0"}
            numberOfItemsPerPage={pageSize}
            showFastPaginationControls
          />
        )}
      </DataTable>

      {summary && (
        <HStack style={[styles.summaryRow, { marginBottom: 12 }]}>
          <SummaryCard
            label="Traslados"
            value={String(summary.total_transfers)}
          />
          <SummaryCard label="Enviado" value={formatQ(summary.value_sent)} />
          <SummaryCard
            label="Rechazado"
            value={formatQ(summary.value_rejected)}
          />
          <SummaryCard label="Pérdida" value={formatQ(summary.value_lost)} />
          <SummaryCard
            label="Cumplimiento"
            value={formatRate(summary.compliance_rate)}
          />
        </HStack>
      )}
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
