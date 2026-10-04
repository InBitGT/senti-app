import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ingredient } from "@/src/types/ingredient/ingredient";
import { Plus, SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface IngredientTableProps {
  data: Ingredient[];
  actions?: Action<Ingredient>[];
  itemsPerPage?: number;
  onNewIngredient?: () => void;
  onRowPress?: (row: Ingredient) => void;
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

const formatCurrency = (value: number): string => `Q ${value.toFixed(2)}`;

export function IngredientTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewIngredient,
  onRowPress,
}: IngredientTableProps) {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const hasActions = actions !== undefined && actions.length > 0;

  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const filteredData = useMemo<Ingredient[]>(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      [
        item.name,
        item.sku,
        item.category_name,
        item.parent_category_name,
        item.brand,
        item.modifier_name,
      ].some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const from = safePage * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4 gap-2">
        <View className="flex-1 sm:w-64 sm:flex-none">
          <AppInput
            placeholder="Buscar ingrediente..."
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        {onNewIngredient && (
          <AppButton
            label="Crear ingrediente"
            icon={Plus}
            variant="black"
            fullWidth={false}
            shrinkOnMobile
            onPress={onNewIngredient}
          />
        )}
      </HStack>

      <DataTable style={tableStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>SKU</DataTable.Title>
          <DataTable.Title numeric>Costo</DataTable.Title>
          <DataTable.Title>Modificador</DataTable.Title>
          {hasActions && <DataTable.Title>Acciones</DataTable.Title>}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin ingredientes</Text>
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
                <Text
                  style={{ color: "#000000" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }} numberOfLines={1}>
                  {item.sku}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text style={{ color: "#000000" }}>
                  {formatCurrency(item.average_cost)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>
                  {item.is_modifier ? "Sí" : "No"}
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
