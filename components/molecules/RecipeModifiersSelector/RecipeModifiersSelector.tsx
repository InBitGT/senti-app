import { AppInput } from "@/components/atom/AppInput/AppInput";
import { FilterPill } from "@/components/atom/FilterPill/FilterPill";
import { ResponsiveCardGrid } from "@/components/atom/ResponsiveCardGrid/ResponsiveCardGrid";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { RecipeModifierOption } from "@/src/types/recipe/recipe";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { Check, Search } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export interface RecipeModifiersSelectorProps {
  options: RecipeModifierOption[];
  value: number[];
  onChange: (value: number[]) => void;
}

/** Con más opciones que esto se muestra el buscador. */
const SEARCH_THRESHOLD = 6;
const FILTER_ALL = "__all__";
const FILTER_SELECTED = "__selected__";

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function formatAdjustment(amount: number): string {
  if (amount === 0) return "Sin costo extra";
  return `${amount > 0 ? "+" : "-"}${formatCurrency(Math.abs(amount))}`;
}

export function RecipeModifiersSelector({
  options,
  value,
  onChange,
}: RecipeModifiersSelectorProps) {
  const [search, setSearch] = React.useState<string>("");
  const [filter, setFilter] = React.useState<string>(FILTER_ALL);

  const selectedIds = React.useMemo<Set<number>>(() => new Set(value), [value]);

  const typeLabels = React.useMemo<string[]>(
    () => Array.from(new Set(options.map((option) => option.type_label))),
    [options],
  );

  const visibleOptions = React.useMemo<RecipeModifierOption[]>(() => {
    const query = normalize(search);
    return options.filter((option) => {
      if (filter === FILTER_SELECTED) {
        if (!selectedIds.has(option.product_modifier_id)) return false;
      } else if (filter !== FILTER_ALL && option.type_label !== filter) {
        return false;
      }
      return query.length === 0 || normalize(option.name).includes(query);
    });
  }, [options, search, filter, selectedIds]);

  const toggle = (id: number): void => {
    if (selectedIds.has(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }
    onChange([...value, id]);
  };

  const clearSelection = (): void => {
    onChange([]);
    if (filter === FILTER_SELECTED) setFilter(FILTER_ALL);
  };

  if (options.length === 0) {
    return (
      <Text size="sm" className="text-typography-400">
        No hay modificadores disponibles.
      </Text>
    );
  }

  return (
    <VStack space="md">
      <HStack style={styles.summaryRow}>
        <Text size="sm" style={{ color: "#555" }}>
          {value.length === 0
            ? `${options.length} disponibles · ninguno seleccionado`
            : `${value.length} de ${options.length} seleccionados`}
        </Text>
        {value.length > 0 && (
          <Pressable onPress={clearSelection} hitSlop={8}>
            <Text size="sm" style={styles.clearText}>
              Limpiar
            </Text>
          </Pressable>
        )}
      </HStack>

      {options.length > SEARCH_THRESHOLD && (
        <AppInput
          placeholder="Buscar modificador"
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color="#9ca3af" />}
        />
      )}

      <View style={styles.pills}>
        <FilterPill
          label="Todos"
          active={filter === FILTER_ALL}
          onPress={() => setFilter(FILTER_ALL)}
        />
        {typeLabels.length > 1 &&
          typeLabels.map((label) => (
            <FilterPill
              key={label}
              label={label}
              active={filter === label}
              onPress={() => setFilter(label)}
            />
          ))}
        <FilterPill
          label={`Seleccionados (${value.length})`}
          active={filter === FILTER_SELECTED}
          onPress={() => setFilter(FILTER_SELECTED)}
        />
      </View>

      {visibleOptions.length === 0 ? (
        <Text size="sm" className="text-typography-400">
          {filter === FILTER_SELECTED
            ? "Aún no has seleccionado modificadores."
            : "No hay modificadores que coincidan con la búsqueda."}
        </Text>
      ) : (
        <ResponsiveCardGrid gap={8}>
          {visibleOptions.map((option) => {
            const isSelected = selectedIds.has(option.product_modifier_id);
            return (
              <Pressable
                key={option.product_modifier_id}
                onPress={() => toggle(option.product_modifier_id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={option.name}
                style={[styles.tile, isSelected && styles.tileSelected]}
              >
                <View
                  style={[styles.checkbox, isSelected && styles.checkboxOn]}
                >
                  {isSelected && (
                    <Icon as={Check} size="xs" style={{ color: "#fff" }} />
                  )}
                </View>
                <VStack style={styles.tileText}>
                  <Text
                    numberOfLines={1}
                    style={{ color: "#000", fontWeight: "500" }}
                  >
                    {option.name}
                  </Text>
                  <Text
                    size="xs"
                    numberOfLines={1}
                    className="text-typography-400"
                  >
                    {option.type_label} ·{" "}
                    {formatAdjustment(option.price_adjustment)}
                  </Text>
                </VStack>
              </Pressable>
            );
          })}
        </ResponsiveCardGrid>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearText: {
    color: "#0C447C",
    fontWeight: "600",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  tileSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    borderColor: "#0C447C",
    backgroundColor: "#0C447C",
  },
  tileText: {
    flex: 1,
    minWidth: 0,
  },
});
