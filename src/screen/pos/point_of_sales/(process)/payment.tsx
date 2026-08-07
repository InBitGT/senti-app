import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { usePaymentMethod } from "@/src/hooks/usePaymentsMethods/usePaymentsMethods";
import { useVaucherStore } from "@/src/store/useVaucherStore/useVaucherStore";
import { VaucherPayment } from "@/src/types/vaucher/vaucher";
import { router } from "expo-router";
import {
  CheckCircle2,
  CreditCard,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export const Payment: React.FC = () => {
  const order = useVaucherStore((s) => s.order);
  const clearOrder = useVaucherStore((s) => s.clearOrder);
  const { data: paymentMethods } = usePaymentMethod();

  function methodName(payment: VaucherPayment) {
    // El backend a veces manda payment_method_id 0 para líneas de crédito
    // (no hay un método "0" real en el catálogo).
    if (!payment.payment_method_id) return "Crédito";
    return (
      paymentMethods?.find((m) => m.id === payment.payment_method_id)?.method ??
      `Método #${payment.payment_method_id}`
    );
  }

  function newSale() {
    clearOrder();
    router.replace("/(drawer)/(pos)/point_of_sales");
  }

  if (!order) {
    return (
      <VStack className="flex-1 items-center justify-center gap-3 bg-gray-50 px-6">
        <Icon as={Receipt} size="xl" className="text-gray-300" />
        <Text className="text-center text-gray-500">
          No hay ninguna venta para mostrar.
        </Text>
        <Button className="bg-blue-600" onPress={newSale}>
          <ButtonText className="text-white">Ir al punto de venta</ButtonText>
        </Button>
      </VStack>
    );
  }

  const totalChange = order.payments.reduce(
    (sum, p) => sum + (p.change_amount ?? 0),
    0,
  );

  return (
    <VStack className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <VStack space="lg" className="mx-auto w-full max-w-md">
          {/* Encabezado de éxito */}
          <VStack className="items-center gap-2 py-4">
            <Box className="h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Icon as={CheckCircle2} size="xl" className="text-blue-600" />
            </Box>
            <Heading size="lg" className="text-gray-900">
              ¡Venta completada!
            </Heading>
            <Text className="text-sm text-gray-500">
              Orden #{order.id} · {formatDate(order.created_at)}
            </Text>
          </VStack>

          {/* Voucher */}
          <VStack className="rounded-xl border border-gray-200 bg-white">
            <HStack className="items-center justify-between border-b border-dashed border-gray-200 p-4">
              <VStack>
                <Text className="text-xs text-gray-400">Cliente</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {order.customer_id
                    ? `Cliente #${order.customer_id}`
                    : "Público general"}
                </Text>
              </VStack>
              <VStack className="items-end">
                <Text className="text-xs text-gray-400">Sucursal / Bodega</Text>
                <Text className="text-sm font-medium text-gray-900">
                  #{order.branch_id} / #{order.warehouse_id}
                </Text>
              </VStack>
            </HStack>

            {/* Ítems */}
            <VStack
              className="border-b border-dashed border-gray-200 p-4"
              space="sm"
            >
              {order.items.map((item) => (
                <HStack key={item.id} className="items-start justify-between">
                  <VStack className="flex-1 pr-2">
                    <Text
                      className="text-sm font-medium text-gray-900"
                      numberOfLines={1}
                    >
                      {item.product_name}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                      {item.discount > 0 &&
                        `  ·  -${formatCurrency(item.discount)}`}
                    </Text>
                  </VStack>
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </Text>
                </HStack>
              ))}
            </VStack>

            {/* Totales */}
            <VStack
              className="border-b border-dashed border-gray-200 p-4"
              space="xs"
            >
              <HStack className="justify-between">
                <Text className="text-sm text-gray-500">Subtotal</Text>
                <Text className="text-sm text-gray-900">
                  {formatCurrency(order.subtotal)}
                </Text>
              </HStack>
              {order.total_discount > 0 && (
                <HStack className="justify-between">
                  <Text className="text-sm text-gray-500">Descuento</Text>
                  <Text className="text-sm text-blue-600">
                    -{formatCurrency(order.total_discount)}
                  </Text>
                </HStack>
              )}
              {order.tax > 0 && (
                <HStack className="justify-between">
                  <Text className="text-sm text-gray-500">Impuesto</Text>
                  <Text className="text-sm text-gray-900">
                    {formatCurrency(order.tax)}
                  </Text>
                </HStack>
              )}
              <HStack className="justify-between pt-1">
                <Text className="text-base font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </Text>
              </HStack>
            </VStack>

            {/* Pagos */}
            <VStack className="p-4" space="sm">
              <HStack space="xs" className="items-center">
                <Icon as={Wallet} size="xs" className="text-gray-400" />
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Pagos
                </Text>
              </HStack>
              {order.payments.map((payment) => (
                <HStack
                  key={payment.id}
                  className="items-center justify-between"
                >
                  <HStack space="xs" className="items-center">
                    {!payment.payment_method_id && (
                      <Icon
                        as={CreditCard}
                        size="xs"
                        className="text-blue-600"
                      />
                    )}
                    <VStack>
                      <Text className="text-sm text-gray-900">
                        {methodName(payment)}
                      </Text>
                      {payment.reference && (
                        <Text className="text-xs text-gray-400">
                          {payment.reference}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <Text className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </Text>
                </HStack>
              ))}

              {totalChange > 0.005 && (
                <HStack className="justify-between border-t border-gray-100 pt-2">
                  <Text className="text-sm font-medium text-blue-600">
                    Cambio
                  </Text>
                  <Text className="text-sm font-semibold text-blue-600">
                    {formatCurrency(totalChange)}
                  </Text>
                </HStack>
              )}
            </VStack>

            {order.fiscal_documents.length > 0 && (
              <HStack
                space="xs"
                className="items-center border-t border-gray-100 bg-gray-50 p-3"
              >
                <Icon as={Receipt} size="xs" className="text-gray-500" />
                <Text className="text-xs text-gray-500">
                  Documento fiscal generado
                </Text>
              </HStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      <VStack className="border-t border-gray-200 bg-white p-4">
        <Button className="bg-blue-600" onPress={newSale}>
          <Icon as={Plus} size="sm" className="mr-1 text-white" />
          <ButtonText className="text-white">Nueva venta</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};
