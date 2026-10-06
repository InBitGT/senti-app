import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
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
import { Check, Minus, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface RecipeAddSelection {
  variant: RecipeCatalogVariant | null;
  modifiers: RecipeCatalogModifier[];
  notes: string;
  quantity: number;
}

export interface RecipeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ApiRecipeCatalogProduct;
  getRemaining: (variant: RecipeCatalogVariant | null) => number;
  getModifierRemaining: (modifier: RecipeCatalogModifier) => number;
  onConfirm: (selection: RecipeAddSelection) => void;
}

const COLORS = {
  text: "#111827",
  muted: "#6B7280",
  faint: "#9CA3AF",
  border: "#E5E7EB",
  accent: "#0EA5E9",
  accentDark: "#0C447C",
  accentSoft: "#F0F9FF",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  warning: "#B45309",
};

/** Ancho mínimo de cada tarjeta: define cuántas caben por fila dentro del modal. */
const MIN_TILE_WIDTH = 150;
const TILE_GAP = 8;
/** Con poco stock se avisa en la tarjeta. */
const LOW_STOCK = 5;

function formatAdjustment(amount: number): string {
  if (amount === 0) return "Sin costo extra";
  return `${amount > 0 ? "+" : "-"}${formatCurrency(Math.abs(amount))}`;
}

