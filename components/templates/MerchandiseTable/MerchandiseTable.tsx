import { Action, ActionsMenu } from "@/components/atom";
import { FilterPill } from "@/components/atom/FilterPill/FilterPill";
import { Buttons } from "@/components/templates/CustomTable/CustomTable";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { MerchandiseListItem } from "@/src/types/merchandise/merchandise.types";
import { SearchIcon, SlidersHorizontal } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  storable: { label: "Almacenable", color: "#0C447C", bg: "#E6F1FB" },
  ingredient: { label: "Ingrediente", color: "#633806", bg: "#FAEEDA" },
  finished_product: {
    label: "Producto",
    color: "#27500A",
    bg: "#EAF3DE",
  },
  menu_item: { label: "Ítem de menú", color: "#3C3489", bg: "#EEEDFE" },
};

type OptionalColumnKey =
  | "category"
  | "brand"
  | "barcode"
  | "price"
  | "modifier";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "category", label: "Categoría" },
  { key: "brand", label: "Marca" },
  { key: "barcode", label: "Código de barras" },
  { key: "price", label: "Precio" },
  { key: "modifier", label: "Modificador" },
];

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? { label: type, color: "#444", bg: "#eee" };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function AvailabilityDot({ status }: { status: string }) {
  const isAvailable = status === "available";
  return (
    <View
      style={[
        styles.availDot,
        { backgroundColor: isAvailable ? "#1D9E75" : "#d4d4d4" },
      ]}
    />
  );
}

interface MerchandiseTableProps {
  data: MerchandiseListItem[];
  onRowPress?: (row: MerchandiseListItem) => void;
  itemsPerPage?: number;
  button?: Buttons[];
  actions?: Action<MerchandiseListItem>[];
}

