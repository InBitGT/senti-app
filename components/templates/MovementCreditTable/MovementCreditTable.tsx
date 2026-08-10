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
import {
  CustomerCreditMovement,
  MOVEMENT_TYPE_OPTIONS,
} from "@/src/types/movement_credit/movement_credit";
import { SearchIcon, SlidersHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { View, ViewStyle } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

export interface CustomerCreditMovementsTableProps {
  data: CustomerCreditMovement[];
  itemsPerPage?: number;
  onRowPress?: (row: CustomerCreditMovement) => void;
}

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MovementBadge = ({ type }: { type: string }) => {
  const isCharge = type === "charge";
  const bg = isCharge ? "#fee2e2" : "#dcfce7";
  const color = isCharge ? "#dc2626" : "#16a34a";
  const label = isCharge ? "Cargo" : "Pago";

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

// Convierte "YYYY-MM-DD" a Date a medianoche local, o null si el texto no es una fecha válida.
const parseDateInput = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
};

type OptionalColumnKey = "balance_after" | "description" | "user";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "balance_after", label: "Saldo después" },
  { key: "description", label: "Descripción" },
  { key: "user", label: "Usuario" },
];

export function CustomerCreditMovementsTable({
  data,
  itemsPerPage = 5,
  onRowPress,
}: CustomerCreditMovementsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    balance_after: false,
    description: false,
    user: false,
  });

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = React.useMemo(() => {
    let result = data;

    if (typeFilter) {
      result = result.filter((item) => item.movement_type === typeFilter);
    }

    const from = parseDateInput(dateFrom);
    if (from) {
      result = result.filter((item) => new Date(item.created_at) >= from);
    }

    const to = parseDateInput(dateTo);
    if (to) {
      // Incluye todo el día "hasta" (23:59:59.999)
      const toEndOfDay = new Date(to);
      toEndOfDay.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.created_at) <= toEndOfDay);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((item) =>
        [
          item.description,
          item.customer?.name,
          item.user?.first_name,
          item.user?.last_name,
          item.order_id,
        ].some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    return result;
  }, [data, search, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  React.useEffect(() => {
    setPage(0);
  }, [search, typeFilter, dateFrom, dateTo]);

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
    gap: 10,
    borderBottomColor: "#d4d4d4",
  };

  const selectedTypeLabel =
    MOVEMENT_TYPE_OPTIONS.find((t) => t.value === typeFilter)?.label || "";

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <VStack className="mb-4 gap-2">
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
              style={{ color: "#000" }}
              placeholder="Buscar movimiento..."
              value={search}
              onChangeText={setSearch}
            />
          </Input>

          <HStack className="gap-2 items-center">
            <View style={{ width: 180 }}>
              <Select selectedValue={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectInput
                    style={{ color: "#000" }}
                    placeholder="Todos los tipos"
                    value={selectedTypeLabel}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Todos los tipos" value="" />
                    {MOVEMENT_TYPE_OPTIONS.map((t) => (
                      <SelectItem
                        key={t.value}
                        label={t.label}
                        value={t.value}
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

        <HStack className="items-center gap-2">
          <Input
            className="flex-1 bg-white rounded-lg"
            variant="outline"
            size="md"
          >
            <InputField
              style={{ color: "#000" }}
              placeholder="Desde (AAAA-MM-DD)"
              value={dateFrom}
              onChangeText={setDateFrom}
              keyboardType="numbers-and-punctuation"
            />
          </Input>

          <Input
            className="flex-1 bg-white rounded-lg"
            variant="outline"
            size="md"
          >
            <InputField
              style={{ color: "#000" }}
              placeholder="Hasta (AAAA-MM-DD)"
              value={dateTo}
              onChangeText={setDateTo}
              keyboardType="numbers-and-punctuation"
            />
          </Input>
        </HStack>
      </VStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Fecha</DataTable.Title>
          <DataTable.Title>Cliente</DataTable.Title>
          <DataTable.Title>Tipo</DataTable.Title>
          <DataTable.Title numeric>Monto</DataTable.Title>
          {visibleColumns.balance_after && (
            <DataTable.Title numeric>Saldo después</DataTable.Title>
          )}
          {visibleColumns.description && (
            <DataTable.Title>Descripción</DataTable.Title>
          )}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin movimientos</Text>
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
                <Text style={{ color: "#000000" }}>
                  {new Date(item.created_at).toLocaleDateString("es-GT")}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{item.customer.name}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <MovementBadge type={item.movement_type} />
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text
                  style={{
                    color:
                      item.movement_type === "charge" ? "#dc2626" : "#16a34a",
                    fontWeight: "600",
                  }}
                >
                  {item.movement_type === "charge" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </Text>
              </DataTable.Cell>

              {visibleColumns.balance_after && (
                <DataTable.Cell numeric>
                  <Text style={{ color: "#000000" }}>
                    {formatCurrency(item.balance_after)}
                  </Text>
                </DataTable.Cell>
              )}

              {visibleColumns.description && (
                <DataTable.Cell>
                  <Text
                    style={{ color: "#000000" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.description ?? "—"}
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
