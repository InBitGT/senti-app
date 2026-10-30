import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  CustomerCreditMovement,
  MOVEMENT_TYPE_OPTIONS,
} from "@/src/types/movement_credit/movement_credit";
import { SearchIcon, SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

export interface CustomerCreditMovementsTableProps {
  data: CustomerCreditMovement[];
  itemsPerPage?: number;
  onRowPress?: (row: CustomerCreditMovement) => void;
}

type CreditMovementType = CustomerCreditMovement["movement_type"];

interface SelectOption {
  label: string;
  value: string;
}

type OptionalColumnKey = "balance_after" | "description" | "user";

interface OptionalColumn {
  key: OptionalColumnKey;
  label: string;
}

const formatCurrency = (value: number): string =>
  `Q${value.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface MovementBadgeProps {
  type: CreditMovementType;
}

const MovementBadge = ({ type }: MovementBadgeProps) => {
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

const OPTIONAL_COLUMNS: OptionalColumn[] = [
  { key: "balance_after", label: "Saldo después" },
  { key: "description", label: "Descripción" },
  { key: "user", label: "Usuario" },
];

const TYPE_SELECT_OPTIONS: SelectOption[] = [
  { label: "Todos los tipos", value: "" },
  ...MOVEMENT_TYPE_OPTIONS.map((t) => ({ label: t.label, value: t.value })),
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
  gap: 10,
  borderBottomColor: "#d4d4d4",
};

export function CustomerCreditMovementsTable({
  data,
  itemsPerPage = 5,
  onRowPress,
}: CustomerCreditMovementsTableProps) {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    balance_after: false,
    description: false,
    user: false,
  });

  const toggleColumn = (key: OptionalColumnKey): void => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Cada cambio de filtro reinicia la página en el mismo evento,
  // en lugar de hacerlo dentro de un useEffect.
  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const handleTypeChange = (value: string): void => {
    setTypeFilter(value);
    setPage(0);
  };

  const handleDateFromChange = (text: string): void => {
    setDateFrom(text);
    setPage(0);
  };

  const handleDateToChange = (text: string): void => {
    setDateTo(text);
    setPage(0);
  };

  const filteredData = useMemo<CustomerCreditMovement[]>(() => {
    let result = data;

    if (typeFilter) {
      result = result.filter((item) => item.movement_type === typeFilter);
    }

    const fromDate = parseDateInput(dateFrom);
    if (fromDate) {
      result = result.filter((item) => new Date(item.created_at) >= fromDate);
    }

    const toDate = parseDateInput(dateTo);
    if (toDate) {
      // Incluye todo el día "hasta" (23:59:59.999)
      const toEndOfDay = new Date(toDate);
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
  // Valor derivado: si los datos cambian y la página queda fuera de rango,
  // se ajusta sin necesidad de un efecto.
  const safePage = Math.min(page, totalPages - 1);
  const from = safePage * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <VStack className="mb-4 gap-2">
        <HStack className="justify-between items-center gap-2">
          <View className="flex-1 sm:w-64 sm:flex-none">
            <AppInput
              placeholder="Buscar movimiento..."
              value={search}
              onChangeText={handleSearchChange}
              leftIcon={<SearchIcon size={16} color="#9ca3af" />}
              inputStyle={{ color: "#000" }}
            />
          </View>

          <HStack className="gap-2 items-center">
            <View style={{ width: 180 }}>
              <AppSelect
                placeholder="Todos los tipos"
                searchable={false}
                options={TYPE_SELECT_OPTIONS}
                value={typeFilter}
                onChange={handleTypeChange}
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

        <HStack className="items-center gap-2">
          <View style={{ flex: 1 }}>
            <AppInput
              placeholder="Desde (AAAA-MM-DD)"
              value={dateFrom}
              onChangeText={handleDateFromChange}
              keyboardType="numbers-and-punctuation"
              inputStyle={{ color: "#000" }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppInput
              placeholder="Hasta (AAAA-MM-DD)"
              value={dateTo}
              onChangeText={handleDateToChange}
              keyboardType="numbers-and-punctuation"
              inputStyle={{ color: "#000" }}
            />
          </View>
        </HStack>
      </VStack>

      <DataTable style={tableStyle}>
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
          {visibleColumns.user && <DataTable.Title>Usuario</DataTable.Title>}
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
                <Text style={{ color: "#000000" }}>
                  {item.customer?.name ?? "—"}
                </Text>
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

              {visibleColumns.user && (
                <DataTable.Cell>
                  <Text
                    style={{ color: "#000000" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.user
                      ? `${item.user.first_name ?? ""} ${item.user.last_name ?? ""}`.trim() ||
                        "—"
                      : "—"}
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
