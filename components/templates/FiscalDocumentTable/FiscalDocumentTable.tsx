import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select";
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
import React, { useMemo, useState } from "react";
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

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatusBadge = ({ status }: { status: string }) => {
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

type OptionalColumnKey = "type" | "issued_at";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "type", label: "Tipo" },
  { key: "issued_at", label: "Emitido" },
];

// Flex relativo de cada columna para que ningún contenido se salga de la tabla.
const COLUMN_FLEX = {
  document: 1,
  type: 1,
  customer: 1.6,
  status: 1,
  total: 1,
  issuedAt: 1,
};

export function FiscalDocumentsTable({
  itemsPerPage = 5,
  onRowPress,
}: FiscalDocumentsTableProps) {
  const { claims } = useAuthStore();

  const branchOptions: BranchOption[] = useMemo(() => {
    if (!claims?.branches) return [];
    return claims.branches.map((b) => ({
      id: b.branch_id,
      label: b.branch_name,
    }));
  }, [claims]);

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // Si el usuario solo tiene una sucursal, se usa automáticamente sin mostrar el select.
  React.useEffect(() => {
    if (!selectedBranchId && branchOptions.length > 0) {
      setSelectedBranchId(String(branchOptions[0].id));
    }
  }, [branchOptions, selectedBranchId]);

  const selectedBranchLabel =
    branchOptions.find((b) => String(b.id) === selectedBranchId)?.label || "";

  const { data, isLoading } = useFiscalDocument(selectedBranchId);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    type: false,
    issued_at: false,
  });

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = React.useMemo(() => {
    let result = data ?? [];

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
  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  React.useEffect(() => {
    setPage(0);
  }, [search, statusFilter, selectedBranchId]);

  React.useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [filteredData.length, totalPages, page]);

  const defaultStyle: ViewStyle = {
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

  const selectedStatusLabel =
    DOCUMENT_STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label || "";

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <VStack className="mb-4 gap-2">
        {/* Solo se muestra si el usuario tiene más de una sucursal en sus claims */}
        {branchOptions.length > 1 && (
          <HStack className="items-center gap-2">
            <View style={{ width: 240 }}>
              <Select
                selectedValue={selectedBranchId}
                onValueChange={setSelectedBranchId}
              >
                <SelectTrigger>
                  <SelectInput
                    style={{ color: "#000" }}
                    placeholder="Selecciona una sucursal"
                    value={selectedBranchLabel}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {branchOptions.map((b) => (
                      <SelectItem
                        key={b.id}
                        label={b.label}
                        value={String(b.id)}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>
          </HStack>
        )}

        <HStack className="justify-between items-center gap-2">
          <Input
            className="flex-1 sm:w-64 sm:flex-none bg-white rounded-lg"
            variant="outline"
            size="md"
          >
            <InputSlot style={{ marginLeft: 10 }}>
              <InputIcon as={SearchIcon} size="sm" />
            </InputSlot>
            <InputField
              placeholder="Buscar documento, cliente o NIT..."
              value={search}
              onChangeText={setSearch}
            />
          </Input>

          <HStack className="gap-2 items-center">
            <View style={{ width: 180 }}>
              <Select
                selectedValue={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectInput
                    style={{ color: "#000" }}
                    placeholder="Todos los estados"
                    value={selectedStatusLabel}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Todos los estados" value="" />
                    {DOCUMENT_STATUS_OPTIONS.map((s) => (
                      <SelectItem
                        key={s.value}
                        label={s.label}
                        value={s.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  size="md"
                  variant="outline"
                  style={{ borderColor: "#949292", borderWidth: 1 }}
                  onPress={() => setMenuVisible(true)}
                >
                  <SlidersHorizontal size={16} color="#374151" />
                  <ButtonText
                    className="hidden sm:flex sm:ml-1.5"
                    style={{ color: "#000" }}
                  >
                    Columnas
                  </ButtonText>
                </Button>
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

      <DataTable style={defaultStyle}>
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
          page={page}
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
