import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashVoucherStore } from "@/src/store/useCashVoucher/useCashVoucher";
import { router } from "expo-router";
import {
    CheckCircle2,
    CreditCard,
    Receipt,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    User,
} from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export const CashCloseVoucher: React.FC = () => {
  const voucher = useCashVoucherStore((s) => s.data);
  const clearVoucher = useCashVoucherStore((s) => s.clearData);

  function goToPos() {
    clearVoucher();
    router.replace("/(drawer)/(pos)/point_of_sales");
  }

  if (!voucher) {
    return (
      <VStack className="flex-1 items-center justify-center gap-3 bg-gray-50 px-6">
        <Icon as={Receipt} size="xl" className="text-gray-300" />
        <Text className="text-center text-gray-500">
          No hay ningún cierre de caja para mostrar.
        </Text>
        <Button className="bg-blue-600" onPress={goToPos}>
          <ButtonText className="text-white">Ir al punto de venta</ButtonText>
        </Button>
      </VStack>
    );
  }

  const differenceOk = Math.abs(voucher.difference) < 0.005;
  const differencePositive = voucher.difference > 0;

  return (
    <VStack className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <VStack space="lg" className="mx-auto w-full max-w-md">
          {/* Encabezado */}
          <VStack className="items-center gap-2 py-4">
            <Box className="h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Icon as={CheckCircle2} size="xl" className="text-blue-600" />
            </Box>
            <Heading size="lg" className="text-gray-900">
              Caja cerrada
            </Heading>
            <Text className="text-sm text-gray-500">
              {voucher.cash_register_name} ·{" "}
              {formatDate(voucher.closing_datetime)}
            </Text>
          </VStack>

          {/* Voucher */}
          <VStack className="rounded-xl border border-gray-200 bg-white">
            {/* Montos de caja */}
            <VStack
              className="border-b border-dashed border-gray-200 p-4"
              space="xs"
            >
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">Monto de apertura</Text>
                <Text className="text-sm text-gray-900">
                  {formatCurrency(voucher.opening_amount)}
                </Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">Monto esperado</Text>
                <Text className="text-sm text-gray-900">
                  {formatCurrency(voucher.expected_amount)}
                </Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">
                  Monto de cierre (contado)
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(voucher.closing_amount)}
                </Text>
              </HStack>
              <HStack className="items-center justify-between pt-1">
                <Text className="text-base font-semibold text-gray-900">
                  Diferencia
                </Text>
                <HStack space="xs" className="items-center">
                  {!differenceOk && (
                    <Icon
                      as={differencePositive ? TrendingUp : TrendingDown}
                      size="xs"
                      className={
                        differencePositive ? "text-blue-600" : "text-red-600"
                      }
                    />
                  )}
                  <Text
                    className={`text-lg font-semibold ${
                      differenceOk
                        ? "text-gray-900"
                        : differencePositive
                          ? "text-blue-600"
                          : "text-red-600"
                    }`}
                  >
                    {differenceOk
                      ? "Cuadrada"
                      : formatCurrency(voucher.difference)}
                  </Text>
                </HStack>
              </HStack>
            </VStack>

            {/* Resumen de ventas */}
            <VStack
              className="border-b border-dashed border-gray-200 p-4"
              space="sm"
            >
              <HStack space="xs" className="items-center">
                <Icon as={ShoppingBag} size="xs" className="text-gray-400" />
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Ventas de la sesión
                </Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">Total vendido</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {formatCurrency(voucher.total_sales)}
                </Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">Órdenes</Text>
                <Text className="text-sm text-gray-900">
                  {voucher.total_orders}
                </Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">
                  Movimientos de caja
                </Text>
                <Text className="text-sm text-gray-900">
                  {voucher.total_movements}
                </Text>
              </HStack>
            </VStack>

            {/* Total por método de pago */}
            {voucher.total_by_method.length > 0 && (
              <VStack
                className="border-b border-dashed border-gray-200 p-4"
                space="sm"
              >
                <HStack space="xs" className="items-center">
                  <Icon as={CreditCard} size="xs" className="text-gray-400" />
                  <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Por método de pago
                  </Text>
                </HStack>
                {voucher.total_by_method.map((m, i) => (
                  <HStack key={`${m.method}-${i}`} className="justify-between">
                    <Text className="text-sm text-gray-700">{m.method}</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {formatCurrency(m.amount)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}

            {/* Usuarios */}
            {voucher.users.length > 0 && (
              <VStack
                className={
                  voucher.notes
                    ? "border-b border-dashed border-gray-200 p-4"
                    : "p-4"
                }
                space="sm"
              >
                <HStack space="xs" className="items-center">
                  <Icon as={User} size="xs" className="text-gray-400" />
                  <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Usuarios con acceso
                  </Text>
                </HStack>
                {voucher.users.map((u) => (
                  <HStack
                    key={u.user_id}
                    className="items-center justify-between"
                  >
                    <Text className="text-sm text-gray-900">
                      Usuario #{u.user_id}
                    </Text>
                    {u.can_close && (
                      <Text className="text-[10px] font-medium text-blue-600">
                        puede cerrar
                      </Text>
                    )}
                  </HStack>
                ))}
              </VStack>
            )}

            {/* Notas */}
            {voucher.notes && (
              <VStack className="p-4" space="xs">
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Notas
                </Text>
                <Text className="text-sm text-gray-700">{voucher.notes}</Text>
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      <VStack className="border-t border-gray-200 bg-white p-4">
        <Button className="bg-blue-600" onPress={goToPos}>
          <ButtonText className="text-white">
            Volver al punto de venta
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};
