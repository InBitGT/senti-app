import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { CashMovementModal } from "@/components/molecules/CashMovementModal/CashMovementModal";
import { CashSessionInfoModal } from "@/components/molecules/CashSessionInfoModal/CashSessionInfoModal";
import { CashRegisterGate } from "@/components/templates/CashRegisterGate/CashRegisterGate";
import {
  formatCurrency,
  ProductCatalog,
} from "@/components/templates/PosCatalog/PosCatalog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashRegisterSession } from "@/src/hooks/useCashRegisterSession/useCashRegisterSession";
import { useCatalog } from "@/src/hooks/usePos/usePos";
import { useCartStore } from "@/src/store/useCartStore/useCartStore";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import {
  ApiCatalogProduct,
  CatalogProduct,
  SellUnit,
} from "@/src/types/pos/pos";

import { router } from "expo-router";
import {
  ArrowLeftRight,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  Wallet,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CartLine {
  product: CatalogProduct;
  unit: SellUnit;
  quantity: number;
}

const DESKTOP_BREAKPOINT = 768;

export const Pos: React.FC = () => {
  const { catalog, isLoading, refetch } = useCatalog();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const { session } = useCashRegisterSession();
  const setSession = useCashRegisterSessionStore((s) => s.setSession);
  const [cashInfoOpen, setCashInfoOpen] = useState(false);
  const [cashMovementOpen, setCashMovementOpen] = useState(false);

  useEffect(() => {
    if (session.data) {
      setSession(session.data);
    }
  }, [session.data, setSession]);

  const cart = useCartStore((s) => s.cart);
  const addLine = useCartStore((s) => s.addLine);
  const stepLine = useCartStore((s) => s.stepLine);
  const setLineQty = useCartStore((s) => s.setLineQty);
  const removeLine = useCartStore((s) => s.removeLine);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  function qtyInOtherLines(productId: number, excludeIndex: number) {
    return cart.reduce((sum, l, i) => {
      if (i === excludeIndex) return sum;
      return l.product.product_id === productId ? sum + l.quantity : sum;
    }, 0);
  }

  function maxQtyForLine(index: number) {
    const line = cart[index];
    if (!line) return 0;
    const otherQty = qtyInOtherLines(line.product.product_id, index);
    return Math.max(0, line.product.stock_qty - otherQty);
  }

  const maxQuantities = useMemo(
    () => cart.map((_, index) => maxQtyForLine(index)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart],
  );

  const productTotalQty = useMemo(() => {
    const map = new Map<number, number>();
    cart.forEach((l) => {
      map.set(
        l.product.product_id,
        (map.get(l.product.product_id) ?? 0) + l.quantity,
      );
    });
    return map;
  }, [cart]);

  function isWholesaleActiveFor(product: CatalogProduct): boolean {
    if (!product.has_wholesale || product.wholesale_min_qty == null) {
      return false;
    }
    const totalQty = productTotalQty.get(product.product_id) ?? 0;
    return totalQty >= product.wholesale_min_qty;
  }

  function unitPriceForLine(line: CartLine): number {
    return isWholesaleActiveFor(line.product)
      ? line.unit.wholesaleUnitPrice
      : line.unit.unitPrice;
  }

  function lineTotal(line: CartLine): number {
    return (line.quantity / line.unit.factorToBase) * unitPriceForLine(line);
  }

  const lineUnitPrices = cart.map((l) => unitPriceForLine(l));
  const lineTotals = cart.map((l) => lineTotal(l));
  const lineIsWholesale = cart.map((l) => isWholesaleActiveFor(l.product));

  function handleStepLine(index: number, direction: 1 | -1) {
    if (direction === 1) {
      const line = cart[index];
      if (!line) return;
      const max = maxQtyForLine(index);
      if (line.quantity + line.unit.factorToBase > max) return;
    }
    stepLine(index, direction);
  }

  function handleSetQty(index: number, raw: string) {
    const line = cart[index];
    if (!line) {
      setLineQty(index, raw);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      const max = maxQtyForLine(index);
      if (parsed > max) {
        setLineQty(index, String(max));
        return;
      }
    }
    setLineQty(index, raw);
  }

  function topCategoryOf(
    p: ApiCatalogProduct,
  ): { id: number; name: string } | null {
    if (p.parent_category_id && p.parent_category_name?.trim()) {
      return { id: p.parent_category_id, name: p.parent_category_name.trim() };
    }
    if (p.category_id && p.category_name?.trim()) {
      return { id: p.category_id, name: p.category_name.trim() };
    }
    return null;
  }

  function hasRealParent(p: ApiCatalogProduct): boolean {
    return !!p.parent_category_id && !!p.parent_category_name?.trim();
  }

  const categories = useMemo(() => {
    const map = new Map<number, string>();
    (catalog ?? []).forEach((p) => {
      const top = topCategoryOf(p);
      if (!top) return;
      map.set(top.id, top.name);
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [catalog]);

  const subcategories = useMemo(() => {
    if (categoryId == null) return [];
    const map = new Map<number, string>();
    (catalog ?? []).forEach((p) => {
      if (!hasRealParent(p)) return;
      if (p.parent_category_id !== categoryId) return;
      if (!p.category_id || !p.category_name?.trim()) return;
      map.set(p.category_id, p.category_name.trim());
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [catalog, categoryId]);

  function pickCategory(id: number | null) {
    setCategoryId(id);
    setSubcategoryId(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (catalog ?? []).filter((p) => {
      if (categoryId != null) {
        const top = topCategoryOf(p);
        if (top?.id !== categoryId) return false;
      }
      if (subcategoryId != null && p.category_id !== subcategoryId)
        return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [catalog, query, categoryId, subcategoryId]);

  function handleAddToCart(product: CatalogProduct, unit: SellUnit) {
    const alreadyInCart = cart.reduce(
      (sum, l) =>
        l.product.product_id === product.product_id ? sum + l.quantity : sum,
      0,
    );
    const remaining = product.stock_qty - alreadyInCart;
    if (unit.factorToBase > remaining) return;

    addLine(product, unit);
    if (!isDesktop) setCartOpen(true);
  }

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = lineTotals.reduce((sum, t) => sum + t, 0);

  function goToCheckout() {
    setCartOpen(false);
    router.navigate("/(drawer)/(pos)/(process)/checkout");
  }

  if (isLoading) {
    return (
      <VStack className="flex-1 items-center justify-center">
        <Spinner size="large" />
        <Text className="mt-2 text-gray-400">Cargando catálogo...</Text>
      </VStack>
    );
  }

  const cartProps = {
    cart,
    maxQuantities,
    lineUnitPrices,
    lineTotals,
    lineIsWholesale,
    onStepLine: handleStepLine,
    onSetQty: handleSetQty,
    onRemoveLine: removeLine,
  };

  return (
    <CashRegisterGate session={session}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <HStack className="flex-1">
          <VStack className="flex-1 bg-gray-50">
            <VStack
              space="sm"
              className="border-b border-gray-100 bg-white p-3"
            >
              <HStack space="xs" className="items-center">
                <Input
                  variant="outline"
                  size="md"
                  className="flex-1 border-gray-300 bg-white"
                >
                  <InputSlot className="pl-3">
                    <InputIcon as={Search} className="text-gray-400" />
                  </InputSlot>
                  <InputField
                    placeholder="Buscar por nombre o SKU..."
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                    className="text-gray-900"
                  />
                </Input>

                {/* Ambos solo aparecen si la persona tiene una caja abierta */}
                {session.data && (
                  <>
                    <TouchableOpacity onPress={() => setCashInfoOpen(true)}>
                      <Box className="h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white">
                        <Icon as={Wallet} size="sm" className="text-blue-600" />
                      </Box>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setCashMovementOpen(true)}>
                      <Box className="h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white">
                        <Icon
                          as={ArrowLeftRight}
                          size="sm"
                          className="text-blue-600"
                        />
                      </Box>
                    </TouchableOpacity>
                  </>
                )}
              </HStack>

              {categories.length > 0 &&
                (Platform.OS === "web" ? (
                  <DesktopScrollView horizontal>
                    <HStack space="xs">
                      <CategoryPill
                        label="Todas"
                        active={categoryId === null}
                        onPress={() => pickCategory(null)}
                      />
                      {categories.map((c) => (
                        <CategoryPill
                          key={c.id}
                          label={c.name}
                          active={categoryId === c.id}
                          onPress={() => pickCategory(c.id)}
                        />
                      ))}
                    </HStack>
                  </DesktopScrollView>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="xs">
                      <CategoryPill
                        label="Todas"
                        active={categoryId === null}
                        onPress={() => pickCategory(null)}
                      />
                      {categories.map((c) => (
                        <CategoryPill
                          key={c.id}
                          label={c.name}
                          active={categoryId === c.id}
                          onPress={() => pickCategory(c.id)}
                        />
                      ))}
                    </HStack>
                  </ScrollView>
                ))}

              {categoryId != null &&
                subcategories.length > 0 &&
                (Platform.OS === "web" ? (
                  <DesktopScrollView horizontal>
                    <HStack space="xs" className="mb-24">
                      <SubcategoryPill
                        label="Todo"
                        active={subcategoryId === null}
                        onPress={() => setSubcategoryId(null)}
                      />
                      {subcategories.map((s) => (
                        <SubcategoryPill
                          key={s.id}
                          label={s.name}
                          active={subcategoryId === s.id}
                          onPress={() => setSubcategoryId(s.id)}
                        />
                      ))}
                    </HStack>
                  </DesktopScrollView>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="xs">
                      <SubcategoryPill
                        label="Todo"
                        active={subcategoryId === null}
                        onPress={() => setSubcategoryId(null)}
                      />
                      {subcategories.map((s) => (
                        <SubcategoryPill
                          key={s.id}
                          label={s.name}
                          active={subcategoryId === s.id}
                          onPress={() => setSubcategoryId(s.id)}
                        />
                      ))}
                    </HStack>
                  </ScrollView>
                ))}
            </VStack>

            <Box className="flex-1 px-1.5 pt-2">
              <ProductCatalog
                data={filtered as ApiCatalogProduct[]}
                onAddToCart={handleAddToCart}
                onPress={() => refetch()}
              />
            </Box>

            {!isDesktop && (
              <TouchableOpacity
                onPress={() => setCartOpen(true)}
                disabled={cart.length === 0}
              >
                <HStack
                  className="items-center justify-between border-t border-gray-200 bg-white p-3"
                  space="sm"
                >
                  <HStack space="xs" className="items-center">
                    <Icon
                      as={ShoppingCart}
                      size="sm"
                      className="text-blue-600"
                    />
                    <Text className="font-medium text-gray-900">
                      {cartCount} {cartCount === 1 ? "artículo" : "artículos"}
                    </Text>
                  </HStack>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatCurrency(cartTotal)}
                  </Text>
                </HStack>
              </TouchableOpacity>
            )}
          </VStack>

          {isDesktop && (
            <CartSidePanel
              {...cartProps}
              cartCount={cartCount}
              total={cartTotal}
              onCheckout={goToCheckout}
            />
          )}

          {!isDesktop && (
            <CartModal
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              {...cartProps}
              total={cartTotal}
              onCheckout={goToCheckout}
            />
          )}
        </HStack>
      </SafeAreaView>

      {session.data && (
        <CashSessionInfoModal
          isOpen={cashInfoOpen}
          onClose={() => setCashInfoOpen(false)}
          session={session.data}
          onClosed={() => session.refetch()}
        />
      )}

      {session.data && (
        <CashMovementModal
          isOpen={cashMovementOpen}
          sessionId={session.data.id}
          onDone={() => session.refetch()}
          onClose={() => setCashMovementOpen(false)}
        />
      )}
    </CashRegisterGate>
  );
};

function CartLineRow({
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

          <Input
            variant="outline"
            size="sm"
            className="w-12 border-gray-300 bg-white"
          >
            <InputField
              value={String(line.quantity)}
              onChangeText={(v) => onSetQty(index, v)}
              keyboardType="numeric"
              textAlign="center"
              className="text-sm font-medium text-gray-900"
              selectTextOnFocus
            />
          </Input>

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

function CartEmptyState() {
  return (
    <VStack className="items-center py-8" space="sm">
      <Icon as={ShoppingCart} size="xl" className="text-gray-300" />
      <Text className="text-gray-400">El carrito está vacío</Text>
    </VStack>
  );
}

function CartSidePanel({
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

      <ScrollView className="flex-1 px-4 pt-3">
        <DesktopScrollView>
          {cart.length === 0 ? (
            <CartEmptyState />
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
        </DesktopScrollView>
      </ScrollView>

      {cart.length > 0 && (
        <VStack space="sm" className="border-t border-gray-100 p-4">
          <HStack className="items-center justify-between">
            <Text className="text-sm text-gray-600">Total</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {formatCurrency(total)}
            </Text>
          </HStack>
          <Button className="bg-blue-600" onPress={onCheckout}>
            <ButtonText className="text-white">
              Cobrar {formatCurrency(total)}
            </ButtonText>
          </Button>
        </VStack>
      )}
    </VStack>
  );
}

function CartModal({
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
      <ModalContent className="bg-white" style={{ maxHeight: "85%" }}>
        <ModalHeader className="items-center justify-between">
          <Heading size="md" className="text-gray-900">
            Carrito
          </Heading>
          <TouchableOpacity onPress={onClose}>
            <Icon as={X} size="sm" className="text-gray-400" />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody style={{ flexGrow: 0, flexShrink: 1 }}>
          <ScrollView style={{ flexGrow: 0 }}>
            {cart.length === 0 ? (
              <CartEmptyState />
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
        </ModalBody>

        {cart.length > 0 && (
          <ModalFooter className="flex-col items-stretch gap-3">
            <HStack className="items-center justify-between">
              <Text className="text-sm text-gray-600">Total</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {formatCurrency(total)}
              </Text>
            </HStack>
            <Button className="bg-blue-600" onPress={onCheckout}>
              <ButtonText className="text-white">
                Cobrar {formatCurrency(total)}
              </ButtonText>
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}

function CategoryPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        className={`rounded-full px-3 py-1.5 ${
          active ? "bg-blue-600" : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-sm font-medium ${active ? "text-white" : "text-gray-700"}`}
        >
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

function SubcategoryPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        className={`rounded-full border px-2.5 py-1 ${
          active ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <Text
          className={`text-xs font-medium ${active ? "text-blue-700" : "text-gray-600"}`}
        >
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
