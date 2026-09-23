import { AppButton } from "@/components/atom/AppButton/AppButton";
import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@/components/ui/modal";
import { VStack } from "@/components/ui/vstack";
import { CartLine } from "@/src/screen/pos/point_of_sales/point_of_sales";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { ShoppingCart, X } from "lucide-react-native";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { CartLineRow } from "../CartLineRow/CartLineRow";

export function CartModal({
  isOpen,
  onClose,
  cart,
  maxQuantities,
  lineUnitPrices,
  lineTotals,
  lineIsWholesale,
  total,
  onStepLine,
  onSetQty,
  onRemoveLine,
  onCheckout,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartLine[];
  maxQuantities: number[];
  lineUnitPrices: number[];
  lineTotals: number[];
  lineIsWholesale: boolean[];
  total: number;
  onStepLine: (index: number, direction: 1 | -1) => void;
  onSetQty: (index: number, raw: string) => void;
  onRemoveLine: (index: number) => void;
  onCheckout: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        pointerEvents="box-none"
      >
        <ModalContent className="bg-white" style={styles.content}>
          <ModalHeader className="items-center justify-between">
            <Heading size="md" className="text-gray-900">
              Carrito
            </Heading>
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size="xl" className="text-gray-400 p-4" />
            </TouchableOpacity>
          </ModalHeader>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator
          >
            {cart.length === 0 ? (
              <EmptyHint icon={ShoppingCart} label="El carrito está vacío" />
            ) : (
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
            )}
          </ScrollView>

          {cart.length > 0 && (
            <ModalFooter className="flex-col items-stretch gap-3">
              <HStack className="items-center justify-between">
                <Text className="text-sm text-gray-600">Total</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatCurrency(total)}
                </Text>
              </HStack>
              <AppButton
                label={`Cobrar ${formatCurrency(total)}`}
                variant="info"
                onPress={onCheckout}
              />
            </ModalFooter>
          )}
        </ModalContent>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    maxHeight: "85%",
    flexDirection: "column",
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
});
