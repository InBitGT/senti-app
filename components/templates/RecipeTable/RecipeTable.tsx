import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Recipe } from "@/src/types/recipe/recipe";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { Plus, SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface RecipeTableProps {
  data: Recipe[];
  actions?: Action<Recipe>[];
  itemsPerPage?: number;
  onNewRecipe?: () => void;
  onRowPress?: (row: Recipe) => void;
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

const rowStyle: ViewStyle = {
  ...rowBorder,
  minHeight: 60,
  paddingVertical: 6,
};

const nameColumn: ViewStyle = { flex: 2 };
const smallColumn: ViewStyle = { flex: 1 };

const primaryText: TextStyle = { color: "#000000" };
const mutedText: TextStyle = { color: "#9ca3af" };

const getPriceLabel = (item: Recipe): string => {
  if (item.product.has_variable_price) return "Variable";
  if (item.price) return formatCurrency(item.price.amount);
  return "Sin precio";
};

const getCountLabel = (
  count: number,
  singular: string,
  plural: string,
): string => {
  if (count === 0) return "—";
  return `${count} ${count === 1 ? singular : plural}`;
};

const getRecipeLabel = (item: Recipe): string => {
  if (!item.recipe) return "—";
  const total = item.recipe.ingredients.length;
  if (total === 0) return "Vacía";
  return getCountLabel(total, "ingr.", "ingr.");
};

export function RecipeTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewRecipe,
  onRowPress,
}: RecipeTableProps) {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const hasActions = actions !== undefined && actions.length > 0;

  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const filteredData = useMemo<Recipe[]>(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(({ product }) =>
      [product.name, product.sku, product.brand, product.barcode].some((val) =>
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
            placeholder="Buscar por nombre, SKU o marca..."
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        {onNewRecipe && (
          <AppButton
            label="Crear receta"
            icon={Plus}
            variant="black"
            fullWidth={false}
            shrinkOnMobile
            onPress={onNewRecipe}
          />
        )}
      </HStack>

      <DataTable style={tableStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title style={nameColumn}>Receta</DataTable.Title>
          <DataTable.Title style={smallColumn} numeric>
            Precio
          </DataTable.Title>
          <DataTable.Title style={smallColumn}>Variantes</DataTable.Title>
          <DataTable.Title style={smallColumn}>Extras</DataTable.Title>
          <DataTable.Title style={smallColumn}>Ingredientes</DataTable.Title>
          {hasActions && (
            <DataTable.Title style={smallColumn}>Acciones</DataTable.Title>
          )}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin recetas</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((item) => (
            <DataTable.Row
              key={item.product.id}
              style={rowStyle}
              onPress={onRowPress ? () => onRowPress(item) : undefined}
            >
              <DataTable.Cell style={nameColumn}>
                <VStack>
                  <Text
                    style={primaryText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.product.name}
                  </Text>
                  <Text size="xs" style={mutedText} numberOfLines={1}>
                    {item.product.sku}
                  </Text>
                </VStack>
              </DataTable.Cell>

              <DataTable.Cell style={smallColumn} numeric>
                <Text
                  style={
                    item.price || item.product.has_variable_price
                      ? primaryText
                      : mutedText
                  }
                >
                  {getPriceLabel(item)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell style={smallColumn}>
                <Text
                  style={item.variants.length > 0 ? primaryText : mutedText}
                >
                  {getCountLabel(item.variants.length, "variante", "variantes")}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell style={smallColumn}>
                <Text
                  style={item.modifiers.length > 0 ? primaryText : mutedText}
                >
                  {getCountLabel(item.modifiers.length, "extra", "extras")}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell style={smallColumn}>
                <Text style={item.recipe ? primaryText : mutedText}>
                  {getRecipeLabel(item)}
                </Text>
              </DataTable.Cell>

              {hasActions && (
                <DataTable.Cell style={smallColumn}>
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
