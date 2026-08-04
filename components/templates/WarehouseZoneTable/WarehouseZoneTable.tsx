import { Action, ActionsMenu } from "@/components/atom";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { WarehouseZone } from "@/src/types/warehouse_zone/warehouse_zone";
import { Plus, SearchIcon } from "lucide-react-native";
import React, { useState } from "react";
import { ViewStyle } from "react-native";
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

export function WarehouseZonesTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewZone,
  onRowPress,
}: WarehouseZonesTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((zone) =>
      [zone.name, zone.code, zone.parent_zone?.name].some((val) =>
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
  }, [search]);

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
            placeholder="Buscar zona..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        {onNewZone && (
          <Button
            size="md"
            variant="solid"
            style={{ borderColor: "#d4d4d4", borderWidth: 1 }}
            className="px-3 sm:px-4"
            onPress={onNewZone}
          >
            <Plus size={16} color="#ffffff" className="sm:hidden" />
            <ButtonText className="hidden sm:flex">Crear zona</ButtonText>
          </Button>
        )}
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Código</DataTable.Title>
          <DataTable.Title>Tipo</DataTable.Title>
          <DataTable.Title>Zona padre</DataTable.Title>
          {actions && actions.length > 0 && (
            <DataTable.Title>Acciones</DataTable.Title>
          )}
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
                  {ZONE_TYPE_LABELS[zone.zone_type] ?? zone.zone_type}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>
                  {zone.parent_zone?.name ?? "(raíz)"}
                </Text>
              </DataTable.Cell>

              {actions && actions.length > 0 && (
                <DataTable.Cell>
                  <ActionsMenu row={zone} actions={actions} />
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
