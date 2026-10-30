import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFiscalDocument } from "@/src/hooks/useFicalDocument/useFicalDocument";
import { useAuthStore } from "@/src/store";
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_LABELS,
  FiscalDocument,
} from "@/src/types/fiscal_document/fiscal_document";
import { SearchIcon, SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

export interface FiscalDocumentsTableProps {
  itemsPerPage?: number;
  onRowPress?: (row: FiscalDocument) => void;
}

interface BranchOption {
  id: number;
  label: string;
}

interface SelectOption {
  label: string;
  value: string;
}

type OptionalColumnKey = "type" | "issued_at";

interface OptionalColumn {
  key: OptionalColumnKey;
  label: string;
}

type ColumnFlexKey =
  | "document"
  | "type"
  | "customer"
  | "status"
  | "total"
  | "issuedAt";

const formatCurrency = (value: number): string =>
  `Q${value.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface StatusBadgeProps {
  status: FiscalDocument["document_status"];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const isVoided = status === "voided";
  const isPending = status === "pending";
  const bg = isVoided ? "#fee2e2" : isPending ? "#fef9c3" : "#dcfce7";
  const color = isVoided ? "#dc2626" : isPending ? "#a16207" : "#16a34a";
  const label = isVoided ? "Anulado" : isPending ? "Pendiente" : "Emitido";

  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: "center",
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: "500" }}>{label}</Text>
    </View>
  );
};

const OPTIONAL_COLUMNS: OptionalColumn[] = [
  { key: "type", label: "Tipo" },
  { key: "issued_at", label: "Emitido" },
];

// Flex relativo de cada columna para que ningún contenido se salga de la tabla.
const COLUMN_FLEX: Record<ColumnFlexKey, number> = {
  document: 1,
  type: 1,
  customer: 1.6,
  status: 1,
  total: 1,
  issuedAt: 1,
};

const STATUS_SELECT_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "" },
  ...DOCUMENT_STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
];

const tableStyle: ViewStyle = {
  backgroundColor: "#ffffff",
  borderColor: "#d4d4d4",
  borderWidth: 0.5,
  borderRadius: 15,
  marginTop: 15,
};

const rowBorder: ViewStyle = {
  borderBottomWidth: 0.5,
  borderBottomColor: "#d4d4d4",
};

export function FiscalDocumentsTable({
  itemsPerPage = 5,
  onRowPress,
}: FiscalDocumentsTableProps) {
  const { claims } = useAuthStore();

  const branchOptions = useMemo<BranchOption[]>(() => {
    if (!claims?.branches) return [];
    return claims.branches.map((b) => ({
      id: b.branch_id,
      label: b.branch_name,
    }));
  }, [claims]);

  const branchSelectOptions = useMemo<SelectOption[]>(
    () => branchOptions.map((b) => ({ label: b.label, value: String(b.id) })),
    [branchOptions],
  );

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    type: false,
    issued_at: false,
  });

  // Sucursal efectiva derivada: si el usuario no ha elegido una (o la elegida
  // ya no está en sus claims), se usa la primera disponible. Así no hace falta
  // un efecto para "auto-seleccionar" la sucursal.
  const effectiveBranchId = useMemo<string>(() => {
    const isValidSelection = branchSelectOptions.some(
      (o) => o.value === selectedBranchId,
    );
    if (selectedBranchId && isValidSelection) return selectedBranchId;
    return branchSelectOptions[0]?.value ?? "";
  }, [branchSelectOptions, selectedBranchId]);

  const { data, isLoading } = useFiscalDocument(effectiveBranchId);

  const toggleColumn = (key: OptionalColumnKey): void => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Cada cambio de filtro reinicia la página en el mismo evento,
  // en lugar de hacerlo dentro de un useEffect.
  const handleBranchChange = (value: string): void => {
    setSelectedBranchId(value);
    setPage(0);
  };

  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const handleStatusChange = (value: string): void => {
    setStatusFilter(value);
    setPage(0);
  };

  const filteredData = useMemo<FiscalDocument[]>(() => {
    let result: FiscalDocument[] = data ?? [];

    if (statusFilter) {
      result = result.filter((item) => item.document_status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((item) =>
        [item.number, item.customer_name, item.customer_nit].some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    return result;
  }, [data, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  // Valor derivado: si los datos cambian y la página queda fuera de rango,
  // se ajusta sin necesidad de un efecto.
  const safePage = Math.min(page, totalPages - 1);
  const from = safePage * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <VStack className="mb-4 gap-2">
        {/* Solo se muestra si el usuario tiene más de una sucursal en sus claims */}
        {branchOptions.length > 1 && (
          <HStack className="items-center gap-2">
            <View style={{ width: 240 }}>
              <AppSelect
                placeholder="Selecciona una sucursal"
                searchable={branchSelectOptions.length > 6}
                options={branchSelectOptions}
                value={effectiveBranchId}
                onChange={handleBranchChange}
              />
            </View>
          </HStack>
        )}

        <HStack className="justify-between items-center gap-2">
          <View className="flex-1 sm:w-64 sm:flex-none">
            <AppInput
              placeholder="Buscar documento, cliente o NIT..."
              value={search}
              onChangeText={handleSearchChange}
              leftIcon={<SearchIcon size={16} color="#9ca3af" />}
              inputStyle={{ color: "#000" }}
            />
          </View>

          <HStack className="gap-2 items-center">
            <View style={{ width: 180 }}>
              <AppSelect
                placeholder="Todos los estados"
                searchable={false}
                options={STATUS_SELECT_OPTIONS}
                value={statusFilter}
                onChange={handleStatusChange}
              />
            </View>

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
          </HStack>
        </HStack>
      </VStack>

      <DataTable style={tableStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title style={{ flex: COLUMN_FLEX.document }}>
            Documento
          </DataTable.Title>
          {visibleColumns.type && (
            <DataTable.Title style={{ flex: COLUMN_FLEX.type }}>
              Tipo
            </DataTable.Title>
          )}
          <DataTable.Title style={{ flex: COLUMN_FLEX.customer }}>
            Cliente
          </DataTable.Title>
          <DataTable.Title style={{ flex: COLUMN_FLEX.status }}>
            Estado
          </DataTable.Title>
          <DataTable.Title numeric style={{ flex: COLUMN_FLEX.total }}>
            Total
          </DataTable.Title>
          {visibleColumns.issued_at && (
            <DataTable.Title style={{ flex: COLUMN_FLEX.issuedAt }}>
              Emitido
            </DataTable.Title>
          )}
        </DataTable.Header>

        {isLoading ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Cargando...</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin documentos</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((item) => (
            <DataTable.Row
              key={item.id}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(item) : undefined}
            >
              <DataTable.Cell style={{ flex: COLUMN_FLEX.document }}>
                <Text
                  style={{ color: "#000000" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.series}-{item.number}
                </Text>
              </DataTable.Cell>

              {visibleColumns.type && (
                <DataTable.Cell style={{ flex: COLUMN_FLEX.type }}>
                  <Text
                    style={{ color: "#000000" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {DOCUMENT_TYPE_LABELS[item.document_type] ??
                      item.document_type}
                  </Text>
                </DataTable.Cell>
              )}

              <DataTable.Cell style={{ flex: COLUMN_FLEX.customer }}>
                <View style={{ width: "100%" }}>
                  <Text
                    style={{ color: "#000000" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.customer_name}
                  </Text>
                  <Text
                    style={{ color: "#9ca3af", fontSize: 11 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.customer_nit}
                  </Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell style={{ flex: COLUMN_FLEX.status }}>
                <StatusBadge status={item.document_status} />
              </DataTable.Cell>

              <DataTable.Cell numeric style={{ flex: COLUMN_FLEX.total }}>
                <Text
                  style={{ color: "#000000", fontWeight: "600" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatCurrency(item.total)}
                </Text>
              </DataTable.Cell>

              {visibleColumns.issued_at && (
                <DataTable.Cell style={{ flex: COLUMN_FLEX.issuedAt }}>
                  <Text
                    style={{ color: "#000000" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {new Date(item.issued_at).toLocaleDateString("es-GT")}
                  </Text>
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
            filteredData.length > 0
              ? `${from + 1}-${to} de ${filteredData.length}`
              : "0 de 0"
          }
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>
    </VStack>
  );
}
