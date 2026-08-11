import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { InventoryStockItem } from "@/src/types/inventory/inventory";
import { SearchIcon, SlidersHorizontal } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

export interface InventoryStockTableProps {
  data: InventoryStockItem[];
  onRowPress?: (row: InventoryStockItem) => void;
  itemsPerPage?: number;
}

// Fijas siempre visibles: Producto, En existencia, Disponible, Estado.
// Solo estas dos quedan como columnas opcionales, ocultas por defecto.
type OptionalColumnKey = "reserved" | "cost";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "reserved", label: "Reservado" },
  { key: "cost", label: "Costo promedio" },
];

const StockBadge = ({ item }: { item: InventoryStockItem }) => {
  const isEmpty = item.available_qty <= 0;
  const bg = isEmpty ? "#fee2e2" : "#dcfce7";
  const color = isEmpty ? "#dc2626" : "#16a34a";
  const label = isEmpty ? "Sin stock" : "Disponible";

  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{ fontSize: 11, fontWeight: "500", color }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function InventoryStockTable({
  data,
  onRowPress,
  itemsPerPage = 8,
}: InventoryStockTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    reserved: false,
    cost: false,
  });

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(
      (p) =>
        p.product_name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term),
    );
  }, [data, search]);

  React.useEffect(() => {
    setPage(0);
  }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filtered.length);
  const paginated = filtered.slice(from, to);

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

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4">
        <Input
          className="flex-1 bg-white rounded-lg"
          variant="outline"
          size="md"
          style={{ marginRight: 12 }}
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            style={{ color: "#000" }}
            placeholder="Buscar producto o SKU…"
            value={search}
            onChangeText={setSearch}
          />
        </Input>

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
                style={{ color: "#374151" }}
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
                    status={visibleColumns[col.key] ? "checked" : "unchecked"}
                    onPress={() => toggleColumn(col.key)}
                  />
                </View>
              )}
            />
          ))}
        </Menu>
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title style={{ flex: 2 }}>Producto</DataTable.Title>
          <DataTable.Title numeric>En existencia</DataTable.Title>
          {visibleColumns.reserved && (
            <DataTable.Title numeric>Reservado</DataTable.Title>
          )}
          <DataTable.Title numeric>Disponible</DataTable.Title>
          {visibleColumns.cost && (
            <DataTable.Title numeric>Costo prom.</DataTable.Title>
          )}
          <DataTable.Title style={{ flex: 1.2, justifyContent: "center" }}>
            Estado
          </DataTable.Title>
        </DataTable.Header>

        {paginated.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin existencias en esta bodega</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((item, index) => (
            <DataTable.Row
              key={`${item.product_id}-${item.warehouse_id}-${index}`}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(item) : undefined}
            >
              <DataTable.Cell style={{ flex: 2 }}>
                <View>
                  <Text
                    style={{ color: "#000", fontWeight: "500" }}
                    numberOfLines={1}
                  >
                    {item.product_name}
                  </Text>
                  <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                    {item.sku}{" "}
                    {item.unit_of_measure ? `· ${item.unit_of_measure}` : ""}
                  </Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text style={{ color: "#000" }}>{item.total_qty_on_hand}</Text>
              </DataTable.Cell>

              {visibleColumns.reserved && (
                <DataTable.Cell numeric>
                  <Text style={{ color: "#6b7280" }}>
                    {item.total_qty_reserved}
                  </Text>
                </DataTable.Cell>
              )}

              <DataTable.Cell numeric>
                <Text style={{ color: "#000", fontWeight: "600" }}>
                  {item.available_qty}
                </Text>
              </DataTable.Cell>

              {visibleColumns.cost && (
                <DataTable.Cell numeric>
                  <Text style={{ color: "#000" }}>
                    {formatCurrency(item.average_cost)}
                  </Text>
                </DataTable.Cell>
              )}

              <DataTable.Cell
                style={{
                  flex: 1.2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <StockBadge item={item} />
              </DataTable.Cell>
            </DataTable.Row>
          ))
        )}

        <DataTable.Pagination
          page={page}
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
    </VStack>
  );
}
