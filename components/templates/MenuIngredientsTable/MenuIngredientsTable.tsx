import { Action, ActionsMenu, SummaryCard } from "@/components/atom";
import { FilterPill } from "@/components/atom/FilterPill/FilterPill";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { MenuIngredient } from "@/src/types/product/product.types";
import { SearchIcon, SlidersHorizontal } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";
import { Buttons } from "../CustomTable";

const COLOR_PALETTE = [
  { bg: "#EAF3DE", color: "#27500A" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#FCEBEB", color: "#791F1F" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#FAF0DC", color: "#633806" },
];

type OptionalColumnKey = "min" | "max";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "min", label: "Min" },
  { key: "max", label: "Max" },
];

function GroupBadge({
  group,
  colorMap,
}: {
  group: string | null;
  colorMap: Record<string, { bg: string; color: string }>;
}) {
  if (!group) return <Text style={styles.muted}>—</Text>;
  const cfg = colorMap[group] ?? { bg: "#F1EFE8", color: "#444441" };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{group}</Text>
    </View>
  );
}

interface MenuIngredientsTableProps {
  data: MenuIngredient[];
  onRowPress?: (row: MenuIngredient) => void;
  itemsPerPage?: number;
  button?: Buttons[];
  actions?: Action<MenuIngredient>[];
}

export function MenuIngredientsTable({
  data,
  onRowPress,
  itemsPerPage = 8,
  button,
  actions,
}: MenuIngredientsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [onlyDefault, setOnlyDefault] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    min: false,
    max: false,
  });
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validData = useMemo(() => data.filter((r) => r?.name != null), [data]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    validData.forEach((r) => {
      if (r.modifier_group) set.add(r.modifier_group);
    });
    return [...set];
  }, [validData]);

  const groupColorMap = useMemo(() => {
    const map: Record<string, { bg: string; color: string }> = {};
    groups.forEach((g, i) => {
      map[g] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    });
    return map;
  }, [groups]);

  const filtered = useMemo(() => {
    let rows = validData;

    if (activeGroup) {
      rows = rows.filter((r) => r.modifier_group === activeGroup);
    }

    if (onlyDefault) {
      rows = rows.filter((r) => r.modifier_is_default === true);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.sku.toLowerCase().includes(term) ||
          (r.modifier_name ?? "").toLowerCase().includes(term) ||
          (r.modifier_group ?? "").toLowerCase().includes(term),
      );
    }

    return rows;
  }, [validData, activeGroup, onlyDefault, search]);

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
          className="bg-white rounded-lg"
          variant="outline"
          size="md"
          style={{ flex: 1, marginRight: 12 }}
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            style={{ color: "#000" }}
            placeholder="Buscar ingrediente, SKU, grupo…"
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

          {button?.map((btn) => {
            return (
              <Button
                key={btn.key}
                size="md"
                variant={btn.variant}
                style={{
                  borderColor: "#949292",
                  borderWidth: 1,
                  ...(isMobile && styles.buttonIconOnly),
                }}
                onPress={btn.onPress}
              >
                {btn.icon && (
                  <ButtonIcon as={btn.icon} style={{ color: "#000" }} />
                )}
                {!isMobile && (
                  <ButtonText style={{ color: "#000" }}>{btn.name}</ButtonText>
                )}
              </Button>
            );
          })}
        </HStack>
      </HStack>

      <HStack style={styles.pillRow}>
        <FilterPill
          label={`Todos (${validData.length})`}
          active={activeGroup === null && !onlyDefault}
          onPress={() => {
            setActiveGroup(null);
            setOnlyDefault(false);
          }}
        />
        {groups.map((g) => (
          <FilterPill
            key={g}
            label={g}
            active={activeGroup === g}
            color={groupColorMap[g]?.color}
            bg={groupColorMap[g]?.bg}
            onPress={() => setActiveGroup(activeGroup === g ? null : g)}
          />
        ))}
      </HStack>

      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 2 }}>Ingrediente</DataTable.Title>
          <DataTable.Title style={{ flex: 1.5, justifyContent: "center" }}>
            Grupo
          </DataTable.Title>
          {visibleColumns.min && (
            <DataTable.Title numeric style={{ justifyContent: "center" }}>
              Min
            </DataTable.Title>
          )}
          {visibleColumns.max && (
            <DataTable.Title numeric style={{ justifyContent: "center" }}>
              Max
            </DataTable.Title>
          )}
          <DataTable.Title numeric style={{ justifyContent: "center" }}>
            Cant.
          </DataTable.Title>
          <DataTable.Title numeric style={{ justifyContent: "center" }}>
            Costo
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
              <Text style={styles.muted}>Sin ingredientes</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => (
            <DataTable.Row
              key={row.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                <View style={{ width: "100%" }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.modifier_name ?? row.name}
                  </Text>
                  <Text style={styles.sku} numberOfLines={1}>
                    {row.sku}
                  </Text>
                  {row.requires_batch && (
                    <Text style={styles.batchLabel}>Requiere lote</Text>
                  )}
                </View>
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  flex: 1.5,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <GroupBadge
                  group={row.modifier_group}
                  colorMap={groupColorMap}
                />
              </DataTable.Cell>

              {visibleColumns.min && (
                <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                  <Text style={styles.cell}>
                    {row.modifier_min_selection ?? "—"}
                  </Text>
                </DataTable.Cell>
              )}

              {visibleColumns.max && (
                <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                  <Text style={styles.cell}>
                    {row.modifier_max_selection ?? "—"}
                  </Text>
                </DataTable.Cell>
              )}

              <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                <Text style={styles.cell}>{row.modifier_quantity ?? "—"}</Text>
              </DataTable.Cell>

              <DataTable.Cell numeric style={{ justifyContent: "center" }}>
                <Text style={styles.cost}>Q{row.average_cost.toFixed(2)}</Text>
              </DataTable.Cell>

              {actions && actions.length > 0 && (
                <DataTable.Cell>
                  <ActionsMenu row={row} actions={actions} />
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
            filtered.length > 0
              ? `${from + 1}-${to} de ${filtered.length}`
              : "0 de 0"
          }
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>

      <HStack style={{ ...styles.summaryRow, marginBottom: 12 }}>
        <SummaryCard label="Ingredientes" value={String(filtered.length)} />
        <SummaryCard
          label="Por defecto"
          value={String(filtered.filter((r) => r.modifier_is_default).length)}
        />
        <SummaryCard
          label="Con lote"
          value={String(filtered.filter((r) => r.requires_batch).length)}
        />
        <SummaryCard
          label="Costo prom."
          value={
            filtered.length
              ? `Q${(filtered.reduce((a, r) => a + r.average_cost, 0) / filtered.length).toFixed(2)}`
              : "Q0.00"
          }
        />
      </HStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
  pillRow: { flexWrap: "wrap", gap: 6, marginBottom: 12 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    backgroundColor: "#fff",
  },
  pillText: { fontSize: 12, color: "#666" },
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
  defaultDot: { width: 10, height: 10, borderRadius: 5 },
  summaryRow: { gap: 8, flexWrap: "wrap" },
  summaryCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },

  buttonIconOnly: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