/** Cuadrícula que ajusta las columnas al ancho real del modal. */
function TileGrid({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number>(0);
  const items = React.Children.toArray(children);

  const columns =
    width === 0
      ? 1
      : Math.max(
          1,
          Math.floor((width + TILE_GAP) / (MIN_TILE_WIDTH + TILE_GAP)),
        );
  const itemWidth =
    width === 0 ? "100%" : (width - TILE_GAP * (columns - 1)) / columns;

  const handleLayout = (event: LayoutChangeEvent): void => {
    const next = event.nativeEvent.layout.width;
    if (next !== width) setWidth(next);
  };

  return (
    <View onLayout={handleLayout} style={styles.grid}>
      {items.map((child, index) => (
        <View
          key={React.isValidElement(child) && child.key ? child.key : index}
          style={{ width: itemWidth }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

function SectionHeader({
  step,
  title,
  hint,
  required,
}: {
  step: number;
  title: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <HStack style={styles.sectionHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>{step}</Text>
      </View>
      <VStack style={{ flex: 1 }}>
        <HStack style={{ alignItems: "center", gap: 6 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {required && <Text style={styles.requiredTag}>Obligatorio</Text>}
        </HStack>
        {!!hint && <Text style={styles.sectionHint}>{hint}</Text>}
      </VStack>
    </HStack>
  );
}

function Stepper({
  value,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
  size = "sm",
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
  size?: "sm" | "lg";
}) {
  const buttonStyle = size === "lg" ? styles.stepBtnLg : styles.stepBtn;
  return (
    <HStack style={styles.stepper}>
      <Pressable
        onPress={onDecrease}
        disabled={!canDecrease}
        hitSlop={6}
        accessibilityLabel="Disminuir"
        style={[buttonStyle, !canDecrease && styles.stepBtnDisabled]}
      >
        <Icon
          as={Minus}
          size={size === "lg" ? "sm" : "xs"}
          style={{ color: canDecrease ? COLORS.accentDark : COLORS.faint }}
        />
      </Pressable>
      <Text style={size === "lg" ? styles.stepValueLg : styles.stepValue}>
        {value}
      </Text>
      <Pressable
        onPress={onIncrease}
        disabled={!canIncrease}
        hitSlop={6}
        accessibilityLabel="Aumentar"
        style={[buttonStyle, !canIncrease && styles.stepBtnDisabled]}
      >
        <Icon
          as={Plus}
          size={size === "lg" ? "sm" : "xs"}
          style={{ color: canIncrease ? COLORS.accentDark : COLORS.faint }}
        />
      </Pressable>
    </HStack>
  );
}

export function RecipeAddModal({
  isOpen,
  onClose,
  product,
  getRemaining,
  getModifierRemaining,
  onConfirm,
}: RecipeAddModalProps) {
  const hasVariants = product.variants.length > 0;
  const hasModifiers = product.modifiers.length > 0;

  const [variantId, setVariantId] = useState<number | null>(() => {
    // Si solo hay una variante con existencias, se preselecciona.
    const available = product.variants.filter((item) => getRemaining(item) > 0);
    return available.length === 1 ? available[0].id : null;
  });
  const [modifierCounts, setModifierCounts] = useState<Record<number, number>>(
    () =>
      Object.fromEntries(
        product.modifiers.map((modifier) => [
          modifier.product_modifier_id,
          Math.max(modifier.min_selection, modifier.is_default ? 1 : 0),
        ]),
      ),
  );
  const [notes, setNotes] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const variant =
    product.variants.find((item) => item.id === variantId) ?? null;

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

  const unitPrice = recipeUnitPrice({
    product,
    variant,
    modifiers: selectedModifiers,
    wholesaleActive: false,
  });

  const needsVariant = hasVariants && !variant;
  const outOfStock = !needsVariant && remaining < 1;

  const countOf = (modifier: RecipeCatalogModifier): number =>
    modifierCounts[modifier.product_modifier_id] ?? 0;

  function canIncrease(modifier: RecipeCatalogModifier): boolean {
    const next = countOf(modifier) + 1;
    return (
      next <= Math.max(1, modifier.max_selection) &&
      next * modifier.quantity * Math.max(quantity, 1) <=
        getModifierRemaining(modifier)
    );
  }

  function setModifierCount(modifier: RecipeCatalogModifier, count: number) {
    const max = Math.max(1, modifier.max_selection);
    if (count < modifier.min_selection || count > max) return;
    if (count > countOf(modifier) && !canIncrease(modifier)) return;
    setError(null);
    setModifierCounts((prev) => ({
      ...prev,
      [modifier.product_modifier_id]: count,
    }));
  }

  function modifierStatus(modifier: RecipeCatalogModifier): string | null {
    const modifierRemaining = getModifierRemaining(modifier);
    if (modifierRemaining < modifier.quantity) return "Agotado";
    if (countOf(modifier) === 0 && !canIncrease(modifier)) {
      return `Alcanza para ${Math.floor(modifierRemaining / modifier.quantity)}`;
    }
    return null;
  }

  function selectVariant(item: RecipeCatalogVariant) {
    if (getRemaining(item) < 1) return;
    setVariantId(item.id);
    setQuantity(1);
    setError(null);
  }

  function stepQty(direction: 1 | -1) {
    const next = quantity + direction;
    if (next < 1) return;
    if (direction === 1 && next > remaining) return;
    setQuantity(next);
    setError(null);
  }

  function handleConfirm() {
    if (needsVariant) {
      setError("Elige una opción para continuar.");
      return;
    }
    const missingModifier = product.modifiers.find(
      (modifier) =>
        countOf(modifier) * modifier.quantity * quantity >
        getModifierRemaining(modifier),
    );
    if (missingModifier) {
      setError(`No hay suficiente "${missingModifier.name}" en inventario.`);
      return;
    }
    if (quantity > remaining) {
      setError(`Solo hay ${remaining} disponibles.`);
      return;
    }
    onConfirm({
      variant,
      modifiers: selectedModifiers,
      notes: notes.trim(),
      quantity,
    });
  }

  let step = 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        pointerEvents="box-none"
      >
        <ModalContent className="bg-white" style={styles.content}>
          <ModalHeader style={styles.header}>
            <VStack style={{ flex: 1 }}>
              <Text style={styles.category}>{product.category_name}</Text>
              <Heading size="lg" style={{ color: COLORS.text }}>
                {product.name}
              </Heading>
              <Text style={styles.basePrice}>
                Desde{" "}
                {formatCurrency(
                  recipeUnitPrice({
                    product,
                    variant: null,
                    modifiers: [],
                    wholesaleActive: false,
                  }),
                )}
              </Text>
            </VStack>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityLabel="Cerrar"
              style={styles.closeBtn}
            >
              <Icon as={X} size="md" style={{ color: COLORS.muted }} />
            </Pressable>
          </ModalHeader>

          <ModalBody>
            <ScrollView
              style={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <VStack style={{ gap: 22 }}>
                {/* ---------- Variante ---------- */}
                {hasVariants && (
                  <VStack style={{ gap: 10 }}>
                    <SectionHeader
                      step={++step}
                      title="Elige una opción"
                      required
                    />
                    <TileGrid>
                      {product.variants.map((item) => {
                        const stock = getRemaining(item);
                        const isSoldOut = stock < 1;
                        const isSelected = item.id === variantId;
                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => selectVariant(item)}
                            disabled={isSoldOut}
                            accessibilityRole="radio"
                            accessibilityState={{
                              selected: isSelected,
                              disabled: isSoldOut,
                            }}
                            style={[
                              styles.tile,
                              isSelected && styles.tileSelected,
                              isSoldOut && styles.tileDisabled,
                            ]}
                          >
                            <HStack style={styles.tileTop}>
                              <Text
                                numberOfLines={2}
                                style={[
                                  styles.tileTitle,
                                  isSoldOut && { color: COLORS.faint },
                                ]}
                              >
                                {item.name}
                              </Text>
                              <View
                                style={[
                                  styles.radio,
                                  isSelected && styles.radioOn,
                                ]}
                              >
                                {isSelected && <View style={styles.radioDot} />}
                              </View>
                            </HStack>
                            <Text
                              style={[
                                styles.tilePrice,
                                isSelected && { color: COLORS.accentDark },
                              ]}
                            >
                              {formatAdjustment(item.price_adjustment)}
                            </Text>
                            <Text
                              style={[
                                styles.tileMeta,
                                isSoldOut && { color: COLORS.danger },
                                !isSoldOut &&
                                  stock <= LOW_STOCK && {
                                    color: COLORS.warning,
                                  },
                              ]}
                            >
                              {isSoldOut
                                ? "Agotado"
                                : stock <= LOW_STOCK
                                  ? `¡Quedan ${stock}!`
                                  : `${stock} disponibles`}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </TileGrid>
                  </VStack>
                )}

                {/* ---------- Extras ---------- */}
                {hasModifiers && (
                  <VStack style={{ gap: 10 }}>
                    <SectionHeader
                      step={++step}
                      title="Agrega extras"
                      hint="Toca para agregar o quitar"
                    />
                    <TileGrid>
                      {product.modifiers.map((modifier) => {
                        const count = countOf(modifier);
                        const isSelected = count > 0;
                        const isMulti = modifier.max_selection > 1;
                        const status = modifierStatus(modifier);
                        const isBlocked = !isSelected && !canIncrease(modifier);
                        const isRequired = modifier.min_selection > 0;

                        const onTilePress = (): void => {
                          if (isMulti) {
                            if (count === 0) setModifierCount(modifier, 1);
                            return;
                          }
                          setModifierCount(modifier, isSelected ? 0 : 1);
                        };

                        return (
                          <Pressable
                            key={modifier.product_modifier_id}
                            onPress={onTilePress}
                            disabled={isBlocked}
                            accessibilityRole="checkbox"
                            accessibilityState={{
                              checked: isSelected,
                              disabled: isBlocked,
                            }}
                            style={[
                              styles.tile,
                              isSelected && styles.tileSelected,
                              isBlocked && styles.tileDisabled,
                            ]}
                          >
                            <HStack style={styles.tileTop}>
                              <Text
                                numberOfLines={2}
                                style={[
                                  styles.tileTitle,
                                  isBlocked && { color: COLORS.faint },
                                ]}
                              >
                                {modifier.name}
                              </Text>
                              {!isMulti && (
                                <View
                                  style={[
                                    styles.checkbox,
                                    isSelected && styles.checkboxOn,
                                  ]}
                                >
                                  {isSelected && (
                                    <Icon
                                      as={Check}
                                      size="xs"
                                      style={{ color: "#fff" }}
                                    />
                                  )}
                                </View>
                              )}
                            </HStack>

                            <Text
                              style={[
                                styles.tilePrice,
                                isSelected && { color: COLORS.accentDark },
                              ]}
                            >
                              {formatAdjustment(modifier.price_adjustment)}
                            </Text>

                            <HStack style={styles.tileFooter}>
                              <Text
                                style={[
                                  styles.tileMeta,
                                  status === "Agotado" && {
                                    color: COLORS.danger,
                                  },
                                  !!status &&
                                    status !== "Agotado" && {
                                      color: COLORS.warning,
                                    },
                                ]}
                              >
                                {status ??
                                  (isRequired
                                    ? "Obligatorio"
                                    : isMulti
                                      ? `Hasta ${modifier.max_selection}`
                                      : "Opcional")}
                              </Text>

                              {isMulti && isSelected && (
                                <Stepper
                                  value={count}
                                  onDecrease={() =>
                                    setModifierCount(modifier, count - 1)
                                  }
                                  onIncrease={() =>
                                    setModifierCount(modifier, count + 1)
                                  }
                                  canDecrease={count > modifier.min_selection}
                                  canIncrease={canIncrease(modifier)}
                                />
                              )}
                              {isMulti && !isSelected && !isBlocked && (
                                <View style={styles.addChip}>
                                  <Icon
                                    as={Plus}
                                    size="xs"
                                    style={{ color: COLORS.accentDark }}
                                  />
                                </View>
                              )}
                            </HStack>
                          </Pressable>
                        );
                      })}
                    </TileGrid>
                  </VStack>
                )}

                {/* ---------- Notas ---------- */}
                {showNotes || notes.length > 0 ? (
                  <VStack style={{ gap: 10 }}>
                    <SectionHeader step={++step} title="Notas para cocina" />
                    <AppInput
                      placeholder="Ej. Sin cebolla, término medio"
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      textareaHeight={70}
                      autoFocus={showNotes && notes.length === 0}
                    />
                  </VStack>
                ) : (
                  <Pressable
                    onPress={() => setShowNotes(true)}
                    style={styles.notesLink}
                  >
                    <Icon
                      as={Plus}
                      size="xs"
                      style={{ color: COLORS.accentDark }}
                    />
                    <Text style={styles.notesLinkText}>
                      Agregar nota para cocina
                    </Text>
                  </Pressable>
                )}
              </VStack>
            </ScrollView>
          </ModalBody>

          <ModalFooter style={styles.footer}>
            {!!error && <Text style={styles.error}>{error}</Text>}

            <HStack style={styles.footerRow}>
              {quantity > 1 && !needsVariant && (
                <Text style={styles.footerHint}>
                  {formatCurrency(unitPrice)} c/u
                </Text>
              )}
              <VStack style={{ gap: 2 }}>
                <Stepper
                  size="lg"
                  value={quantity}
                  onDecrease={() => stepQty(-1)}
                  onIncrease={() => stepQty(1)}
                  canDecrease={quantity > 1}
                  canIncrease={!needsVariant && quantity < remaining}
                />
                <Text style={styles.footerHint}>
                  {needsVariant
                    ? "Elige una opción"
                    : outOfStock
                      ? "Sin existencias"
                      : `${remaining} disponibles`}
                </Text>
              </VStack>

              <View style={{ flex: 1 }}>
                <AppButton
                  label={
                    needsVariant
                      ? "Elige una opción"
                      : `Agregar · ${formatCurrency(unitPrice * quantity)}`
                  }
                  variant="info"
                  isDisabled={needsVariant || outOfStock}
                  onPress={handleConfirm}
                />
              </View>
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
    maxHeight: "90%",
    flexDirection: "column",
    borderRadius: 20,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  header: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.faint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  basePrice: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    alignItems: "center",
    gap: 10,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.faint,
  },
  requiredTag: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accentDark,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: TILE_GAP,
    width: "100%",
  },
  tile: {
    minHeight: 96,
    padding: 12,
    gap: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  tileSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  tileDisabled: {
    backgroundColor: "#F9FAFB",
    borderStyle: "dashed",
  },
  tileTop: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  tileTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  tilePrice: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },
  tileMeta: {
    fontSize: 11,
    color: COLORS.faint,
  },
  tileFooter: {
    marginTop: "auto",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: {
    borderColor: COLORS.accentDark,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentDark,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    borderColor: COLORS.accentDark,
    backgroundColor: COLORS.accentDark,
  },
  addChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: {
    alignItems: "center",
    gap: 6,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnLg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: {
    borderColor: COLORS.border,
    backgroundColor: "#F9FAFB",
  },
  stepValue: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  stepValueLg: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  notesLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  notesLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.accentDark,
  },
  footer: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  footerRow: {
    alignItems: "center",
    gap: 14,
  },
  footerHint: {
    fontSize: 11,
    color: COLORS.faint,
    textAlign: "center",
  },
  error: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.danger,
    backgroundColor: COLORS.dangerSoft,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});
