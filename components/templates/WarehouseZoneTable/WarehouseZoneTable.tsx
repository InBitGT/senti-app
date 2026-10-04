import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { WarehouseZone } from "@/src/types/warehouse_zone/warehouse_zone";
import { Plus, SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface WarehouseZonesTableProps {
  data: WarehouseZone[];
  actions?: Action<WarehouseZone>[];
  itemsPerPage?: number;
  onNewZone?: () => void;
  onRowPress?: (row: WarehouseZone) => void;
}

const ZONE_TYPE_LABELS: Record<string, string> = {
  zone: "Zona",
  aisle: "Pasillo",
  shelf: "Estante",
  rack: "Rack",
  bin: "Contenedor",
};

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

const getZoneTypeLabel = (type: string): string =>
  ZONE_TYPE_LABELS[type] ?? type;

export function WarehouseZonesTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewZone,
  onRowPress,
}: WarehouseZonesTableProps) {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const hasActions = actions !== undefined && actions.length > 0;

  // La búsqueda reinicia la página en el mismo evento,
  // en lugar de hacerlo dentro de un useEffect.
  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const filteredData = useMemo<WarehouseZone[]>(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((zone) =>
      [
        zone.name,
        zone.code,
        zone.parent_zone?.name,
        getZoneTypeLabel(zone.zone_type),
      ].some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  // Valor derivado: si los datos cambian y la página queda fuera de rango,
  // se ajusta sin necesidad de un efecto.
  const safePage = Math.min(page, totalPages - 1);
  const from = safePage * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4 gap-2">
        <View className="flex-1 sm:w-64 sm:flex-none">
          <AppInput
            placeholder="Buscar zona..."
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        {onNewZone && (
          <AppButton
            label="Crear zona"
            icon={Plus}
            variant="black"
            fullWidth={false}
            shrinkOnMobile
            onPress={onNewZone}
          />
        )}
      </HStack>

      <DataTable style={tableStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Código</DataTable.Title>
          <DataTable.Title>Tipo</DataTable.Title>
          <DataTable.Title>Zona padre</DataTable.Title>
          {hasActions && <DataTable.Title>Acciones</DataTable.Title>}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin zonas</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((zone) => (
            <DataTable.Row
              key={zone.id}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(zone) : undefined}
            >
              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{zone.name}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{zone.code}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>
                  {getZoneTypeLabel(zone.zone_type)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>
                  {zone.parent_zone?.name ?? "(raíz)"}
                </Text>
              </DataTable.Cell>

              {hasActions && (
                <DataTable.Cell>
                  <ActionsMenu row={zone} actions={actions ?? []} />
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