export function MerchandiseTable({
  data,
  onRowPress,
  itemsPerPage = 8,
  button,
  actions,
}: MerchandiseTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    category: false,
    brand: false,
    barcode: false,
    price: false,
    modifier: false,
  });
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Se lee directo de item.product.* — sin mapear el array a otra forma antes.
  const validData = useMemo(
    () => data.filter((r) => r?.product?.name != null),
    [data],
  );

  const countByType = useMemo(() => {
    const map: Record<string, number> = {};
    validData.forEach((r) => {
      map[r.product.type] = (map[r.product.type] ?? 0) + 1;
    });
    return map;
  }, [validData]);

  const filtered = useMemo(() => {
    let rows = validData;

    if (activeType) {
      rows = rows.filter((r) => r.product.type === activeType);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter((r) => {
        const p = r.product;
        return (
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (p.brand ?? "").toLowerCase().includes(term) ||
          (p.barcode ?? "").toLowerCase().includes(term) ||
          (p.category_name ?? "").toLowerCase().includes(term) ||
          (p.modifier_name ?? "").toLowerCase().includes(term)
        );
      });
    }

    return rows;
  }, [validData, activeType, search]);

  React.useEffect(() => {
    setPage(0);
  }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filtered.length);
  const paginated = filtered.slice(from, to);

  return (
    <VStack style={styles.container}>
      <HStack className="justify-between items-center mb-4">
        <Input
          className="bg-white rounded-lg text-black"
          variant="outline"
          size="md"
          style={{ flex: 1, marginRight: 12 }}
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            style={{ color: "#000" }}
            placeholder="Buscar producto, SKU, marca, categoría…"
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        <HStack className="gap-3 items-center">
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
                <ButtonText className="hidden sm:flex sm:ml-1.5">
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

          {button?.map((btn, index) => (
            <Button
              key={btn.key ?? `btn-${index}`}
              size="md"
              variant={btn.variant}
              style={[
                { borderColor: "#949292", borderWidth: 1 },
                isMobile && styles.buttonIconOnly,
              ]}
              onPress={btn.onPress}
            >
              {btn.icon && (
                <ButtonIcon as={btn.icon} style={{ color: "#000" }} />
              )}
              {!isMobile && (
                <ButtonText style={{ color: "#000" }}>{btn.name}</ButtonText>
              )}
            </Button>
          ))}
        </HStack>
      </HStack>

      <HStack style={styles.pillRow}>
        <FilterPill
          label={`Todos (${validData.length})`}
          active={activeType === null}
          onPress={() => setActiveType(null)}
        />
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) =>
          countByType[type] ? (
            <FilterPill
              key={type}
              label={`${cfg.label} (${countByType[type]})`}
              active={activeType === type}
              color={cfg.color}
              bg={cfg.bg}
              onPress={() => setActiveType(activeType === type ? null : type)}
            />
          ) : null,
        )}
      </HStack>

      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 2 }}>Producto</DataTable.Title>
          <DataTable.Title style={{ flex: 1.3, justifyContent: "center" }}>
            Tipo
          </DataTable.Title>
          {visibleColumns.category && (
            <DataTable.Title style={{ flex: 1.3, justifyContent: "center" }}>
              Categoría
            </DataTable.Title>
          )}
          {visibleColumns.brand && (
            <DataTable.Title style={{ flex: 1, justifyContent: "center" }}>
              Marca
            </DataTable.Title>
          )}
          {visibleColumns.barcode && (
            <DataTable.Title style={{ flex: 1.2, justifyContent: "center" }}>
              Cód. barras
            </DataTable.Title>
          )}
          {visibleColumns.price && (
            <DataTable.Title numeric style={{ justifyContent: "center" }}>
              Precio
            </DataTable.Title>
          )}
          {visibleColumns.modifier && (
            <DataTable.Title style={{ flex: 1.3, justifyContent: "center" }}>
              Modificador
            </DataTable.Title>
          )}

          <DataTable.Title numeric style={{ justifyContent: "center" }}>
            Costo
          </DataTable.Title>
          <DataTable.Title style={{ justifyContent: "center" }}>
            Disp.
          </DataTable.Title>
          {actions && actions.length > 0 && (
            <DataTable.Title style={{ marginLeft: 10 }}>
              Acciones
            </DataTable.Title>
          )}
        </DataTable.Header>

        {paginated.length === 0 ? (
          <DataTable.Row style={styles.row}>
            <DataTable.Cell>
              <Text style={styles.muted}>Sin productos</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => {
            const p = row.product;
            return (
              <DataTable.Row
                key={p.id}
                style={styles.row}
                onPress={onRowPress ? () => onRowPress(row) : undefined}
              >
                <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.sku} numberOfLines={1}>
                      {p.sku}
                    </Text>
                    {p.requires_batch && (
                      <Text style={styles.batchLabel}>Requiere lote</Text>
                    )}
                  </View>
                </DataTable.Cell>

                <DataTable.Cell
                  style={{
                    flex: 1.3,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                >
                  <TypeBadge type={p.type} />
                </DataTable.Cell>

                {visibleColumns.category && (
                  <DataTable.Cell
                    style={{ flex: 1.3, justifyContent: "center" }}
                  >
                    <Text style={styles.cell} numberOfLines={1}>
                      {p.category_name ?? "—"}
                    </Text>
                  </DataTable.Cell>
                )}

                {visibleColumns.brand && (
                  <DataTable.Cell style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={styles.cell} numberOfLines={1}>
                      {p.brand ?? "—"}
                    </Text>
                  </DataTable.Cell>
                )}

                {visibleColumns.barcode && (
                  <DataTable.Cell
                    style={{ flex: 1.2, justifyContent: "center" }}
                  >
                    <Text style={styles.cell} numberOfLines={1}>
                      {p.barcode ?? "—"}
                    </Text>
                  </DataTable.Cell>
                )}

                {visibleColumns.price && (
                  <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                    <Text style={styles.cost}>
                      {row.price != null
                        ? `${row.price.currency ?? ""} ${row.price.amount.toFixed(2)}`
                        : "—"}
                    </Text>
                  </DataTable.Cell>
                )}

                {visibleColumns.modifier && (
                  <DataTable.Cell
                    style={{ flex: 1.3, justifyContent: "center" }}
                  >
                    <Text style={styles.cell} numberOfLines={1}>
                      {p.is_modifier
                        ? `${p.modifier_group ?? "—"} / ${p.modifier_name ?? "—"}`
                        : "—"}
                    </Text>
                  </DataTable.Cell>
                )}

                <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                  <Text style={styles.cost}>Q{p.average_cost.toFixed(2)}</Text>
                </DataTable.Cell>

                <DataTable.Cell
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <AvailabilityDot status={p.availability_status} />
                </DataTable.Cell>

                {actions && actions.length > 0 && (
                  <DataTable.Cell>
                    <ActionsMenu row={row} actions={actions} />
                  </DataTable.Cell>
                )}
              </DataTable.Row>
            );
          })
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
  productName: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  sku: { fontSize: 11, color: "#888" },
  batchLabel: { fontSize: 10, color: "#0C447C", marginTop: 1 },
  cell: { fontSize: 13, color: "#374151" },
  cost: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  muted: { fontSize: 13, color: "#aaa" },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  buttonIconOnly: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
