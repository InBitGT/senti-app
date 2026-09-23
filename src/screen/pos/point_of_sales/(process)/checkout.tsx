import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import {
  formatCurrency,
  mapApiProductToProduct,
} from "@/components/templates/PosCatalog/PosCatalog";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomer } from "@/src/hooks/useCustomer/useCustomer";
import { usePaymentMethod } from "@/src/hooks/usePaymentsMethods/usePaymentsMethods";
import { useCatalog } from "@/src/hooks/usePos/usePos";
import { useAuthStore } from "@/src/store";
import { CartLine, useCartStore } from "@/src/store/useCartStore/useCartStore";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import { useStockAlertStore } from "@/src/store/useStockAlertStore/useStockAlertStore";
import { Customer } from "@/src/types/customer/customer";
import { PaymentMethod } from "@/src/types/payment_methods/payment_methods";
import { CatalogProduct } from "@/src/types/pos/pos";
import { sanitizeDecimal } from "@/src/utils/sanitizeDecimal/sanitizeDecimal";
import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  Pencil,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CASH_ALIASES = ["efectivo", "cash", "contado"];
const GENERIC_CHECKOUT_ERROR =
  "No se pudo registrar la venta. Intenta de nuevo.";

// Valores centinela para los selects. Un SelectItem con value="" no se
// puede volver a elegir de forma confiable, así que se usan claves fijas.
const GENERAL_CUSTOMER_VALUE = "general";
const CREDIT_VALUE = "credit";

// ---------------------------------------------------------------------------
// Precio efectivo por línea (igual que en Pos.tsx). Todas estas funciones
// reciben el carrito YA REPRECIADO con el tipo de cliente (ver `pricedCart`).
// ---------------------------------------------------------------------------
function totalQtyForProduct(cart: CartLine[], productId: number): number {
  return cart.reduce(
    (sum, l) => (l.product.product_id === productId ? sum + l.quantity : sum),
    0,
  );
}

function isWholesaleActiveFor(cart: CartLine[], product: CatalogProduct) {
  if (!product.has_wholesale || product.wholesale_min_qty == null) {
    return false;
  }
  return (
    totalQtyForProduct(cart, product.product_id) >= product.wholesale_min_qty
  );
}

function unitPriceForLine(cart: CartLine[], line: CartLine): number {
  return isWholesaleActiveFor(cart, line.product)
    ? line.unit.wholesaleUnitPrice
    : line.unit.unitPrice;
}

function basePriceForLine(cart: CartLine[], line: CartLine): number {
  return unitPriceForLine(cart, line) / line.unit.factorToBase;
}

function lineTotal(cart: CartLine[], line: CartLine): number {
  return line.quantity * basePriceForLine(cart, line);
}

function isCashMethod(method?: PaymentMethod | null) {
  if (!method) return false;
  const normalized = method.method.toLowerCase();
  return CASH_ALIASES.some((alias) => normalized.includes(alias));
}

// Un cliente puede comprar a crédito solo si tiene el crédito habilitado,
// activo y con saldo. Si no, igual se le vende, pero sin la opción
// "Crédito" en los métodos de pago.
function hasActiveCredit(customer: Customer | null | undefined): boolean {
  const credit = customer?.credit;
  return (
    !!credit &&
    credit.has_credit &&
    credit.status &&
    (credit.credit_available ?? 0) > 0
  );
}

function isInsufficientStockError(err: unknown): boolean {
  return err instanceof Error && /stock insuficiente/i.test(err.message);
}

// Muestra el mensaje real del backend cuando existe; si no, uno genérico.
function checkoutErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim() !== "") return err.message;
  return GENERIC_CHECKOUT_ERROR;
}

function customerLabel(c: Customer): string {
  const parts = [c.name];
  if (c.document_number) parts.push(c.document_number);
  if (c.customer_type?.name) parts.push(c.customer_type.name);
  if (hasActiveCredit(c)) parts.push("con crédito");
  return parts.join(" · ");
}

