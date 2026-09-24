import { AppButton } from "@/components/atom/AppButton/AppButton";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { CartLine } from "@/src/screen/pos/point_of_sales/point_of_sales";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { ShoppingCart } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CartLineRow } from "../CartLineRow/CartLineRow";

export function CartSidePanel({
  cart,
  maxQuantities,
  lineUnitPrices,
  lineTotals,
  lineIsWholesale,
  cartCount,
  total,
  onStepLine,
  onSetQty,
  onRemoveLine,
  onCheckout,
}: {
  cart: CartLine[];
  maxQuantities: number[];
  lineUnitPrices: number[];
  lineTotals: number[];
  lineIsWholesale: boolean[];
  cartCount: number;
  total: number;
  onStepLine: (index: number, direction: 1 | -1) => void;
  onSetQty: (index: number, raw: string) => void;
  onRemoveLine: (index: number) => void;
  onCheckout: () => void;
}) {
  const isEmpty = cart.length === 0;

  return (
    <VStack className="w-96 border-l border-gray-200 bg-white">
      <HStack className="items-center justify-between border-b border-gray-100 p-4">
        <HStack space="xs" className="items-center">
          <Icon as={ShoppingCart} size="sm" className="text-blue-600" />
          <Heading size="md" className="text-gray-900">
            Venta
          </Heading>
        </HStack>
        <Text className="text-xs text-gray-400">
          {cartCount} {cartCount === 1 ? "artículo" : "artículos"}
        </Text>
      </HStack>

      {isEmpty ? (
        // Fuera del ScrollView para que flex: 1 ocupe todo el alto libre
        <View style={styles.emptyContainer}>
          <EmptyHint icon={ShoppingCart} label="El carrito está vacío" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-3">
          <DesktopScrollView>
            <VStack space="md">
              {cart.map((line, index) => (
                <CartLineRow
                  key={`${line.product.product_id}-${line.unit.uom_id}`}
                  line={line}
                  index={index}
                  maxQuantity={maxQuantities[index] ?? 0}
                  unitPrice={lineUnitPrices[index] ?? 0}
                  total={lineTotals[index] ?? 0}
                  isWholesale={lineIsWholesale[index] ?? false}
                  onStepLine={onStepLine}
                  onSetQty={onSetQty}
                  onRemoveLine={onRemoveLine}
                />
              ))}
            </VStack>
          </DesktopScrollView>
        </ScrollView>
      )}

      {!isEmpty && (
        <VStack space="sm" className="border-t border-gray-100 p-4">
          <HStack className="items-center justify-between">
            <Text className="text-sm text-gray-600">Total</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {formatCurrency(total)}
            </Text>
          </HStack>
          <View>
            <AppButton
              label={`Cobrar ${formatCurrency(total)}`}
              variant="info"
              onPress={onCheckout}
            />
          </View>
        </VStack>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
