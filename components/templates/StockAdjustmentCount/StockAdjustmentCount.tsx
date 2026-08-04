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
import {
    StatusAdjustmentStock,
    StockAdjustmentCount,
} from "@/src/types/stock_adjustment/stock_adjustment.types";
import { SearchIcon } from "lucide-react-native";
import React, { useState } from "react";
import { View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface StockAdjustmentsTableProps {
  data: StockAdjustmentCount[];
  itemsPerPage?: number;
  onRowPress?: (row: StockAdjustmentCount) => void;
  statusFilter: StatusAdjustmentStock;
  onStatusFilterChange: (status: StatusAdjustmentStock) => void;
}

const STATUS_OPTIONS: { value: StatusAdjustmentStock; label: string }[] = [
  { value: StatusAdjustmentStock.PENDING, label: "Pendiente de aprobación" },
  { value: StatusAdjustmentStock.APPROVED, label: "Aprobado" },
  { value: StatusAdjustmentStock.REJECTED, label: "Rechazado" },
];

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  [StatusAdjustmentStock.PENDING]: {
    bg: "#fef9c3",
    color: "#a16207",
    label: "Pendiente",
  },
  [StatusAdjustmentStock.APPROVED]: {
    bg: "#dcfce7",
    color: "#16a34a",
    label: "Aprobado",
  },
  [StatusAdjustmentStock.REJECTED]: {
    bg: "#fee2e2",
    color: "#dc2626",
    label: "Rechazado",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const style = STATUS_STYLES[status] ?? {
    bg: "#f3f4f6",
    color: "#374151",
    label: status,
  };
  return (
    <View
      style={{
        backgroundColor: style.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: style.color, fontSize: 12, fontWeight: "500" }}>
        {style.label}
      </Text>
    </View>
  );
};

export function StockAdjustmentsTable({
  data,
  itemsPerPage = 5,
  onRowPress,
  statusFilter,
  onStatusFilterChange,
}: StockAdjustmentsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      [item.id, item.warehouse?.name, item.notes, item.requested_by].some(
        (val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(term),
      ),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  React.useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

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
    alignItems: "center",
    justifyContent: "center",
  };

  const selectedStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label || "";

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4 gap-2">
        <Input
          className="flex-1 sm:w-64 sm:flex-none bg-white rounded-lg"
          variant="outline"
          size="md"
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            placeholder="Buscar ajuste..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        <View style={{ width: 200 }}>
          <Select
            selectedValue={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as StatusAdjustmentStock)
            }
          >
            <SelectTrigger>
              <SelectInput
                style={{ color: "#000" }}
                placeholder="Estado"
                value={selectedStatusLabel}
              />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} label={s.label} value={s.value} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>ID</DataTable.Title>
          <DataTable.Title>Bodega</DataTable.Title>
          <DataTable.Title>Estado</DataTable.Title>
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin ajustes</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((item) => (
            <DataTable.Row
              key={item.id}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(item) : undefined}
            >
              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{item.id}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>
                  {item.warehouse?.name ?? "—"}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell
                style={{ alignSelf: "center", justifyContent: "center" }}
              >
                <StatusBadge status={item.adjustment_status} />
              </DataTable.Cell>
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
