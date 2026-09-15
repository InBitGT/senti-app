import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
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
import { Input, InputField } from "@/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCredit } from "@/src/hooks/useCredit/useCredit";
import { useCustomerType } from "@/src/hooks/useCustomerType/useCustomerType";
import { usePaymentMethod } from "@/src/hooks/usePaymentsMethods/usePaymentsMethods";
import { useCatalog } from "@/src/hooks/usePos/usePos";
import { useAuthStore } from "@/src/store";
import { CartLine, useCartStore } from "@/src/store/useCartStore/useCartStore";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import { useStockAlertStore } from "@/src/store/useStockAlertStore/useStockAlertStore";
import { PaymentMethod } from "@/src/types/payment_methods/payment_methods";
import { CatalogProduct } from "@/src/types/pos/pos";
import { sanitizeDecimal } from "@/src/utils/sanitizeDecimal/sanitizeDecimal";
import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  CreditCard,
  Pencil,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CASH_ALIASES = ["efectivo", "cash", "contado"];

// ---------------------------------------------------------------------------
// Precio efectivo por línea, igual que en Pos.tsx: mayoreo se evalúa por
// PRODUCTO sumando todas sus líneas del carrito (sin importar la unidad
// con la que se agregó cada una), y el precio unitario respeta tanto el
// precio especial de conversión (unit.unitPrice) como el de mayoreo
// (unit.wholesaleUnitPrice) una vez alcanzado wholesale_min_qty.
//
// Este archivo no comparte estado con Pos.tsx (son pantallas distintas),
// así que la misma lógica se repite acá — si en algún momento se decide
// centralizarla, el lugar natural sería useCartStore.ts, ya que ambas
// pantallas ya dependen de él.
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

// Precio de UNA unidad de la línea (ej. 1 Caja), ya resuelto.
function unitPriceForLine(cart: CartLine[], line: CartLine): number {
  return isWholesaleActiveFor(cart, line.product)
    ? line.unit.wholesaleUnitPrice
    : line.unit.unitPrice;
}

// Precio de UNA unidad BASE (ej. 1 Unidad suelta) de la línea. Como
// `quantity` está en unidades base, esto es lo que hay que mandarle al
// backend como `unit_price` para que `quantity * unit_price` cuadre.
function basePriceForLine(cart: CartLine[], line: CartLine): number {
  return unitPriceForLine(cart, line) / line.unit.factorToBase;
}

// Total de una línea completa.
function lineTotal(cart: CartLine[], line: CartLine): number {
  return line.quantity * basePriceForLine(cart, line);
}

function isCashMethod(method?: PaymentMethod | null) {
  if (!method) return false;
  const normalized = method.method.toLowerCase();
  return CASH_ALIASES.some((alias) => normalized.includes(alias));
}

// Detecta específicamente el error de stock insuficiente que devuelve el
// backend ({ code: 400, message: "stock insuficiente" }), sin capturar
// otros errores de checkout.
function isInsufficientStockError(err: unknown): boolean {
  return err instanceof Error && /stock insuficiente/i.test(err.message);
}

interface PaymentEntryState {
  key: string;
  paymentMethodId: number | null; // null solo cuando isCredit = true
  isCredit: boolean;
  amount: string; // vacío = "cubre todo el resto" cuando es la única línea
  amountReceived: string; // solo efectivo, para calcular cambio
  reference: string; // solo métodos no efectivo
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
  const { checkout, refetch, catalog } = useCatalog();
  const { data: customerCredits } = useCredit();
  const { data: paymentMethods, isLoading: isLoadingPayment } =
    usePaymentMethod();
  const { data: customerType } = useCustomerType();
  const setStockAlert = useStockAlertStore((s) => s.setAlert);

  const methods = useMemo(
    () =>
      (paymentMethods ?? [])
        .filter((m) => m.enabled)
        .sort((a, b) => a.display_order - b.display_order),
    [paymentMethods],
  );
  const customerTypes = customerType ?? [];

