import { AppInput } from "@/components/atom/AppInput/AppInput";
import { CategoryPill } from "@/components/atom/CategoryPill/CategoryPill";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { SubcategoryPill } from "@/components/atom/SubcategoryPill/SubcategoryPill";
import { CartModal } from "@/components/molecules/CartModal/CartModal";
import { CartSidePanel } from "@/components/molecules/CartSidePanel/CartSidePanel";
import { CashMovementModal } from "@/components/molecules/CashMovementModal/CashMovementModal";
import { CashSessionInfoModal } from "@/components/molecules/CashSessionInfoModal/CashSessionInfoModal";
import { OpenCashRegisterModal } from "@/components/molecules/OpenCashRegisterModal/OpenCashRegisterModal";
import { CashRegisterGate } from "@/components/templates/CashRegisterGate/CashRegisterGate";
import {
  formatCurrency,
  ProductCatalog,
} from "@/components/templates/PosCatalog/PosCatalog";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashRegisterSession } from "@/src/hooks/useCashRegisterSession/useCashRegisterSession";
import { useCatalog } from "@/src/hooks/usePos/usePos";
import { useCartStore } from "@/src/store/useCartStore/useCartStore";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import { useStockAlertStore } from "@/src/store/useStockAlertStore/useStockAlertStore";
import {
  ApiCatalogProduct,
  CatalogProduct,
  SellUnit,
} from "@/src/types/pos/pos";

import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  RefreshCcw,
  Search,
  ShoppingCart,
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

export interface CartLine {
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
  const stockAlert = useStockAlertStore((s) => s.alert);
  const clearStockAlert = useStockAlertStore((s) => s.clearAlert);

  useEffect(() => {
    if (session.data) {
      setSession(session.data);
    }
  }, [session.data, setSession]);

  useEffect(() => {
    if (stockAlert) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockAlert]);

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
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <CashRegisterGate session={session}>
        <HStack className="flex-1">
          <VStack className="flex-1 bg-gray-50">
            <VStack
              space="sm"
              className="border-b border-gray-100 bg-white p-3"
            >
              <HStack space="xs" className="items-center">
                <Box
                  style={{
                    flex: 1,
                    position: "relative",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    as={Search}
                    size="sm"
                    className="text-gray-400"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 12,
                      zIndex: 1,
                    }}
                  />
                  <AppInput
                    placeholder="Buscar por nombre o SKU..."
                    value={query}
                    onChangeText={setQuery}
                    inputStyle={{ paddingLeft: 36 }}
                    clearable
                  />
                </Box>

                {/* Ambos solo aparecen si la persona tiene una caja abierta */}
                {session.data && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        refetch();
                        session.refetch();
                      }}
                    >
                      <Box className="h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white">
                        <Icon
                          as={RefreshCcw}
                          size="sm"
                          className="text-blue-600"
                        />
                      </Box>
                    </TouchableOpacity>
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
              {stockAlert && (
                <HStack
                  space="xs"
                  className="mb-2 items-center rounded-lg border border-red-300 bg-red-50 p-2.5"
                >
                  <Icon as={AlertTriangle} size="sm" className="text-red-600" />
                  <Text className="flex-1 text-xs text-red-700">
                    <Text className="font-semibold text-red-700">
                      {stockAlert.productName}
                    </Text>{" "}
                    ya no tiene existencias disponibles.
                  </Text>
                  <TouchableOpacity onPress={clearStockAlert}>
                    <Icon as={X} size="xs" className="text-red-400" />
                  </TouchableOpacity>
                </HStack>
              )}

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
      <OpenCashRegisterModal />
    </SafeAreaView>
  );
};
