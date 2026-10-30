import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/src/store";
import { CashRegister } from "@/src/types/cash_register/cash_register";
import { Plus, SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface CashRegistersTableProps {
  data: CashRegister[];
  actions?: Action<CashRegister>[];
  itemsPerPage?: number;
  onNewCashRegister?: () => void;
  onRowPress?: (row: CashRegister) => void;
}

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

export function CashRegistersTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewCashRegister,
  onRowPress,
}: CashRegistersTableProps) {
  const { claims } = useAuthStore();
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const hasActions = actions !== undefined && actions.length > 0;

  const warehouseNameById = useMemo<Map<number, string>>(() => {
    const map = new Map<number, string>();
    claims?.branches?.forEach((branch) => {
      branch.warehouses.forEach((w) => {
        map.set(w.warehouse_id, w.warehouse_name);
      });
    });
    return map;
  }, [claims]);

  // La búsqueda reinicia la página en el mismo evento,
  // en lugar de hacerlo dentro de un useEffect.
  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const filteredData = useMemo<CashRegister[]>(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      [item.name, item.code, warehouseNameById.get(item.warehouse_id)].some(
        (val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(term),
      ),
    );
  }, [data, search, warehouseNameById]);

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
            placeholder="Buscar caja..."
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        {onNewCashRegister && (
          <AppButton
            label="Crear caja"
            icon={Plus}
            variant="black"
            fullWidth={false}
            shrinkOnMobile
            onPress={onNewCashRegister}
          />
        )}
      </HStack>

      <DataTable style={tableStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Código</DataTable.Title>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Bodega</DataTable.Title>
          {hasActions && <DataTable.Title>Acciones</DataTable.Title>}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin cajas registradas</Text>
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
                <Text style={{ color: "#000000" }}>{item.code}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{item.name}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>
                  {warehouseNameById.get(item.warehouse_id) ??
                    `#${item.warehouse_id}`}
                </Text>
              </DataTable.Cell>

              {hasActions && (
                <DataTable.Cell>
                  <ActionsMenu row={item} actions={actions ?? []} />
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