interface PaymentEntryState {
  key: string;
  paymentMethodId: number | null; // null solo cuando isCredit = true
  isCredit: boolean;
  amount: string;
  amountReceived: string;
  reference: string;
}

function newEntry(paymentMethodId: number | null = null): PaymentEntryState {
  return {
    key: Math.random().toString(36).slice(2),
    paymentMethodId,
    isCredit: false,
    amount: "",
    amountReceived: "",
    reference: "",
  };
}

export const Checkout: React.FC = () => {
  const claims = useAuthStore((s) => s.claims);
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeLine = useCartStore((s) => s.removeLine);
  const { data: customers } = useCustomer();
  const { data: paymentMethods, isLoading: isLoadingPayment } =
    usePaymentMethod();
  const setStockAlert = useStockAlertStore((s) => s.setAlert);
  const { session } = useCashRegisterSessionStore();

  // ----- Cliente --------------------------------------------------------
  const [showCustomer, setShowCustomer] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const activeCustomers = useMemo(
    () => (customers ?? []).filter((c) => c.status),
    [customers],
  );

  const selectedCustomer =
    customerId != null
      ? (activeCustomers.find((c) => c.id === customerId) ?? null)
      : null;

  const creditAvailable = hasActiveCredit(selectedCustomer);
  const creditLimit = selectedCustomer?.credit?.credit_available ?? 0;

  // Tipo de cliente que define los precios. Sin cliente = precios normales.
  // Se normaliza a número: si el backend manda el id como string ("6"),
  // la comparación estricta contra customer_type_prices fallaba en silencio.
  const rawCustomerTypeId =
    selectedCustomer?.customer_type_id || selectedCustomer?.customer_type?.id;
  const customerTypeId =
    rawCustomerTypeId != null && Number(rawCustomerTypeId) > 0
      ? Number(rawCustomerTypeId)
      : null;

  // El catálogo trae en cada producto `customer_type_prices` con los precios
  // de todos los tipos. Aquí se vuelve a mapear pasando el tipo del cliente:
  // solo los productos que tienen precio para ese tipo cambian; el resto
  // conserva su precio base.
  const { checkout, refetch, catalog } = useCatalog();

  const pricedProducts = useMemo(() => {
    const map = new Map<number, CatalogProduct>();
    (catalog ?? []).forEach((p) =>
      map.set(p.product_id, mapApiProductToProduct(p, customerTypeId)),
    );
    return map;
  }, [catalog, customerTypeId]);

  // Carrito con los precios del tipo de cliente aplicados. Se conserva la
  // cantidad y la unidad elegidas; solo se reemplazan producto y precios.
  // Mismo orden e índices que `cart`, así removeLine(i) sigue funcionando.
  const pricedCart = useMemo<CartLine[]>(
    () =>
      cart.map((line) => {
        const priced = pricedProducts.get(line.product.product_id);
        if (!priced) return line;
        const unit =
          priced.units.find((u) => u.uom_id === line.unit.uom_id) ?? line.unit;
        return { ...line, product: priced, unit };
      }),
    [cart, pricedProducts],
  );

  // ----- Métodos de pago -----------------------------------------------
  const methods = useMemo(
    () =>
      (paymentMethods ?? [])
        .filter((m) => m.enabled)
        .sort((a, b) => a.display_order - b.display_order),
    [paymentMethods],
  );

  function methodById(id: number | null) {
    return methods.find((m) => m.id === id) ?? null;
  }

  const [generateFiscal] = useState(false);
  const [fiscalNit] = useState("");
  const [fiscalName] = useState("");

  const [entries, setEntries] = useState<PaymentEntryState[]>([newEntry()]);

  const [stockErrorOpen, setStockErrorOpen] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);
  const [blockedProductIds, setBlockedProductIds] = useState<Set<number>>(
    new Set(),
  );
  const [returnAfterStockAck, setReturnAfterStockAck] = useState(false);

  useEffect(() => {
    if (methods.length === 0) return;
    setEntries((prev) =>
      prev.map((e, i) =>
        i === 0 && e.paymentMethodId == null && !e.isCredit
          ? { ...e, paymentMethodId: methods[0].id }
          : e,
      ),
    );
  }, [methods]);

  // Si el cliente cambia a uno sin crédito (o se quita), las líneas en
  // "Crédito" pasan al primer método disponible. La venta sigue normal.
  useEffect(() => {
    if (creditAvailable) return;
    setEntries((prev) =>
      prev.some((e) => e.isCredit)
        ? prev.map((e) => (e.isCredit ? newEntry(methods[0]?.id ?? null) : e))
        : prev,
    );
  }, [creditAvailable, methods]);

  useEffect(() => {
    setBlockedProductIds((prev) => {
      if (prev.size === 0) return prev;
      const stillInCart = new Set(cart.map((l) => l.product.product_id));
      const next = new Set([...prev].filter((id) => stillInCart.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [cart]);

  const purchasableCart = useMemo(
    () =>
      pricedCart.filter((l) => !blockedProductIds.has(l.product.product_id)),
    [pricedCart, blockedProductIds],
  );

  const blockedProductNames = useMemo(() => {
    const names: string[] = [];
    pricedCart.forEach((l) => {
      if (
        blockedProductIds.has(l.product.product_id) &&
        !names.includes(l.product.name)
      ) {
        names.push(l.product.name);
      }
    });
    return names;
  }, [pricedCart, blockedProductIds]);

  const total = purchasableCart.reduce(
    (sum, l) => sum + lineTotal(pricedCart, l),
    0,
  );

  const singleMethod = entries.length === 1;

  function amountFor(entry: PaymentEntryState) {
    if (singleMethod) return total;
    return Number.parseFloat(entry.amount) || 0;
  }

  const paid = entries.reduce((sum, e) => sum + amountFor(e), 0);
  const remaining = Math.round((total - paid) * 100) / 100;

  const creditUsed = entries
    .filter((e) => e.isCredit)
    .reduce((sum, e) => sum + amountFor(e), 0);
  const creditOverLimit = creditAvailable && creditUsed > creditLimit + 0.005;

  const cashChange = entries
    .filter((e) => !e.isCredit && isCashMethod(methodById(e.paymentMethodId)))
    .reduce((sum, e) => {
      const amount = amountFor(e);
      const received = Number.parseFloat(e.amountReceived) || 0;
      return sum + Math.max(0, received - amount);
    }, 0);

  function updateEntry(key: string, patch: Partial<PaymentEntryState>) {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, ...patch } : e)),
    );
  }

  function setEntryMethod(key: string, methodId: number) {
    updateEntry(key, {
      paymentMethodId: methodId,
      isCredit: false,
      amountReceived: "",
      reference: "",
    });
  }

  function setEntryCredit(key: string) {
    if (!creditAvailable) return;
    updateEntry(key, {
      paymentMethodId: null,
      isCredit: true,
      amountReceived: "",
      reference: "",
    });
  }

  function addEntry() {
    const usedIds = new Set(entries.map((e) => e.paymentMethodId));
    const next = methods.find((m) => !usedIds.has(m.id)) ?? methods[0];
    setEntries((prev) => [...prev, newEntry(next?.id ?? null)]);
  }

  function removeEntry(key: string) {
    setEntries((prev) =>
      prev.length === 1 ? prev : prev.filter((e) => e.key !== key),
    );
  }

  function removeBlockedProduct(productId: number) {
    cart
      .map((l, i) => (l.product.product_id === productId ? i : -1))
      .filter((i) => i !== -1)
      .sort((a, b) => b - a)
      .forEach((i) => removeLine(i));

    setBlockedProductIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }

  const missingFiscal =
    generateFiscal && (!fiscalNit.trim() || !fiscalName.trim());
  const missingMethod = entries.some(
    (e) => !e.isCredit && e.paymentMethodId == null,
  );
  const blocked =
    purchasableCart.length === 0 ||
    Math.abs(remaining) > 0.005 ||
    missingFiscal ||
    missingMethod ||
    creditOverLimit ||
    methods.length === 0 ||
    checkout.isPending ||
    checkingStock;

  async function handleInsufficientStock() {
    setStockErrorOpen(true);
    setCheckingStock(true);
    try {
      const result = await refetch();
      const freshCatalog = result.data ?? catalog ?? [];

      const stockByProduct = new Map<number, number>();
      freshCatalog.forEach((p) =>
        stockByProduct.set(p.product_id, p.stock_qty),
      );

      const cartProductIds = new Set(cart.map((l) => l.product.product_id));

      const nowBlocked = new Set<number>();
      cartProductIds.forEach((productId) => {
        const availableStock = stockByProduct.get(productId) ?? 0;
        if (totalQtyForProduct(cart, productId) > availableStock) {
          nowBlocked.add(productId);
        }
      });

      const onlyProductInCart = cartProductIds.size === 1;
      const thatProductIsBlocked =
        onlyProductInCart && nowBlocked.has([...cartProductIds][0]);

      setBlockedProductIds(nowBlocked);
      setReturnAfterStockAck(thatProductIsBlocked);
    } finally {
      setCheckingStock(false);
    }
  }

  function handleStockModalClose() {
    setStockErrorOpen(false);
    if (returnAfterStockAck) {
      const productId = [...blockedProductIds][0];
      const productName = blockedProductNames[0];
      if (productId != null && productName) {
        setStockAlert({ productId, productName });
      }
      clearCart();
      setBlockedProductIds(new Set());
      setReturnAfterStockAck(false);
      router.back();
    }
  }

  async function handleSubmit() {
    if (!claims) return;

    const payments = entries.map((e) => {
      const amount = amountFor(e);
      if (e.isCredit) {
        return { is_credit: true as const, amount };
      }
      const base: Record<string, unknown> = {
        payment_method_id: e.paymentMethodId,
        amount,
      };
      if (
        isCashMethod(methodById(e.paymentMethodId)) &&
        e.amountReceived.trim() !== ""
      ) {
        base.amount_received = Number.parseFloat(e.amountReceived) || amount;
      }
      if (
        !isCashMethod(methodById(e.paymentMethodId)) &&
        e.reference.trim() !== ""
      ) {
        base.reference = e.reference.trim();
      }
      return base as {
        payment_method_id: number;
        amount: number;
        amount_received?: number;
        reference?: string;
      };
    });

    try {
      await checkout.mutateAsync({
        branch_id: session?.cash_register.branch_id ?? 0,
        warehouse_id: session?.cash_register.warehouse_id ?? 0,
        user_id: claims.sub,
        cash_register_session_id: session?.id ?? 0,
        ...(selectedCustomer
          ? {
              customer_id: selectedCustomer.id,
              customer_type_id: customerTypeId ?? undefined,
            }
          : {}),
        channel: "pos",
        tax: 0,
        items: purchasableCart.map((l) => ({
          product_id: l.product.product_id,
          product_name: l.product.name,
          category_id: l.product.category_id,
          category_name: l.product.category_name,
          quantity: l.quantity,
          // Precio por unidad base ya con tipo de cliente, conversión y
          // mayoreo aplicados.
          unit_price: basePriceForLine(pricedCart, l),
        })),
        payments,
        generate_fiscal_document: generateFiscal,
        ...(generateFiscal
          ? {
              fiscal: {
                document_type: "invoice",
                customer_nit: fiscalNit.trim(),
                customer_name: fiscalName.trim(),
              },
            }
          : {}),
      });

      clearCart();
      setBlockedProductIds(new Set());
      router.navigate("/(drawer)/(pos)/(process)/payment");
    } catch (err) {
      if (isInsufficientStockError(err)) {
        handleInsufficientStock();
      }
    }
  }

  const customerOptions = useMemo(
    () => [
      { label: "Público general", value: GENERAL_CUSTOMER_VALUE },
      ...activeCustomers.map((c) => ({
        label: customerLabel(c),
        value: String(c.id),
      })),
    ],
    [activeCustomers],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <HStack className="items-center gap-3 border-b border-gray-200 bg-white p-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2"
        >
          <Icon as={ArrowLeft} size="sm" className="text-gray-700" />
          <Text className="text-sm font-medium text-gray-700">Volver</Text>
        </TouchableOpacity>
        <Heading size="md" className="text-gray-900">
          Cobrar venta
        </Heading>
        <Text className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {cart.length} {cart.length === 1 ? "artículo" : "artículos"}
        </Text>
      </HStack>

      <ScrollView className="flex-1 p-4">
        <DesktopScrollView>
          <VStack space="lg">
            {/* Resumen del pedido */}
            <VStack className="rounded-xl border border-gray-200 bg-white">
              <Text className="border-b border-gray-100 p-3 text-sm font-semibold text-gray-900">
                Resumen del pedido
              </Text>
              {pricedCart.map((line) => {
                const pricePerBaseUnit = basePriceForLine(pricedCart, line);
                const wholesale = isWholesaleActiveFor(
                  pricedCart,
                  line.product,
                );
                const isBlocked = blockedProductIds.has(
                  line.product.product_id,
                );

                return (
                  <VStack
                    key={`${line.product.product_id}-${line.unit.uom_id}`}
                    className={`border-b border-gray-100 p-3 ${
                      isBlocked ? "bg-red-50" : ""
                    }`}
                    space="xs"
                  >
                    <HStack className="items-center justify-between">
                      <VStack className="flex-1">
                        <HStack space="xs" className="items-center">
                          <Text
                            className={`text-sm font-medium ${
                              isBlocked ? "text-gray-400" : "text-gray-900"
                            }`}
                            numberOfLines={1}
                          >
                            {line.product.name}
                          </Text>
                          {wholesale && !isBlocked && (
                            <Box className="rounded-full bg-green-100 px-1.5 py-0.5">
                              <Text className="text-[9px] font-semibold text-green-700">
                                mayoreo
                              </Text>
                            </Box>
                          )}
                          {isBlocked && (
                            <Box className="flex-row items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5">
                              <Icon
                                as={AlertTriangle}
                                size="xs"
                                className="text-red-600"
                              />
                              <Text className="text-[9px] font-semibold text-red-600">
                                sin stock
                              </Text>
                            </Box>
                          )}
                        </HStack>
                        <Text
                          className={`text-xs ${
                            isBlocked ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {line.quantity} {line.product.units[0]?.code}
                          {line.unit.factorToBase !== 1 &&
                            ` (${line.quantity / line.unit.factorToBase} ${line.unit.name})`}
                          {" × "}
                          {formatCurrency(pricePerBaseUnit)}
                        </Text>
                      </VStack>
                      <Text
                        className={`text-sm font-semibold ${
                          isBlocked
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(lineTotal(pricedCart, line))}
                      </Text>
                    </HStack>

                    {isBlocked && (
                      <HStack className="items-center justify-between">
                        <Text className="flex-1 text-[11px] text-red-600">
                          No hay stock suficiente. No se incluye en el total.
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            removeBlockedProduct(line.product.product_id)
                          }
                          className="rounded-md border border-red-300 px-2 py-1"
                        >
                          <Text className="text-[11px] font-medium text-red-600">
                            Quitar del carrito
                          </Text>
                        </TouchableOpacity>
                      </HStack>
                    )}
                  </VStack>
                );
              })}
              <HStack className="items-center justify-between p-3">
                <Text className="text-base font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatCurrency(total)}
                </Text>
              </HStack>
            </VStack>

            {/* Cliente */}
            <VStack
              className="rounded-xl border border-gray-200 bg-white p-3"
              space="sm"
            >
              <TouchableOpacity
                onPress={() => setShowCustomer((v) => !v)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-sm text-gray-500">Cliente:</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {selectedCustomer?.name ?? "Público general"}
                </Text>
                {creditAvailable && (
                  <HStack
                    space="xs"
                    className="items-center rounded bg-blue-50 px-1.5 py-0.5"
                  >
                    <Icon as={CreditCard} size="xs" className="text-blue-600" />
                    <Text className="text-[10px] font-medium text-blue-600">
                      disponible {formatCurrency(creditLimit)}
                    </Text>
                  </HStack>
                )}
                <HStack space="xs" className="ml-auto items-center">
                  <Icon as={Pencil} size="xs" className="text-blue-600" />
                  <Text className="text-xs font-medium text-blue-600">
                    {customerId == null ? "Cambiar" : "Editar"}
                  </Text>
                </HStack>
              </TouchableOpacity>

              {showCustomer && (
                <VStack space="sm" className="border-t border-gray-100 pt-3">
                  <AppSelect
                    placeholder="Público general"
                    searchable={customerOptions.length > 6}
                    searchPlaceholder="Buscar cliente..."
                    options={customerOptions}
                    value={
                      customerId != null
                        ? String(customerId)
                        : GENERAL_CUSTOMER_VALUE
                    }
                    onChange={(v) =>
                      setCustomerId(
                        v && v !== GENERAL_CUSTOMER_VALUE ? Number(v) : null,
                      )
                    }
                  />
                </VStack>
              )}
            </VStack>

            {/* Métodos de pago */}
            <VStack
              className="rounded-xl border border-gray-200 bg-white p-3"
              space="sm"
            >
              <HStack className="items-center justify-between">
                <Text className="text-sm font-semibold text-gray-900">
                  Método de pago
                </Text>
                <TouchableOpacity
                  onPress={addEntry}
                  className="flex-row items-center gap-1 rounded-md border border-gray-300 px-2 py-1"
                >
                  <Icon as={Plus} size="xs" className="text-gray-700" />
                  <Text className="text-xs font-medium text-gray-700">
                    Dividir pago
                  </Text>
                </TouchableOpacity>
              </HStack>

              {isLoadingPayment && (
                <HStack space="xs" className="items-center py-2">
                  <Spinner size="small" />
                  <Text className="text-xs text-gray-400">
                    Cargando métodos de pago...
                  </Text>
                </HStack>
              )}

              {entries.map((entry) => {
                const cash = isCashMethod(methodById(entry.paymentMethodId));
                const amountEditable = !singleMethod;
                const displayedAmount = singleMethod
                  ? total.toFixed(2)
                  : entry.amount;

                const methodOptions = [
                  ...methods.map((m) => ({
                    label: m.method,
                    value: String(m.id),
                  })),
                  // Solo si el cliente tiene crédito activo
                  ...(creditAvailable
                    ? [{ label: "Crédito", value: CREDIT_VALUE }]
                    : []),
                ];

                return (
                  <VStack
                    key={entry.key}
                    space="xs"
                    className="rounded-lg border border-gray-100 p-2"
                  >
                    <HStack space="xs" className="items-center">
                      <Box className="min-w-0 flex-1">
                        <AppSelect
                          placeholder="Método de pago"
                          searchable={false}
                          options={methodOptions}
                          value={
                            entry.isCredit
                              ? CREDIT_VALUE
                              : entry.paymentMethodId != null
                                ? String(entry.paymentMethodId)
                                : undefined
                          }
                          onChange={(v) => {
                            if (v === CREDIT_VALUE) {
                              setEntryCredit(entry.key);
                              return;
                            }
                            const id = Number(v);
                            if (Number.isFinite(id))
                              setEntryMethod(entry.key, id);
                          }}
                        />
                      </Box>

                      <AppInput
                        value={displayedAmount}
                        onChangeText={
                          amountEditable
                            ? (v) =>
                                updateEntry(entry.key, {
                                  amount: sanitizeDecimal(v),
                                })
                            : undefined
                        }
                        isDisabled={!amountEditable}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        inputMode="decimal"
                        returnKeyType="done"
                        selectTextOnFocus={amountEditable}
                        containerStyle={{ width: 128 }}
                        inputStyle={{ textAlign: "right" }}
                      />

                      {entries.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeEntry(entry.key)}
                        >
                          <Icon as={X} size="sm" className="text-gray-400" />
                        </TouchableOpacity>
                      )}
                    </HStack>

                    {!entry.isCredit && cash && (
                      <AppInput
                        value={entry.amountReceived}
                        onChangeText={(v) =>
                          updateEntry(entry.key, {
                            amountReceived: sanitizeDecimal(v),
                          })
                        }
                        placeholder="Efectivo recibido (para calcular cambio)"
                        keyboardType="decimal-pad"
                        inputMode="decimal"
                        returnKeyType="done"
                      />
                    )}

                    {!entry.isCredit && !cash && (
                      <AppInput
                        value={entry.reference}
                        onChangeText={(v) =>
                          updateEntry(entry.key, { reference: v })
                        }
                        placeholder="Referencia (opcional)"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        returnKeyType="done"
                      />
                    )}
                  </VStack>
                );
              })}

              <VStack space="xs">
                {remaining > 0.005 ? (
                  <Text className="text-sm font-medium text-red-600">
                    Faltan {formatCurrency(remaining)}
                  </Text>
                ) : remaining < -0.005 ? (
                  <Text className="text-sm font-medium text-red-600">
                    Los montos superan el total por{" "}
                    {formatCurrency(Math.abs(remaining))}
                  </Text>
                ) : cashChange > 0.005 ? (
                  <Text className="text-sm font-medium text-blue-600">
                    Cambio: {formatCurrency(cashChange)}
                  </Text>
                ) : null}

                {creditUsed > 0 && (
                  <Text
                    className={`text-xs ${
                      creditOverLimit ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    Crédito: {formatCurrency(creditUsed)} de{" "}
                    {formatCurrency(creditLimit)} disponibles
                    {creditOverLimit && " · excede lo disponible"}
                  </Text>
                )}
              </VStack>
            </VStack>

            {checkout.isError && !isInsufficientStockError(checkout.error) && (
              <Text className="text-sm font-medium text-red-600">
                {checkoutErrorMessage(checkout.error)}
              </Text>
            )}
          </VStack>
        </DesktopScrollView>
      </ScrollView>

      <VStack className="border-t border-gray-200 bg-white p-4">
        <Button
          className={blocked ? "bg-gray-300" : "bg-blue-600"}
          isDisabled={blocked}
          onPress={handleSubmit}
        >
          <ButtonText className="text-white">
            {checkout.isPending
              ? "Procesando..."
              : `Confirmar cobro · ${formatCurrency(total)}`}
          </ButtonText>
        </Button>
      </VStack>

      <AlertDialog isOpen={stockErrorOpen} onClose={handleStockModalClose}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <HStack space="sm" className="items-center">
              <Icon as={AlertTriangle} size="md" className="text-red-600" />
              <Heading size="sm" className="text-gray-900">
                Stock insuficiente
              </Heading>
            </HStack>
          </AlertDialogHeader>
          <AlertDialogBody>
            {checkingStock ? (
              <HStack space="xs" className="items-center py-2">
                <Spinner size="small" />
                <Text className="text-sm text-gray-600">
                  Verificando existencias actualizadas...
                </Text>
              </HStack>
            ) : returnAfterStockAck ? (
              <Text className="text-sm text-gray-600">
                &quot;{blockedProductNames[0]}&quot; ya no tiene existencias
                disponibles. Vas a volver al catálogo para elegir otro producto.
              </Text>
            ) : blockedProductNames.length > 0 ? (
              <VStack space="xs">
                <Text className="text-sm text-gray-600">
                  Estos productos ya no tienen existencias suficientes. Quedaron
                  marcados en el resumen y no se incluyen en el total: quítalos
                  o ajusta la cantidad y vuelve a intentar.
                </Text>
                <VStack space="xs" className="mt-1">
                  {blockedProductNames.map((name) => (
                    <Text
                      key={name}
                      className="text-sm font-medium text-red-600"
                    >
                      • {name}
                    </Text>
                  ))}
                </VStack>
              </VStack>
            ) : (
              <Text className="text-sm text-gray-600">
                El servidor rechazó la venta por falta de stock, pero las
                existencias actualizadas alcanzan. Revisa el resumen y vuelve a
                intentar.
              </Text>
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              className="bg-blue-600"
              onPress={handleStockModalClose}
              isDisabled={checkingStock}
            >
              <ButtonText className="text-white">Entendido</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};
