import { AppInput } from "@/components/atom/AppInput/AppInput";
import { CategoryPill } from "@/components/atom/CategoryPill/CategoryPill";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { SubcategoryPill } from "@/components/atom/SubcategoryPill/SubcategoryPill";
import { CashMovementModal } from "@/components/molecules/CashMovementModal/CashMovementModal";
import { CashSessionInfoModal } from "@/components/molecules/CashSessionInfoModal/CashSessionInfoModal";
import { OpenCashRegisterModal } from "@/components/molecules/OpenCashRegisterModal/OpenCashRegisterModal";
import {
  RecipeAddModal,
  RecipeAddSelection,
} from "@/components/molecules/RecipeAddModal/RecipeAddModal";
import { RecipeCartModal } from "@/components/molecules/RecipeCartModal/RecipeCartModal";
import { RecipeCartSidePanel } from "@/components/molecules/RecipeCartSidePanel/RecipeCartSidePanel";
import { CashRegisterGate } from "@/components/templates/CashRegisterGate/CashRegisterGate";
import { RecipePosCatalog } from "@/components/templates/RecipePosCatalog/RecipePosCatalog";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashRegisterSession } from "@/src/hooks/useCashRegisterSession/useCashRegisterSession";
import { useRecipeCatalog } from "@/src/hooks/useRecipePos/useRecipePos";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import { useRecipeCartStore } from "@/src/store/useRecipeCartStore/useRecipeCartStore";
import { ApiRecipeCatalogProduct } from "@/src/types/recipe_pos/recipe_pos";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import {
  isRecipeWholesaleActive,
  recipeLineMax,
  recipeModifierRemaining,
  recipeProductRemaining,
  recipeRemaining,
  recipeUnitPrice,
} from "@/src/utils/recipePos/recipePos";
import { router } from "expo-router";
import {
  ArrowLeftRight,
  RefreshCcw,
  Search,
  ShoppingCart,
  Wallet,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function topCategoryOf(
  p: ApiRecipeCatalogProduct,
): { id: number; name: string } | null {
  if (p.parent_category_id && p.parent_category_name?.trim()) {
    return { id: p.parent_category_id, name: p.parent_category_name.trim() };
  }
  if (p.category_id && p.category_name?.trim()) {
    return { id: p.category_id, name: p.category_name.trim() };
  }
  return null;
}

function hasRealParent(p: ApiRecipeCatalogProduct): boolean {
  return !!p.parent_category_id && !!p.parent_category_name?.trim();
}

const DESKTOP_BREAKPOINT = 768;

export const RecipePos: React.FC = () => {
  const { catalog, isLoading, refetch } = useRecipeCatalog();
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

  const cart = useRecipeCartStore((s) => s.cart);
  const addLine = useRecipeCartStore((s) => s.addLine);
  const stepLine = useRecipeCartStore((s) => s.stepLine);
  const setLineQty = useRecipeCartStore((s) => s.setLineQty);
  const removeLine = useRecipeCartStore((s) => s.removeLine);

  const [selectedProduct, setSelectedProduct] =
    useState<ApiRecipeCatalogProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

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

  const lineIsWholesale = cart.map((l) =>
    isRecipeWholesaleActive(
      l.product,
      productTotalQty.get(l.product.product_id) ?? 0,
    ),
  );
  const lineUnitPrices = cart.map((l, i) =>
    recipeUnitPrice({
      product: l.product,
      variant: l.variant,
      modifiers: l.modifiers,
      wholesaleActive: lineIsWholesale[i],
    }),
  );
  const lineTotals = cart.map((l, i) => l.quantity * lineUnitPrices[i]);
  const maxQuantities = cart.map((l, i) => recipeLineMax(cart, l, i));

  function handleStepLine(index: number, direction: 1 | -1) {
    if (direction === 1) {
      const line = cart[index];
      if (!line) return;
      if (line.quantity + 1 > maxQuantities[index]) return;
    }
    stepLine(index, direction);
  }

  function handleSetQty(index: number, raw: string) {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > maxQuantities[index]) {
      setLineQty(index, String(maxQuantities[index]));
      return;
    }
    setLineQty(index, raw);
  }

  function handleConfirm(selection: RecipeAddSelection) {
    if (!selectedProduct) return;
    addLine({ product: selectedProduct, ...selection });
    setSelectedProduct(null);
    if (!isDesktop) setCartOpen(true);
  }

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = lineTotals.reduce((sum, t) => sum + t, 0);

  function goToCheckout() {
    setCartOpen(false);
    router.navigate("/(drawer)/(pos)/(process)/recipe_checkout");
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

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

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

  if (isLoading) {
    return (
      <VStack className="flex-1 items-center justify-center">
        <Spinner size="large" />
        <Text className="mt-2 text-gray-400">Cargando recetas...</Text>
      </VStack>
    );
  }

  const categoryPills = (
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
  );

  const subcategoryPills = (
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
  );

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
                  <DesktopScrollView horizontal>{categoryPills}</DesktopScrollView>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categoryPills}
                  </ScrollView>
                ))}

              {categoryId != null &&
                subcategories.length > 0 &&
                (Platform.OS === "web" ? (
                  <DesktopScrollView horizontal>
                    {subcategoryPills}
                  </DesktopScrollView>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {subcategoryPills}
                  </ScrollView>
                ))}
            </VStack>

            <Box className="flex-1 px-1.5 pt-2">
              <RecipePosCatalog
                data={filtered}
                getRemaining={(product) =>
                  recipeProductRemaining(cart, product)
                }
                onAdd={setSelectedProduct}
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
            <RecipeCartSidePanel
              {...cartProps}
              cartCount={cartCount}
              total={cartTotal}
              onCheckout={goToCheckout}
            />
          )}

          {!isDesktop && (
            <RecipeCartModal
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              {...cartProps}
              total={cartTotal}
              onCheckout={goToCheckout}
            />
          )}
        </HStack>

        {selectedProduct && (
          <RecipeAddModal
            key={selectedProduct.product_id}
            isOpen
            onClose={() => setSelectedProduct(null)}
            product={selectedProduct}
            getRemaining={(variant) =>
              recipeRemaining(cart, selectedProduct, variant)
            }
            getModifierRemaining={(modifier) =>
              recipeModifierRemaining(cart, modifier)
            }
            onConfirm={handleConfirm}
          />
        )}

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