  function methodById(id: number | null) {
    return methods.find((m) => m.id === id) ?? null;
  }

  const [showCustomer, setShowCustomer] = useState(false);
  const [customerTypeId, setCustomerTypeId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { session } = useCashRegisterSessionStore();

  const selectedCredit =
    customerId != null
      ? ((customerCredits ?? []).find((c) => c.customer_id === customerId) ??
        null)
      : null;
  const selectedCustomer = selectedCredit?.customer ?? null;

  const creditAvailable =
    !!selectedCredit?.has_credit && (selectedCredit?.credit_available ?? 0) > 0;

  const [generateFiscal, setGenerateFiscal] = useState(false);
  const [fiscalNit, setFiscalNit] = useState("");
  const [fiscalName, setFiscalName] = useState("");

  const [entries, setEntries] = useState<PaymentEntryState[]>([newEntry()]);

  // Modal de stock insuficiente. `blockedProductIds` guarda los productos
  // del carrito cuyo stock real (recién refrescado) ya no alcanza para lo
  // pedido. No se reinicia el carrito completo: esas líneas se marcan
  // como bloqueadas, se excluyen del total y del payload de checkout,
  // pero el resto de la venta sigue intacta.
  const [stockErrorOpen, setStockErrorOpen] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);
  const [blockedProductIds, setBlockedProductIds] = useState<Set<number>>(
    new Set(),
  );
  // Si es true, al cerrar el modal se limpia el carrito y se regresa a la
  // pantalla anterior — caso del único producto del carrito sin stock.
  const [returnAfterStockAck, setReturnAfterStockAck] = useState(false);

  // En cuanto cargan los métodos de pago, la primera línea toma el de
  // menor display_order como valor por defecto (si el usuario no la tocó).
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

  // Si se cambia/quita el cliente y ya no hay crédito disponible, las
  // líneas marcadas como "Crédito" bajan al primer método disponible.
  useEffect(() => {
    if (creditAvailable) return;
    setEntries((prev) =>
      prev.some((e) => e.isCredit)
        ? prev.map((e) => (e.isCredit ? newEntry(methods[0]?.id ?? null) : e))
        : prev,
    );
  }, [creditAvailable, methods]);

