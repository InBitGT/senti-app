import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { VStack } from "@/components/ui/vstack";
import {
  ApiRecipeCatalogProduct,
  RecipeCatalogModifier,
  RecipeCatalogVariant,
} from "@/src/types/recipe_pos/recipe_pos";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import {
  recipeModifiersMaxQty,
  recipeUnitPrice,
} from "@/src/utils/recipePos/recipePos";
import { Minus, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export interface RecipeAddSelection {
  variant: RecipeCatalogVariant | null;
  modifiers: RecipeCatalogModifier[];
  notes: string;
  quantity: number;
}

function formatAdjustment(amount: number): string {
  if (amount === 0) return "";
  return amount > 0
    ? ` (+${formatCurrency(amount)})`
    : ` (-${formatCurrency(Math.abs(amount))})`;
}

export function RecipeAddModal({
  isOpen,
  onClose,
  product,
  getRemaining,
  getModifierRemaining,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ApiRecipeCatalogProduct;
  getRemaining: (variant: RecipeCatalogVariant | null) => number;
  getModifierRemaining: (modifier: RecipeCatalogModifier) => number;
  onConfirm: (selection: RecipeAddSelection) => void;
}) {
  const hasVariants = product.variants.length > 0;

  const [variantId, setVariantId] = useState<string>("");
  const [modifierCounts, setModifierCounts] = useState<Record<number, number>>(
    () =>
      Object.fromEntries(
        product.modifiers.map((modifier) => [
          modifier.product_modifier_id,
          Math.max(modifier.min_selection, modifier.is_default ? 1 : 0),
        ]),
      ),
  );
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const variant =
    product.variants.find((item) => String(item.id) === variantId) ?? null;

  const selectedModifiers = product.modifiers.flatMap((modifier) =>
    Array.from(
      { length: modifierCounts[modifier.product_modifier_id] ?? 0 },
      () => modifier,
    ),
  );

  const recipeRemaining = hasVariants && !variant ? 0 : getRemaining(variant);
  const remaining = Math.min(
    recipeRemaining,
    recipeModifiersMaxQty(selectedModifiers, getModifierRemaining),
  );

  const variantOptions = product.variants
    .filter((item) => getRemaining(item) > 0)
    .map((item) => ({
      label: `${item.name}${formatAdjustment(item.price_adjustment)} · ${getRemaining(item)} disp.`,
      value: String(item.id),
    }));

  const unitPrice = recipeUnitPrice({
    product,
    variant,
    modifiers: selectedModifiers,
    wholesaleActive: false,
  });

  const parsedQty = Number.parseInt(quantity.replace(/[^0-9]/g, ""), 10) || 0;

  function setModifierCount(modifier: RecipeCatalogModifier, count: number) {
    const max = Math.max(1, modifier.max_selection);
    if (count < modifier.min_selection || count > max) return;
    const current = modifierCounts[modifier.product_modifier_id] ?? 0;
    if (
      count > current &&
      count * modifier.quantity * Math.max(parsedQty, 1) >
        getModifierRemaining(modifier)
    ) {
      return;
    }
    setModifierCounts((prev) => ({
      ...prev,
      [modifier.product_modifier_id]: count,
    }));
  }

  function canIncrease(modifier: RecipeCatalogModifier): boolean {
    const next = (modifierCounts[modifier.product_modifier_id] ?? 0) + 1;
    return (
      next <= Math.max(1, modifier.max_selection) &&
      next * modifier.quantity * Math.max(parsedQty, 1) <=
        getModifierRemaining(modifier)
    );
  }

  function stockHint(modifier: RecipeCatalogModifier): string {
    const modifierRemaining = getModifierRemaining(modifier);
    if (modifierRemaining < modifier.quantity) return " · Agotado";
    if (
      (modifierCounts[modifier.product_modifier_id] ?? 0) === 0 &&
      !canIncrease(modifier)
    ) {
      return ` · Solo alcanza para ${Math.floor(modifierRemaining / modifier.quantity)}`;
    }
    return "";
  }

  function stepQty(direction: 1 | -1) {
    const next = parsedQty + direction;
    if (next < 1) return;
    if (direction === 1 && next > remaining) return;
    setQuantity(String(next));
  }

  function handleConfirm() {
    if (hasVariants && !variant) {
      setError("Selecciona una variante.");
      return;
    }
    if (parsedQty < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }
    const missingModifier = product.modifiers.find(
      (modifier) =>
        (modifierCounts[modifier.product_modifier_id] ?? 0) *
          modifier.quantity *
          parsedQty >
        getModifierRemaining(modifier),
    );
    if (missingModifier) {
      setError(`No hay suficiente "${missingModifier.name}" en inventario.`);
      return;
    }
    if (parsedQty > remaining) {
      setError(`Solo hay ${remaining} disponibles.`);
      return;
    }
    onConfirm({
      variant,
      modifiers: selectedModifiers,
      notes: notes.trim(),
      quantity: parsedQty,
    });
  }

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
            <VStack className="flex-1">
              <Heading size="md" className="text-gray-900">
                {product.name}
              </Heading>
              <Text className="text-xs text-gray-400">{product.sku}</Text>
            </VStack>
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size="xl" className="text-gray-400 p-4" />
            </TouchableOpacity>
          </ModalHeader>

          <ModalBody>
            <ScrollView
              style={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <VStack space="lg">
                {hasVariants && (
                  <AppSelect
                    label="Variante"
                    placeholder="Selecciona una variante"
                    searchable={false}
                    options={variantOptions}
                    value={variantId}
                    onChange={(value) => {
                      setVariantId(value);
                      setQuantity("1");
                      setError(null);
                    }}
                  />
                )}

                {product.modifiers.length > 0 && (
                  <VStack space="sm">
                    <Text className="text-sm font-semibold text-gray-900">
                      Extras
                    </Text>
                    {product.modifiers.map((modifier) => (
                      <HStack
                        key={modifier.product_modifier_id}
                        className="items-center justify-between border-b border-gray-100 py-2"
                      >
                        <VStack className="flex-1">
                          <Text className="text-sm text-gray-900">
                            {modifier.name}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {modifier.price_adjustment > 0
                              ? `+${formatCurrency(modifier.price_adjustment)}`
                              : "Sin costo"}
                            {modifier.min_selection > 0 ? " · obligatorio" : ""}
                            {modifier.max_selection > 1
                              ? ` · máx. ${modifier.max_selection}`
                              : ""}
                            {stockHint(modifier)}
                          </Text>
                        </VStack>
                        {modifier.max_selection > 1 ? (
                          <HStack space="xs" className="items-center">
                            <TouchableOpacity
                              onPress={() =>
                                setModifierCount(
                                  modifier,
                                  (modifierCounts[
                                    modifier.product_modifier_id
                                  ] ?? 0) - 1,
                                )
                              }
                            >
                              <Box className="h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white">
                                <Icon
                                  as={Minus}
                                  size="xs"
                                  className="text-gray-600"
                                />
                              </Box>
                            </TouchableOpacity>
                            <Text className="w-6 text-center text-sm font-medium text-gray-900">
                              {modifierCounts[modifier.product_modifier_id] ??
                                0}
                            </Text>
                            <TouchableOpacity
                              disabled={!canIncrease(modifier)}
                              onPress={() =>
                                setModifierCount(
                                  modifier,
                                  (modifierCounts[
                                    modifier.product_modifier_id
                                  ] ?? 0) + 1,
                                )
                              }
                            >
                              <Box className="h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white">
                                <Icon
                                  as={Plus}
                                  size="xs"
                                  className={
                                    canIncrease(modifier)
                                      ? "text-gray-600"
                                      : "text-gray-300"
                                  }
                                />
                              </Box>
                            </TouchableOpacity>
                          </HStack>
                        ) : (
                          <Switch
                            value={
                              (modifierCounts[modifier.product_modifier_id] ??
                                0) > 0
                            }
                            isDisabled={
                              (modifierCounts[modifier.product_modifier_id] ??
                                0) === 0 && !canIncrease(modifier)
                            }
                            onValueChange={(isOn: boolean) =>
                              setModifierCount(modifier, isOn ? 1 : 0)
                            }
                          />
                        )}
                      </HStack>
                    ))}
                  </VStack>
                )}

                <AppInput
                  label="Notas (opcional)"
                  placeholder="Ej. Sin cebolla"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textareaHeight={70}
                />

                <HStack className="items-center justify-between">
                  <Text className="text-sm font-semibold text-gray-900">
                    Cantidad
                  </Text>
                  <HStack space="xs" className="items-center">
                    <TouchableOpacity onPress={() => stepQty(-1)}>
                      <Box className="h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white">
                        <Icon as={Minus} size="xs" className="text-gray-600" />
                      </Box>
                    </TouchableOpacity>
                    <AppInput
                      value={quantity}
                      onChangeText={(value) => {
                        setQuantity(value.replace(/[^0-9]/g, ""));
                        setError(null);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                      containerStyle={{ width: 56 }}
                      inputStyle={{
                        textAlign: "center",
                        fontSize: 14,
                        fontWeight: "500",
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                      }}
                      clearable={false}
                    />
                    <TouchableOpacity onPress={() => stepQty(1)}>
                      <Box className="h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white">
                        <Icon as={Plus} size="xs" className="text-gray-600" />
                      </Box>
                    </TouchableOpacity>
                  </HStack>
                </HStack>

                {(!hasVariants || variant) && (
                  <Text className="text-xs text-gray-400">
                    {remaining} disponibles
                  </Text>
                )}

                {!!error && (
                  <Text className="text-xs font-medium text-red-600">
                    {error}
                  </Text>
                )}
              </VStack>
            </ScrollView>
          </ModalBody>

          <ModalFooter className="flex-col items-stretch gap-3">
            <HStack className="items-center justify-between">
              <Text className="text-sm text-gray-600">
                {formatCurrency(unitPrice)} c/u
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                {formatCurrency(unitPrice * parsedQty)}
              </Text>
            </HStack>
            <HStack space="sm">
              <Box className="flex-1">
                <AppButton
                  label="Cancelar"
                  variant="black"
                  outline
                  onPress={onClose}
                />
              </Box>
              <Box className="flex-1">
                <AppButton
                  label="Agregar al carrito"
                  variant="info"
                  icon={Plus}
                  onPress={handleConfirm}
                />
              </Box>
            </HStack>
          </ModalFooter>
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
});
