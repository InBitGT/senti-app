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
  AlertCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CartLine {
  product: CatalogProduct;
  unit: SellUnit;
  // Siempre en unidades base (mismas de stock_qty). Elegir "Caja" no
  // cambia lo que significa `quantity`, solo de cuánto en cuánto salta el
  // stepper (ver useCartStore: addLine/stepLine usan unit.factorToBase).
  quantity: number;
}

// A partir de este ancho se muestra el panel fijo a la derecha (tablet/web).
// Debajo, se usa el modal tipo drawer de móvil.
const DESKTOP_BREAKPOINT = 768;

export const Pos: React.FC = () => {
  const { catalog, isLoading, isError, refetch } = useCatalog();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const { session } = useCashRegisterSession();
  const setSession = useCashRegisterSessionStore((s) => s.setSession);

  useEffect(() => {
    console.log(session, "valores de session");
    if (session.data) {
      setSession(session.data);
    }
  }, [session, session.data, setSession]);
  console.log(catalog, "valores catalog");

  const cart = useCartStore((s) => s.cart);
  const addLine = useCartStore((s) => s.addLine);
  const stepLine = useCartStore((s) => s.stepLine);
  const setLineQty = useCartStore((s) => s.setLineQty);
  const removeLine = useCartStore((s) => s.removeLine);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  console.log(JSON.stringify(catalog));

  // Categorías únicas derivadas del JSON crudo (parent_category = genérica).
  // Se descartan nombres vacíos/nulos para no renderizar un chip en blanco.
  const categories = useMemo(() => {
    const map = new Map<number, string>();
    (catalog ?? []).forEach((p) => {
      if (!p.parent_category_id || !p.parent_category_name?.trim()) return;
      map.set(p.parent_category_id, p.parent_category_name.trim());
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (catalog ?? []).filter((p) => {
      if (categoryId != null && p.parent_category_id !== categoryId)
        return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [catalog, query, categoryId]);

  function handleAddToCart(product: CatalogProduct, unit: SellUnit) {
    addLine(product, unit);
    // En escritorio/tablet el carrito ya está visible en el panel derecho;
    // el modal solo se abre en móvil, donde es la única forma de verlo.
    if (!isDesktop) setCartOpen(true);
  }

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  // `quantity` ya está en unidades base, así que el total NO se vuelve a
  // multiplicar por factorToBase (antes eso duplicaba el monto).
  const cartTotal = cart.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0,
  );

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

  if (isError) {
    return (
      <VStack className="flex-1 items-center justify-center px-6" space="sm">
        <Icon as={AlertCircle} size="xl" className="text-red-600" />
        <Text className="text-center text-gray-600">
          No se pudo cargar el catálogo. Intenta de nuevo.
        </Text>
        <Button size="sm" variant="outline" onPress={() => refetch()}>
          <ButtonText className="text-gray-900">Reintentar</ButtonText>
        </Button>
      </VStack>
    );
  }

  const cartProps = {
    cart,
    onStepLine: stepLine,
    onSetQty: setLineQty,
    onRemoveLine: removeLine,
  };

  console.log(categories, "values categories");

  return (
    <CashRegisterGate>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <HStack className="flex-1">
          <VStack className="flex-1 bg-gray-50">
            <VStack
              space="sm"
              className="border-b border-gray-100 bg-white p-3"
            >
              <Input
                variant="outline"
                size="md"
                className="border-gray-300 bg-white"
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

              {categories.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space="xs">
                    <CategoryPill
                      label="Todas"
                      active={categoryId === null}
                      onPress={() => setCategoryId(null)}
                    />
                    {categories.map((c) => (
                      <CategoryPill
                        key={c.id}
                        label={c.name}
                        active={categoryId === c.id}
                        onPress={() => setCategoryId(c.id)}
                      />
                    ))}
                  </HStack>
                </ScrollView>
              )}
            </VStack>

            <Box className="flex-1 px-1.5 pt-2">
              <ProductCatalog
                data={filtered as ApiCatalogProduct[]}
                onAddToCart={handleAddToCart}
              />
            </Box>

            {/* Barra de carrito: solo en móvil, abre el modal al tocarla */}
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

          {/* Panel fijo a la derecha: solo en tablet/web */}
          {isDesktop && (
            <CartSidePanel
              {...cartProps}
              cartCount={cartCount}
              total={cartTotal}
              onCheckout={goToCheckout}
            />
          )}

          {/* Drawer modal: solo en móvil */}
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
    </CashRegisterGate>
  );
};

// ---------------------------------------------------------------------------
// Línea de carrito (compartida entre el panel de escritorio y el modal)
// ---------------------------------------------------------------------------
function CartLineRow({
  line,
  index,
  onStepLine,
  onSetQty,
  onRemoveLine,
}: {
  line: CartLine;
  index: number;
  onStepLine: (index: number, direction: 1 | -1) => void;
  onSetQty: (index: number, raw: string) => void;
  onRemoveLine: (index: number) => void;
}) {
  return (
    <HStack
      className="items-center justify-between border-b border-gray-100 pb-3"
      space="sm"
    >
      <VStack className="flex-1">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {line.product.name}
        </Text>
        <Text className="text-xs text-gray-400">
          {formatCurrency(line.product.price * line.unit.factorToBase)}/
          {line.unit.code}
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

        <TouchableOpacity onPress={() => onStepLine(index, 1)}>
          <Box className="h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white">
            <Icon as={Plus} size="xs" className="text-gray-600" />
          </Box>
        </TouchableOpacity>
        <Text className="text-[11px] text-gray-400">
          {line.product.units[0]?.code}
        </Text>
      </HStack>

      {/* `quantity` ya está en unidades base: se multiplica solo por el
          precio base, sin volver a aplicar factorToBase (eso duplicaba
          el total cuando la unidad elegida era distinta de la base). */}
      <Text className="w-16 text-right text-sm font-semibold text-gray-900">
        {formatCurrency(line.product.price * line.quantity)}
      </Text>

      <TouchableOpacity onPress={() => onRemoveLine(index)}>
        <Icon as={Trash2} size="xs" className="text-red-500" />
      </TouchableOpacity>
    </HStack>
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
  cartCount,
  total,
  onStepLine,
  onSetQty,
  onRemoveLine,
  onCheckout,
}: {
  cart: CartLine[];
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
        {cart.length === 0 ? (
          <CartEmptyState />
        ) : (
          <VStack space="md">
            {cart.map((line, index) => (
              <CartLineRow
                key={`${line.product.product_id}-${line.unit.uom_id}`}
                line={line}
                index={index}
                onStepLine={onStepLine}
                onSetQty={onSetQty}
                onRemoveLine={onRemoveLine}
              />
            ))}
          </VStack>
        )}
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
  total,
  onStepLine,
  onSetQty,
  onRemoveLine,
  onCheckout,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartLine[];
  total: number;
  onStepLine: (index: number, direction: 1 | -1) => void;
  onSetQty: (index: number, raw: string) => void;
  onRemoveLine: (index: number) => void;
  onCheckout: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="items-center justify-between">
          <Heading size="md" className="text-gray-900">
            Carrito
          </Heading>
          <TouchableOpacity onPress={onClose}>
            <Icon as={X} size="sm" className="text-gray-400" />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody>
          {cart.length === 0 ? (
            <CartEmptyState />
          ) : (
            <VStack space="md">
              {cart.map((line, index) => (
                <CartLineRow
                  key={`${line.product.product_id}-${line.unit.uom_id}`}
                  line={line}
                  index={index}
                  onStepLine={onStepLine}
                  onSetQty={onSetQty}
                  onRemoveLine={onRemoveLine}
                />
              ))}
            </VStack>
          )}
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
