import { AppInput } from "@/components/atom/AppInput/AppInput";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { RecipeCartLine } from "@/src/store/useRecipeCartStore/useRecipeCartStore";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { Minus, Plus, Tag, Trash2 } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";

function modifiersLabel(line: RecipeCartLine): string {
  const counts = new Map<string, number>();
  line.modifiers.forEach((modifier) => {
    counts.set(modifier.name, (counts.get(modifier.name) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => (count > 1 ? `${name} ×${count}` : name))
    .join(", ");
}

export function RecipeCartLineRow({
  line,
  index,
  maxQuantity,
  unitPrice,
  total,
  isWholesale,
  onStepLine,
  onSetQty,
  onRemoveLine,
}: {
  line: RecipeCartLine;
  index: number;
  maxQuantity: number;
  unitPrice: number;
  total: number;
  isWholesale: boolean;
  onStepLine: (index: number, direction: 1 | -1) => void;
  onSetQty: (index: number, raw: string) => void;
  onRemoveLine: (index: number) => void;
}) {
  const atMax = line.quantity + 1 > maxQuantity;

  return (
    <VStack space="xs" className="border-b border-gray-100 pb-3">
      <HStack className="items-center justify-between" space="sm">
        <VStack className="flex-1">
          <HStack space="xs" className="items-center">
            <Text
              className="text-sm font-medium text-gray-900"
              numberOfLines={1}
            >
              {line.product.name}
            </Text>
            {isWholesale && (
              <Box className="rounded-full bg-green-100 px-1.5 py-0.5">
                <Icon as={Tag} size="xs" className={"text-green-600"} />
              </Box>
            )}
          </HStack>
          {!!line.variant && (
            <Text className="text-xs text-purple-700">{line.variant.name}</Text>
          )}
          {line.modifiers.length > 0 && (
            <Text className="text-xs text-amber-700" numberOfLines={2}>
              + {modifiersLabel(line)}
            </Text>
          )}
          {!!line.notes && (
            <Text className="text-xs italic text-gray-500" numberOfLines={2}>
              {line.notes}
            </Text>
          )}
          <Text className="text-xs text-gray-400">
            {formatCurrency(unitPrice)} c/u
          </Text>
        </VStack>

        <HStack space="xs" className="items-center">
          <TouchableOpacity onPress={() => onStepLine(index, -1)}>
            <Box className="h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white">
              <Icon as={Minus} size="xs" className="text-gray-600" />
            </Box>
          </TouchableOpacity>

          <AppInput
            value={String(line.quantity)}
            onChangeText={(v) => onSetQty(index, v)}
            keyboardType="numeric"
            selectTextOnFocus
            containerStyle={{ width: 48 }}
            inputStyle={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: "500",
              paddingVertical: 6,
              paddingHorizontal: 4,
            }}
            clearable={false}
          />

          <TouchableOpacity
            onPress={() => onStepLine(index, 1)}
            disabled={atMax}
          >
            <Box
              className={`h-7 w-7 items-center justify-center rounded-md border ${
                atMax
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Icon
                as={Plus}
                size="xs"
                className={atMax ? "text-gray-300" : "text-gray-600"}
              />
            </Box>
          </TouchableOpacity>
        </HStack>

        <Text className="w-16 text-right text-sm font-semibold text-gray-900">
          {formatCurrency(total)}
        </Text>

        <TouchableOpacity onPress={() => onRemoveLine(index)}>
          <Icon as={Trash2} size="xs" className="text-red-500" />
        </TouchableOpacity>
      </HStack>

      {atMax && (
        <Text className="text-[10px] font-medium text-amber-600">
          Alcanzaste el stock disponible de &quot;{line.product.name}&quot;.
        </Text>
      )}
    </VStack>
  );
}