  // Si un producto bloqueado desaparece del carrito (el usuario lo quitó
  // manualmente) o cambia de cantidad, limpiamos su bloqueo para no dejar
  // basura en el set.
  useEffect(() => {
    setBlockedProductIds((prev) => {
      if (prev.size === 0) return prev;
      const stillInCart = new Set(cart.map((l) => l.product.product_id));
      const next = new Set([...prev].filter((id) => stillInCart.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [cart]);

  // Carrito "cobrable": excluye las líneas de productos bloqueados por
  // falta de stock. Es lo que se usa para el total y para el payload.
  const purchasableCart = useMemo(
    () => cart.filter((l) => !blockedProductIds.has(l.product.product_id)),
    [cart, blockedProductIds],
  );

  const blockedProductNames = useMemo(() => {
    const names: string[] = [];
    cart.forEach((l) => {
      if (
        blockedProductIds.has(l.product.product_id) &&
        !names.includes(l.product.name)
      ) {
        names.push(l.product.name);
      }
    });
    return names;
  }, [cart, blockedProductIds]);

  // FIX: antes era `sum + l.product.price * l.quantity`, que ignoraba el
  // precio especial de conversión y el de mayoreo. Ahora usa `lineTotal`,
  // que respeta ambos (ver definición arriba, igual que en Pos.tsx).
  // Solo suma líneas "cobrables" (no bloqueadas por stock).
  const total = purchasableCart.reduce((sum, l) => sum + lineTotal(cart, l), 0);

  // Con un solo método de pago, SIEMPRE se cobra el 100% del total — el
  // campo queda de solo lectura y no hace falta que el usuario escriba
  // nada. Solo se vuelve editable al dividir el pago (más de una línea).
  const singleMethod = entries.length === 1;
  const autoFull = singleMethod;

  function amountFor(entry: PaymentEntryState) {
    if (autoFull) return total;
    return Number.parseFloat(entry.amount) || 0;
  }

  const paid = entries.reduce((sum, e) => sum + amountFor(e), 0);
  const remaining = Math.round((total - paid) * 100) / 100;

  const creditUsed = entries
    .filter((e) => e.isCredit)
    .reduce((sum, e) => sum + amountFor(e), 0);
  const creditOverLimit =
    creditAvailable &&
    creditUsed > (selectedCredit?.credit_available ?? 0) + 0.005;

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

  // Quita del carrito todas las líneas de un producto bloqueado (puede
  // tener más de una línea si se agregó en distintas unidades).
  function removeBlockedProduct(productId: number) {
    cart
      .map((l, i) => (l.product.product_id === productId ? i : -1))
      .filter((i) => i !== -1)
      .sort((a, b) => b - a) // de mayor a menor índice: evita que se
      // corran los índices restantes al remover
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

  // Refresca el catálogo y, comparando el stock real contra lo pedido en
  // el carrito, determina qué producto(s) ya no tienen stock suficiente.
  // El modal SIEMPRE se muestra para avisarle al usuario.
  //
  // Caso especial: si el carrito tenía un ÚNICO producto (sin importar en
  // cuántas líneas/unidades esté repartido) y ese es el que se quedó sin
  // stock, no queda nada que cobrar — se avisa igual con el modal, pero
  // al cerrarlo se limpia todo y se regresa a la pantalla anterior.
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
      cart.forEach((line) => {
        const productId = line.product.product_id;
        const availableStock = stockByProduct.get(productId) ?? 0;
        const requestedQty = totalQtyForProduct(cart, productId);
        if (requestedQty > availableStock) {
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

  // Se llama al cerrar/confirmar el modal de stock insuficiente. Si era
  // el caso de "único producto y sin stock", recién ahí se limpia el
  // carrito y se regresa a la pantalla anterior — dejando antes un aviso
  // en useStockAlertStore para que Pos.tsx muestre un banner señalando
  // el producto (router.back() no puede pasarle datos directamente).
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
        // TODO: confirmar de dónde viene la sesión de caja abierta real.
        cash_register_session_id: session?.id ?? 0,
        ...(customerId
          ? {
              customer_id: customerId,
              customer_type_id:
                selectedCustomer?.customer_type_id ??
                customerTypeId ??
                undefined,
            }
          : {}),
        channel: "pos",
        tax: 0,
        // Solo se mandan las líneas "cobrables": las bloqueadas por falta
        // de stock quedan fuera del pedido.
        items: purchasableCart.map((l) => ({
          product_id: l.product.product_id,
          product_name: l.product.name,
          // TODO: si el backend espera la subcategoría (hoja) en vez de la
          // categoría genérica, cambiar a subcategory_id/subcategory_name.
          category_id: l.product.category_id,
          category_name: l.product.category_name,
          // `quantity` ya está en unidades base.
          quantity: l.quantity,
          // FIX: antes era `l.product.price` (precio normal fijo, siempre
          // el mismo sin importar mayoreo o precio especial de
          // conversión). Ahora es el precio real que se está cobrando por
          // UNA unidad base de esta línea — respeta tanto el precio
          // especial de conversión como el de mayoreo si ya aplica.
          unit_price: basePriceForLine(cart, l),
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
      // Otros errores quedan disponibles en checkout.error para mostrarse
      // abajo con el mensaje genérico.
    }
  }

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
              {cart.map((line) => {
                // FIX: antes se mostraba y calculaba todo con
                // `line.product.price` fijo. Ahora se resuelve el precio
                // real de esta línea (por unidad base) igual que en el
                // total y en el payload de checkout.
                const pricePerBaseUnit = basePriceForLine(cart, line);
                const wholesale = isWholesaleActiveFor(cart, line.product);
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
                        {/* `quantity` ya está en unidades base: se muestra junto
                          al código de la unidad base, y si se compró en una
                          unidad distinta (ej. "Caja"), se aclara entre
                          paréntesis cuántas de esas representa. */}
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
                        {formatCurrency(lineTotal(cart, line))}
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
                  {selectedCustomer
                    ? selectedCustomer.name
                    : (customerTypes.find((t) => t.id === customerTypeId)
                        ?.name ?? "Público general")}
                </Text>
                {creditAvailable && (
                  <HStack
                    space="xs"
                    className="items-center rounded bg-blue-50 px-1.5 py-0.5"
                  >
                    <Icon as={CreditCard} size="xs" className="text-blue-600" />
                    <Text className="text-[10px] font-medium text-blue-600">
                      disponible{" "}
                      {formatCurrency(selectedCredit?.credit_available ?? 0)}
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
                  <Text className="text-xs font-medium text-gray-500">
                    Cliente específico (habilita crédito si aplica)
                  </Text>
                  <Select
                    selectedValue={customerId != null ? String(customerId) : ""}
                    onValueChange={(v) => setCustomerId(v ? Number(v) : null)}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="sm"
                      className="justify-between border-gray-300 bg-white"
                    >
                      <SelectInput
                        placeholder="Sin cliente asignado"
                        value={selectedCustomer?.name ?? ""}
                        className="text-sm text-gray-900"
                      />
                      <Icon
                        as={ChevronDown}
                        size="xs"
                        className="mr-2 text-gray-400"
                      />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent className="bg-white">
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Sin cliente asignado" value="" />
                        {(customerCredits ?? []).map((c) => (
                          <SelectItem
                            key={c.id}
                            label={`${c.customer.name}${
                              c.customer.document_number
                                ? " · " + c.customer.document_number
                                : ""
                            }`}
                            value={String(c.customer_id)}
                          />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
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
                // Con un solo método, el monto es fijo (100% del total) y no
                // se puede tocar; recién se habilita a escribir al dividir.
                const amountEditable = !singleMethod;
                const displayedAmount = singleMethod
                  ? total.toFixed(2)
                  : entry.amount;

                return (
                  <VStack
                    key={entry.key}
                    space="xs"
                    className="rounded-lg border border-gray-100 p-2"
                  >
                    <HStack space="xs" className="items-center">
                      <Select
                        selectedValue={
                          entry.isCredit
                            ? "credit"
                            : String(entry.paymentMethodId ?? "")
                        }
                        onValueChange={(v) =>
                          v === "credit"
                            ? setEntryCredit(entry.key)
                            : setEntryMethod(entry.key, Number(v))
                        }
                        className="flex-1"
                      >
                        <SelectTrigger
                          variant="outline"
                          size="sm"
                          className="justify-between border-gray-300 bg-white"
                        >
                          <SelectInput
                            value={
                              entry.isCredit
                                ? "Crédito"
                                : (methodById(entry.paymentMethodId)?.method ??
                                  "")
                            }
                            className="text-sm text-gray-900"
                          />
                          <Icon
                            as={ChevronDown}
                            size="xs"
                            className="mr-2 text-gray-400"
                          />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent className="bg-white">
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {methods.map((m) => (
                              <SelectItem
                                key={m.id}
                                label={m.method}
                                value={String(m.id)}
                              />
                            ))}
                            {/* Crédito solo aparece si hay un cliente con crédito habilitado y saldo disponible */}
                            {creditAvailable && (
                              <SelectItem label="Crédito" value="credit" />
                            )}
                          </SelectContent>
                        </SelectPortal>
                      </Select>

                      <Input
                        variant="outline"
                        size="sm"
                        isReadOnly={!amountEditable}
                        className={`flex-1 border-gray-300 ${
                          amountEditable ? "bg-white" : "bg-gray-100"
                        }`}
                      >
                        <InputField
                          value={displayedAmount}
                          onChangeText={
                            amountEditable
                              ? (v) =>
                                  updateEntry(entry.key, {
                                    amount: sanitizeDecimal(v),
                                  })
                              : undefined
                          }
                          editable={amountEditable}
                          placeholder="0.00"
                          keyboardType="decimal-pad"
                          className={`text-sm ${
                            amountEditable ? "text-gray-900" : "text-gray-500"
                          }`}
                        />
                      </Input>

                      {entries.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeEntry(entry.key)}
                        >
                          <Icon as={X} size="sm" className="text-gray-400" />
                        </TouchableOpacity>
                      )}
                    </HStack>

                    {!entry.isCredit && cash && (
                      <Input
                        variant="outline"
                        size="sm"
                        className="border-gray-300 bg-white"
                      >
                        <InputField
                          value={entry.amountReceived}
                          onChangeText={(v) =>
                            updateEntry(entry.key, {
                              amountReceived: sanitizeDecimal(v),
                            })
                          }
                          placeholder="Efectivo recibido (para calcular cambio)"
                          keyboardType="decimal-pad"
                          className="text-sm text-gray-900"
                        />
                      </Input>
                    )}

                    {!entry.isCredit && !cash && (
                      <Input
                        variant="outline"
                        size="sm"
                        className="border-gray-300 bg-white"
                      >
                        <InputField
                          value={entry.reference}
                          onChangeText={(v) =>
                            updateEntry(entry.key, { reference: v })
                          }
                          placeholder="Referencia (opcional)"
                          className="text-sm text-gray-900"
                        />
                      </Input>
                    )}
                  </VStack>
                );
              })}

              <VStack space="xs">
                {remaining > 0.005 ? (
                  <Text className="text-sm font-medium text-red-600">
                    Faltan {formatCurrency(remaining)}
                  </Text>
                ) : cashChange > 0.005 ? (
                  <Text className="text-sm font-medium text-blue-600">
                    Cambio: {formatCurrency(cashChange)}
                  </Text>
                ) : null}

                {creditUsed > 0 && (
                  <Text
                    className={`flex-row items-center text-xs ${
                      creditOverLimit ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    Crédito: {formatCurrency(creditUsed)} de{" "}
                    {formatCurrency(selectedCredit?.credit_available ?? 0)}{" "}
                    disponibles
                    {creditOverLimit && " · excede lo disponible"}
                  </Text>
                )}
              </VStack>

              {!creditAvailable && (
                <Text className="text-xs text-gray-400">
                  El crédito solo está disponible seleccionando un cliente con
                  crédito habilitado y saldo disponible arriba.
                </Text>
              )}
            </VStack>

            {checkout.isError && !isInsufficientStockError(checkout.error) && (
              <Text className="text-sm font-medium text-red-600">
                No se pudo registrar la venta. Intenta de nuevo.
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

      {/* Modal de stock insuficiente: al fallar el checkout por esta
        razón, se refresca el catálogo y se identifica cuál producto ya
        no tiene stock. Si era el único producto del carrito, al cerrar
        el modal se limpia todo y se regresa a la pantalla anterior; si
        hay más productos, ese queda marcado en el resumen (arriba) y
        excluido del total, y el resto del carrito no se toca. */}
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
                  No se pudo registrar la venta: los siguientes productos ya no
                  tienen existencias suficientes. Quedaron marcados en el
                  resumen y no se incluyen en el total — puedes quitarlos o
                  ajustar la cantidad y volver a intentar.
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
                No se pudo registrar la venta por falta de stock. Ya
                actualizamos las existencias; revisa el resumen del pedido y
                vuelve a intentar.
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
