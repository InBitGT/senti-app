import { AppInput } from "@/components/atom/AppInput/AppInput";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { CartLine } from "@/src/screen/pos/point_of_sales/point_of_sales";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { Minus, Plus, Tag, Trash2 } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";

export function CartLineRow({
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
  line: CartLine;
  index: number;
  maxQuantity: number;
  unitPrice: number;
  total: number;
  isWholesale: boolean;
  onStepLine: (index: number, direction: 1 | -1) => void;
  onSetQty: (index: number, raw: string) => void;
  onRemoveLine: (index: number) => void;
}) {
  const atMax = line.quantity + line.unit.factorToBase > maxQuantity;

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
          <Text className="text-xs text-gray-400">
            {formatCurrency(unitPrice)}/{line.unit.code}
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
          <Text className="text-[11px] text-gray-400">{line.unit.code}</Text>
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
