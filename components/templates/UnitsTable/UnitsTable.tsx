import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { Buttons } from "@/components/templates/CustomTable/CustomTable";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { SearchIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { DataTable } from "react-native-paper";

const UOM_TYPE_LABELS: Record<string, string> = {
  unit: "Unidad",
  weight: "Peso",
  volume: "Volumen",
  length: "Longitud",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <View style={styles.typeBadge}>
      <Text style={styles.typeBadgeText}>{UOM_TYPE_LABELS[type] ?? type}</Text>
    </View>
  );
}

interface UnitsTableProps {
  data: UnitOfMeasure[];
  onRowPress?: (row: UnitOfMeasure) => void;
  itemsPerPage?: number;
  button?: Buttons[];
  actions?: Action<UnitOfMeasure>[];
}

export function UnitsTable({
  data,
  onRowPress,
  itemsPerPage = 8,
  button,
  actions,
}: UnitsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const validData = useMemo(() => data.filter((r) => r?.name != null), [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return validData;
    const term = search.toLowerCase();
    return validData.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        r.uom_type.toLowerCase().includes(term),
    );
  }, [validData, search]);

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
        <View style={{ flex: 1, marginRight: 12 }}>
          <AppInput
            placeholder="Buscar unidad, código…"
            value={search}
            onChangeText={setSearch}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        <HStack className="gap-3 items-center">
          {button?.map((btn, index) => (
            <AppButton
              key={btn.key ?? `btn-${index}`}
              label={btn.name}
              icon={btn.icon}
              outline
              outlineBorderColor="#949292"
              outlineTextColor="#000000"
              fullWidth={false}
              shrinkOnMobile
              onPress={btn.onPress}
            />
          ))}
        </HStack>
      </HStack>

      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 2 }}>Unidad</DataTable.Title>
          <DataTable.Title style={{ flex: 1, justifyContent: "center" }}>
            Código
          </DataTable.Title>
          <DataTable.Title style={{ flex: 1.2, justifyContent: "center" }}>
            Tipo
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
              <Text style={styles.muted}>Sin unidades</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => (
            <DataTable.Row
              key={row.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              <DataTable.Cell style={{ flex: 2 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {row.name}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell style={{ flex: 1, justifyContent: "center" }}>
                <Text style={styles.cell}>{row.code}</Text>
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  flex: 1.2,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <TypeBadge type={row.uom_type} />
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
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
  table: {
    backgroundColor: "#fff",
    borderColor: "#d4d4d4",
    borderWidth: 0.5,
    borderRadius: 15,
    marginBottom: 12,
  },
  headerRow: { borderBottomWidth: 0.5, borderBottomColor: "#d4d4d4" },
  row: { borderBottomWidth: 0.5, borderBottomColor: "#d4d4d4", minHeight: 56 },
  name: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  cell: { fontSize: 13, color: "#374151" },
  muted: { fontSize: 13, color: "#aaa" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "500" },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
  },
  typeBadgeText: { fontSize: 11, fontWeight: "500", color: "#4338ca" },
});
