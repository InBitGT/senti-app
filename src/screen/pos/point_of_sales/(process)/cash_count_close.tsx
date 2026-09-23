import { AppInput } from "@/components/atom/AppInput/AppInput";
import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCloseCashRegister } from "@/src/hooks/useCloseCashRegister/useCloseCashRegister";
import { useAuthStore } from "@/src/store";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import { sanitizeDecimal } from "@/src/utils/sanitizeDecimal/sanitizeDecimal";
import { router } from "expo-router";
import {
  AlertTriangle,
  ChevronLeft,
  CreditCard,
  Landmark,
  Minus,
  Plus,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Pagos con tarjeta: aún no está integrado el conciliado con el
// procesador/lote de tarjeta, así que por ahora este medio de pago
// queda deshabilitado en la UI. Cuando esté listo, basta con poner
// esto en `true` para habilitar el input.
const CARD_PAYMENTS_ENABLED = false;

type Denomination = {
  value: number;
  label: string;
  kind: "billete" | "moneda";
};

const DENOMINATIONS: Denomination[] = [
  { value: 200, label: "Q200", kind: "billete" },
  { value: 100, label: "Q100", kind: "billete" },
  { value: 50, label: "Q50", kind: "billete" },
  { value: 20, label: "Q20", kind: "billete" },
  { value: 10, label: "Q10", kind: "billete" },
  { value: 5, label: "Q5", kind: "billete" },
  { value: 1, label: "Q1", kind: "moneda" },
  { value: 0.5, label: "Q0.50", kind: "moneda" },
  { value: 0.25, label: "Q0.25", kind: "moneda" },
  { value: 0.1, label: "Q0.10", kind: "moneda" },
  { value: 0.05, label: "Q0.05", kind: "moneda" },
];

type CashInputMode = "detailed" | "total";

export default function CashCountScreen() {
  const session = useCashRegisterSessionStore((s) => s.session);

  const claims = useAuthStore((s) => s.claims);
  const { closeCashRegister } = useCloseCashRegister();

  const [cashMode, setCashMode] = useState<CashInputMode>("detailed");
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [cashTotalRaw, setCashTotalRaw] = useState("");
  const [transferAmountRaw, setTransferAmountRaw] = useState("");
  const [cardAmountRaw, setCardAmountRaw] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      router.back();
    }
  }, [session]);

  const detailedCashTotal = useMemo(
    () =>
      DENOMINATIONS.reduce(
        (acc, d) => acc + d.value * (counts[d.value] ?? 0),
        0,
      ),
    [counts],
  );

  const manualCashTotal = Number.parseFloat(cashTotalRaw) || 0;
  const cashTotal =
    cashMode === "detailed" ? detailedCashTotal : manualCashTotal;

  const transferAmount = Number.parseFloat(transferAmountRaw) || 0;
  const cardAmount = CARD_PAYMENTS_ENABLED
    ? Number.parseFloat(cardAmountRaw) || 0
    : 0;

  const total = cashTotal + transferAmount + cardAmount;

  function updateCount(value: number, next: number) {
    setCounts((prev) => ({ ...prev, [value]: Math.max(0, next) }));
  }

  function handleCountInput(value: number, text: string) {
    const clean = text.replace(/[^0-9]/g, "");
    if (clean === "") {
      updateCount(value, 0);
      return;
    }
    updateCount(value, Number.parseInt(clean, 10));
  }

  function handleModeChange(mode: CashInputMode) {
    setCashMode(mode);
    // Al cambiar de modo, se limpia el otro para no dejar datos
    // "fantasma" que no correspondan a lo que el usuario ve activo.
    if (mode === "detailed") {
      setCashTotalRaw("");
    } else {
      setCounts({});
    }
  }

  const bills = DENOMINATIONS.filter((d) => d.kind === "billete");
  const coins = DENOMINATIONS.filter((d) => d.kind === "moneda");

  async function handleConfirmClose() {
    if (!claims || !session) return;
    try {
      await closeCashRegister.mutateAsync({
        sessionId: session.id,
        payload: {
          user_id: claims.sub,
          closing_amount: total,
        },
      });
      router.replace("/(drawer)/(pos)/(process)/receipt");
    } catch {
      // El error queda disponible en closeCashRegister.error para mostrarlo
      // dentro del modal; no lo cerramos para que el usuario vea el mensaje.
    }
  }

  function renderRow(d: Denomination) {
    const qty = counts[d.value] ?? 0;
    const subtotal = d.value * qty;
    return (
      <HStack
        key={d.value}
        className="items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
      >
        <VStack className="w-16">
          <Text className="text-sm font-semibold text-gray-900">{d.label}</Text>
          <Text className="text-[10px] text-gray-400">{d.kind}</Text>
        </VStack>

        <HStack space="sm" className="items-center">
          <TouchableOpacity
            onPress={() => updateCount(d.value, qty - 1)}
            className="h-8 w-8 items-center justify-center rounded-md border border-gray-200"
          >
            <Icon as={Minus} size="xs" className="text-gray-600" />
          </TouchableOpacity>

          <AppInput
            value={String(qty)}
            onChangeText={(v) => handleCountInput(d.value, v)}
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
          />

          <TouchableOpacity
            onPress={() => updateCount(d.value, qty + 1)}
            className="h-8 w-8 items-center justify-center rounded-md border border-gray-200"
          >
            <Icon as={Plus} size="xs" className="text-gray-600" />
          </TouchableOpacity>
        </HStack>

        <Text className="w-20 text-right text-sm font-medium text-gray-700">
          {formatCurrency(subtotal)}
        </Text>
      </HStack>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <VStack className="flex-1 bg-white">
        <HStack className="items-center border-b border-gray-100 px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="pr-2">
            <Icon as={ChevronLeft} size="sm" className="text-gray-600" />
          </TouchableOpacity>
          <Heading size="md" className="text-gray-900">
            Conteo de efectivo · {session.cash_register.name}
          </Heading>
        </HStack>

        <ScrollView contentContainerClassName="p-4" className="flex-1">
          <VStack space="md">
            <VStack space="xs">
              <HStack className="items-center justify-between">
                <Text className="text-xs font-medium text-gray-500">
                  Efectivo
                </Text>

                <HStack className="rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <TouchableOpacity
                    onPress={() => handleModeChange("detailed")}
                  >
                    <Box
                      className={`rounded-md px-2.5 py-1 ${
                        cashMode === "detailed" ? "bg-white" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          cashMode === "detailed"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        Contar billetes
                      </Text>
                    </Box>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleModeChange("total")}>
                    <Box
                      className={`rounded-md px-2.5 py-1 ${
                        cashMode === "total" ? "bg-white" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          cashMode === "total"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        Solo total
                      </Text>
                    </Box>
                  </TouchableOpacity>
                </HStack>
              </HStack>

              {cashMode === "total" && (
                <HStack
                  className="items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  space="sm"
                >
                  <Text className="text-sm text-gray-900">
                    Monto total en efectivo
                  </Text>
                  <AppInput
                    value={cashTotalRaw}
                    onChangeText={(v) => setCashTotalRaw(sanitizeDecimal(v))}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    containerStyle={{ width: 128 }}
                    inputStyle={{
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: "500",
                      paddingVertical: 6,
                    }}
                  />
                </HStack>
              )}
            </VStack>

            {cashMode === "detailed" && (
              <>
                <VStack space="xs">
                  <Text className="text-xs font-medium text-gray-500">
                    Billetes
                  </Text>
                  <VStack space="xs">{bills.map(renderRow)}</VStack>
                </VStack>

                <VStack space="xs">
                  <Text className="text-xs font-medium text-gray-500">
                    Monedas / fichas
                  </Text>
                  <VStack space="xs">{coins.map(renderRow)}</VStack>
                </VStack>
              </>
            )}

            <VStack space="xs" className="border-t border-gray-100 pt-3">
              <Text className="text-xs font-medium text-gray-500">
                Otros medios de pago
              </Text>

              <HStack
                className="items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                space="sm"
              >
                <HStack space="xs" className="items-center">
                  <Icon as={Landmark} size="xs" className="text-blue-600" />
                  <Text className="text-sm text-gray-900">Transferencia</Text>
                </HStack>
                <AppInput
                  value={transferAmountRaw}
                  onChangeText={(v) => setTransferAmountRaw(sanitizeDecimal(v))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  containerStyle={{ width: 112 }}
                  inputStyle={{
                    textAlign: "right",
                    fontSize: 14,
                    fontWeight: "500",
                    paddingVertical: 6,
                  }}
                />
              </HStack>

              <HStack
                className="items-center justify-between rounded-lg border border-gray-100 px-3 py-2 opacity-50"
                space="sm"
              >
                <HStack space="xs" className="items-center">
                  <Icon as={CreditCard} size="xs" className="text-gray-400" />
                  <VStack>
                    <Text className="text-sm text-gray-500">Tarjeta</Text>
                    <Text className="text-[10px] text-gray-400">
                      Próximamente
                    </Text>
                  </VStack>
                </HStack>
                <AppInput
                  value={cardAmountRaw}
                  onChangeText={(v) => setCardAmountRaw(sanitizeDecimal(v))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  isDisabled={!CARD_PAYMENTS_ENABLED}
                  containerStyle={{ width: 112 }}
                  inputStyle={{
                    textAlign: "right",
                    fontSize: 14,
                    fontWeight: "500",
                    paddingVertical: 6,
                  }}
                />
              </HStack>
            </VStack>
          </VStack>
        </ScrollView>

        <VStack space="sm" className="border-t border-gray-100 p-4">
          <VStack space="xs">
            <HStack className="items-center justify-between">
              <Text className="text-xs text-gray-500">
                Efectivo{cashMode === "total" ? " (monto directo)" : ""}
              </Text>
              <Text className="text-xs font-medium text-gray-700">
                {formatCurrency(cashTotal)}
              </Text>
            </HStack>
            <HStack className="items-center justify-between">
              <Text className="text-xs text-gray-500">Transferencia</Text>
              <Text className="text-xs font-medium text-gray-700">
                {formatCurrency(transferAmount)}
              </Text>
            </HStack>
            {CARD_PAYMENTS_ENABLED && (
              <HStack className="items-center justify-between">
                <Text className="text-xs text-gray-500">Tarjeta</Text>
                <Text className="text-xs font-medium text-gray-700">
                  {formatCurrency(cardAmount)}
                </Text>
              </HStack>
            )}
          </VStack>

          <HStack className="items-center justify-between border-t border-gray-100 pt-2">
            <Text className="text-sm text-gray-500">Total contado</Text>
            <Text className="text-xl font-bold text-gray-900">
              {formatCurrency(total)}
            </Text>
          </HStack>

          <Button
            className={total <= 0 ? "bg-gray-300" : "bg-black"}
            isDisabled={total <= 0}
            onPress={() => setConfirmOpen(true)}
          >
            <ButtonText className="text-white">Cerrar caja</ButtonText>
          </Button>
        </VStack>

        <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <ModalBackdrop />
          <ModalContent className="bg-white">
            <ModalHeader className="items-center justify-between">
              <HStack space="xs" className="items-center">
                <Icon as={AlertTriangle} size="sm" className="text-amber-600" />
                <Heading size="md" className="text-gray-900">
                  Confirmar cierre de caja
                </Heading>
              </HStack>
            </ModalHeader>

            <ModalBody>
              <VStack space="md">
                <Text className="text-sm text-gray-700">
                  ¿Confirmás que el total contado es{" "}
                  <Text className="font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </Text>
                  ?
                </Text>

                <VStack
                  space="xs"
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <HStack className="items-center justify-between">
                    <Text className="text-xs text-gray-500">
                      Efectivo{cashMode === "total" ? " (monto directo)" : ""}
                    </Text>
                    <Text className="text-xs font-medium text-gray-700">
                      {formatCurrency(cashTotal)}
                    </Text>
                  </HStack>
                  <HStack className="items-center justify-between">
                    <Text className="text-xs text-gray-500">Transferencia</Text>
                    <Text className="text-xs font-medium text-gray-700">
                      {formatCurrency(transferAmount)}
                    </Text>
                  </HStack>
                  {CARD_PAYMENTS_ENABLED && (
                    <HStack className="items-center justify-between">
                      <Text className="text-xs text-gray-500">Tarjeta</Text>
                      <Text className="text-xs font-medium text-gray-700">
                        {formatCurrency(cardAmount)}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                {closeCashRegister.isError && (
                  <Text className="text-sm font-medium text-red-600">
                    {closeCashRegister.error?.message ??
                      "No se pudo cerrar la caja."}
                  </Text>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter className="gap-2">
              <Box className="flex-1">
                <Button
                  variant="outline"
                  onPress={() => setConfirmOpen(false)}
                  isDisabled={closeCashRegister.isPending}
                >
                  <ButtonText className="text-gray-700">Revisar</ButtonText>
                </Button>
              </Box>
              <Box className="flex-1">
                <Button
                  className="bg-black"
                  onPress={handleConfirmClose}
                  isDisabled={closeCashRegister.isPending}
                >
                  <ButtonText className="text-white">
                    {closeCashRegister.isPending
                      ? "Cerrando..."
                      : "Sí, cerrar caja"}
                  </ButtonText>
                </Button>
              </Box>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </SafeAreaView>
  );
}
