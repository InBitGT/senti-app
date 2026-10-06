import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
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
import { useRecipeCatalog } from "@/src/hooks/useRecipePos/useRecipePos";
import { useAuthStore } from "@/src/store";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import {
  RecipeCartLine,
  useRecipeCartStore,
} from "@/src/store/useRecipeCartStore/useRecipeCartStore";
import { Customer } from "@/src/types/customer/customer";
import { PaymentMethod } from "@/src/types/payment_methods/payment_methods";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import {
  isRecipeWholesaleActive,
  recipeBasePrice,
  recipeModifierUsed,
  recipeStockLimit,
  recipeUnitPrice,
} from "@/src/utils/recipePos/recipePos";
import { sanitizeDecimal } from "@/src/utils/sanitizeDecimal/sanitizeDecimal";
import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  Pencil,
  Plus,
  UserCheck,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CASH_ALIASES = ["efectivo", "cash", "contado"];
const GENERIC_CHECKOUT_ERROR =
  "No se pudo registrar la venta. Intenta de nuevo.";

const GENERAL_CUSTOMER_VALUE = "general";
const CREDIT_VALUE = "credit";

function modifiersLabel(line: RecipeCartLine): string {
  const counts = new Map<string, number>();
  line.modifiers.forEach((modifier) => {
    counts.set(modifier.name, (counts.get(modifier.name) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => (count > 1 ? `${name} ×${count}` : name))
    .join(", ");
}

function categoryOf(line: RecipeCartLine): { id: number; name: string } {
  const p = line.product;
  const hasParent =
    p.parent_category_id != null && !!p.parent_category_name?.trim();
  return hasParent
    ? { id: p.parent_category_id ?? p.category_id, name: p.parent_category_name }
    : { id: p.category_id, name: p.category_name };
}

function isCashMethod(method?: PaymentMethod | null) {
  if (!method) return false;
  const normalized = method.method.toLowerCase();
  return CASH_ALIASES.some((alias) => normalized.includes(alias));
}

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
  return (
    err instanceof Error &&
    /stock insuficiente|no tiene stock/i.test(err.message)
  );
}

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
  paymentMethodId: number | null;
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

interface TypePriceOffState {
  typeId: number | null;
  ids: Set<number>;
}

export const RecipeCheckout: React.FC = () => {
  const claims = useAuthStore((s) => s.claims);
  const cart = useRecipeCartStore((s) => s.cart);
  const clearCart = useRecipeCartStore((s) => s.clearCart);
  const removeLine = useRecipeCartStore((s) => s.removeLine);
  const { data: customers } = useCustomer();
  const { data: paymentMethods, isLoading: isLoadingPayment } =
    usePaymentMethod();
  const { session } = useCashRegisterSessionStore();

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

  const rawCustomerTypeId =
    selectedCustomer?.customer_type_id || selectedCustomer?.customer_type?.id;
  const customerTypeId =
    rawCustomerTypeId != null && Number(rawCustomerTypeId) > 0
      ? Number(rawCustomerTypeId)
      : null;
  const customerTypeName = selectedCustomer?.customer_type?.name ?? "cliente";

  const { checkout, refetch, catalog } = useRecipeCatalog();

  const [typePriceOffState, setTypePriceOffState] = useState<TypePriceOffState>(
    () => ({ typeId: null, ids: new Set() }),
  );

  const typePriceOff = useMemo(
    () =>
      typePriceOffState.typeId === customerTypeId
        ? typePriceOffState.ids
        : new Set<number>(),
    [typePriceOffState, customerTypeId],
  );

  function toggleTypePrice(productId: number) {
    setTypePriceOffState((prev) => {
      const base =
        prev.typeId === customerTypeId ? prev.ids : new Set<number>();
      const next = new Set(base);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return { typeId: customerTypeId, ids: next };
    });
  }

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

  function hasTypePriceFor(line: RecipeCartLine): boolean {
    if (customerTypeId == null) return false;
    return (
      Math.abs(
        recipeBasePrice(line.product, customerTypeId) -
          recipeBasePrice(line.product, null),
      ) > 0.005
    );
  }

  function isWholesaleLine(line: RecipeCartLine): boolean {
    return isRecipeWholesaleActive(
      line.product,
      productTotalQty.get(line.product.product_id) ?? 0,
    );
  }

  function unitPriceFor(line: RecipeCartLine, applyTypePrice: boolean) {
    return recipeUnitPrice({
      product: line.product,
      variant: line.variant,
      modifiers: line.modifiers,
      customerTypeId: applyTypePrice ? customerTypeId : null,
      wholesaleActive: isWholesaleLine(line),
    });
  }

  function isTypePriceApplied(line: RecipeCartLine): boolean {
    return hasTypePriceFor(line) && !typePriceOff.has(line.product.product_id);
  }

  function lineUnitPrice(line: RecipeCartLine): number {
    return unitPriceFor(line, isTypePriceApplied(line));
  }

  function lineTotal(line: RecipeCartLine): number {
    return line.quantity * lineUnitPrice(line);
  }

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

  const [entries, setEntries] = useState<PaymentEntryState[]>(() => [
    newEntry(),
  ]);

  const resolvedEntries: PaymentEntryState[] = entries.map((e, i) => {
    if (e.isCredit && !creditAvailable) {
      return {
        ...e,
        isCredit: false,
        paymentMethodId: methods[0]?.id ?? null,
        amountReceived: "",
        reference: "",
      };
    }
    if (
      i === 0 &&
      !e.isCredit &&
      e.paymentMethodId == null &&
      methods.length > 0
    ) {
      return { ...e, paymentMethodId: methods[0].id };
    }
    return e;
  });

  const [stockErrorOpen, setStockErrorOpen] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);
  const [rawBlockedProductIds, setRawBlockedProductIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [returnAfterStockAck, setReturnAfterStockAck] = useState(false);

  const blockedProductIds = useMemo(() => {
    if (rawBlockedProductIds.size === 0) return rawBlockedProductIds;
    const stillInCart = new Set(cart.map((l) => l.product.product_id));
    return new Set(
      [...rawBlockedProductIds].filter((id) => stillInCart.has(id)),
    );
  }, [rawBlockedProductIds, cart]);

  function handleCustomerChange(v: string) {
    const nextId = v && v !== GENERAL_CUSTOMER_VALUE ? Number(v) : null;
    setCustomerId(nextId);

    const nextCustomer =
      nextId != null
        ? (activeCustomers.find((c) => c.id === nextId) ?? null)
        : null;
    if (!hasActiveCredit(nextCustomer)) {
      setEntries((prev) =>
        prev.some((e) => e.isCredit)
          ? prev.map((e) => (e.isCredit ? newEntry(methods[0]?.id ?? null) : e))
          : prev,
      );
    }
  }

  const purchasableCart = cart.filter(
    (l) => !blockedProductIds.has(l.product.product_id),
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

  const total = purchasableCart.reduce((sum, l) => sum + lineTotal(l), 0);

  const singleMethod = resolvedEntries.length === 1;

  function amountFor(entry: PaymentEntryState) {
    if (singleMethod) return total;
    return Number.parseFloat(entry.amount) || 0;
  }

  const paid = resolvedEntries.reduce((sum, e) => sum + amountFor(e), 0);
  const remaining = Math.round((total - paid) * 100) / 100;

  const creditUsed = resolvedEntries
    .filter((e) => e.isCredit)
    .reduce((sum, e) => sum + amountFor(e), 0);
  const creditOverLimit = creditAvailable && creditUsed > creditLimit + 0.005;

  const cashChange = resolvedEntries
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
    const usedIds = new Set(resolvedEntries.map((e) => e.paymentMethodId));
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

    setRawBlockedProductIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }

  const missingFiscal =
    generateFiscal && (!fiscalNit.trim() || !fiscalName.trim());
  const missingMethod = resolvedEntries.some(
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

      const nowBlocked = new Set<number>();
      const poolQty = new Map<string, number>();
      cart.forEach((l) => {
        const key = `${l.product.product_id}-${l.variant?.id ?? "base"}`;
        poolQty.set(key, (poolQty.get(key) ?? 0) + l.quantity);
      });

      cart.forEach((l) => {
        const fresh = freshCatalog.find(
          (p) => p.product_id === l.product.product_id,
        );
        const freshVariant = l.variant
          ? (fresh?.variants.find((v) => v.id === l.variant?.id) ?? null)
          : null;
        const available = fresh ? recipeStockLimit(fresh, freshVariant) : 0;
        const key = `${l.product.product_id}-${l.variant?.id ?? "base"}`;
        if ((poolQty.get(key) ?? 0) > available) {
          nowBlocked.add(l.product.product_id);
        }
        l.modifiers.forEach((modifier) => {
          const freshModifier = fresh?.modifiers.find(
            (item) => item.modifier_product_id === modifier.modifier_product_id,
          );
          const modifierStock = freshModifier?.stock_qty;
          if (
            modifierStock != null &&
            recipeModifierUsed(cart, modifier.modifier_product_id) >
              modifierStock
          ) {
            nowBlocked.add(l.product.product_id);
          }
        });
      });

      const cartProductIds = new Set(cart.map((l) => l.product.product_id));
      const onlyProductInCart = cartProductIds.size === 1;
      const thatProductIsBlocked =
        onlyProductInCart && nowBlocked.has([...cartProductIds][0]);

      setRawBlockedProductIds(nowBlocked);
      setReturnAfterStockAck(thatProductIsBlocked);
    } finally {
      setCheckingStock(false);
    }
  }

  function handleStockModalClose() {
    setStockErrorOpen(false);
    if (returnAfterStockAck) {
      clearCart();
      setRawBlockedProductIds(new Set());
      setReturnAfterStockAck(false);
      router.back();
    }
  }

  async function handleSubmit() {
    if (!claims) return;

    const payments = resolvedEntries.map((e) => {
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
        generate_kitchen_ticket: true,
        items: purchasableCart.map((l) => ({
          product_id: l.product.product_id,
          product_name: l.product.name,
          category_id: categoryOf(l).id,
          category_name: categoryOf(l).name,
          product_type: "recipe" as const,
          ...(l.variant ? { product_variant_id: l.variant.id } : {}),
          ...(l.modifiers.length > 0
            ? {
                modifier_product_ids: l.modifiers.map(
                  (modifier) => modifier.modifier_product_id,
                ),
              }
            : {}),
          ...(l.notes ? { notes: l.notes } : {}),
          quantity: l.quantity,
          unit_price: lineUnitPrice(l),
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
      setRawBlockedProductIds(new Set());
      router.navigate({
        pathname: "/(drawer)/(pos)/(process)/payment",
        params: { from: "recipe_pos" },
      });
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
            <VStack className="rounded-xl border border-gray-200 bg-white">
              <Text className="border-b border-gray-100 p-3 text-sm font-semibold text-gray-900">
                Resumen del pedido
              </Text>
              {cart.map((line, index) => {
                const productId = line.product.product_id;
                const unitPrice = lineUnitPrice(line);
                const wholesale = isWholesaleLine(line);
                const isBlocked = blockedProductIds.has(productId);
                const hasTypePrice = hasTypePriceFor(line);
                const typePriceApplied = isTypePriceApplied(line);
                const normalUnitPrice = unitPriceFor(line, false);

                return (
                  <VStack
                    key={`${productId}-${index}`}
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
                          {typePriceApplied && !isBlocked && (
                            <Box className="flex-row items-center gap-1 rounded-full bg-purple-100 px-1.5 py-0.5">
                              <Icon
                                as={UserCheck}
                                size="xs"
                                className="text-purple-700"
                              />
                              <Text className="text-[9px] font-semibold text-purple-700">
                                precio {customerTypeName}
                              </Text>
                            </Box>
                          )}
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
                        {!!line.variant && (
                          <Text className="text-xs text-purple-700">
                            {line.variant.name}
                          </Text>
                        )}
                        {line.modifiers.length > 0 && (
                          <Text className="text-xs text-amber-700">
                            + {modifiersLabel(line)}
                          </Text>
                        )}
                        {!!line.notes && (
                          <Text className="text-xs italic text-gray-500">
                            {line.notes}
                          </Text>
                        )}
                        <Text
                          className={`text-xs ${
                            isBlocked ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {line.quantity}
                          {" × "}
                          {formatCurrency(unitPrice)}
                          {typePriceApplied &&
                            Math.abs(normalUnitPrice - unitPrice) > 0.005 &&
                            ` (normal ${formatCurrency(normalUnitPrice)})`}
                        </Text>
                      </VStack>
                      <Text
                        className={`text-sm font-semibold ${
                          isBlocked
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(lineTotal(line))}
                      </Text>
                    </HStack>

                    {hasTypePrice && !isBlocked && (
                      <TouchableOpacity
                        onPress={() => toggleTypePrice(productId)}
                        className="self-start"
                      >
                        <Text className="text-[11px] font-medium text-blue-600">
                          {typePriceApplied
                            ? "Usar precio normal"
                            : `Aplicar precio ${customerTypeName}`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {isBlocked && (
                      <HStack className="items-center justify-between">
                        <Text className="flex-1 text-[11px] text-red-600">
                          No hay stock suficiente. No se incluye en el total.
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeBlockedProduct(productId)}
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
                    onChange={handleCustomerChange}
                  />
                </VStack>
              )}
            </VStack>

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

              {resolvedEntries.map((entry) => {
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

                      {resolvedEntries.length > 1 && (
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
