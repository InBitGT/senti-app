import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
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
import { useCashRegister } from "@/src/hooks/useCashRegister/useCashRegister";
import { useCashRegisterUsers } from "@/src/hooks/useCashRegisterUsers/useCashRegisterUsers";
import { useOpenCashRegister } from "@/src/hooks/useOpenCashRegister/useOpenCashRegister";
import { useAuthStore } from "@/src/store";
import { ChevronDown, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

interface OpenCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpened: () => void;
}

function sanitizeDecimal(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
}

export const OpenCashRegisterModal: React.FC<OpenCashRegisterModalProps> = ({
  isOpen,
  onClose,
  onOpened,
}) => {
  const claims = useAuthStore((s) => s.claims);
  const { openCashRegister } = useOpenCashRegister();
  // Todos los usuarios del tenant (no filtrado por caja) — se piden en
  // cuanto el modal está abierto, no dependen de qué caja se elija.
  const { tenantUsers } = useCashRegisterUsers();
  const { data: cashRegistersData } = useCashRegister();

  // `data` es `CashRegister[] | undefined` hasta que termina de cargar —
  // se normaliza una sola vez acá y de ahí en más se usa `cashRegisters`
  // (nunca undefined) en todo el archivo.
  const cashRegisters = cashRegistersData ?? [];

  const [cashRegisterId, setCashRegisterId] = useState<number | null>(null);
  const [openingAmount, setOpeningAmount] = useState("");
  // can_close por usuario. Todos arrancan en false: el operador marca a
  // mano quién puede cerrar ESTA caja, el backend no sugiere nada acá.
  const [coUsers, setCoUsers] = useState<Record<number, boolean>>({});

  const otherUsers = (tenantUsers.data ?? []).filter(
    (u) => u.id !== claims?.sub, // el que abre ya va aparte, como user_id
  );

  // Con una sola caja disponible, se preselecciona sola; con varias, el
  // usuario tiene que elegir en el Select.
  useEffect(() => {
    if (cashRegisters.length === 1 && cashRegisterId == null) {
      setCashRegisterId(cashRegisters[0].id);
    }
  }, [cashRegisters, cashRegisterId]);

  function toggleCoUser(userId: number) {
    setCoUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  const amount = Number.parseFloat(openingAmount) || 0;
  const blocked =
    amount <= 0 ||
    cashRegisterId == null ||
    !claims ||
    openCashRegister.isPending;

  async function handleSubmit() {
    if (!claims || cashRegisterId == null) return;

    try {
      await openCashRegister.mutateAsync({
        cash_register_id: cashRegisterId,
        user_id: claims.sub,
        opening_amount: amount,
        users: otherUsers
          .filter((u) => coUsers[u.id] !== undefined) // solo los que el operador tocó
          .map((u) => ({
            user_id: u.id,
            can_close: !!coUsers[u.id],
          })),
      });
      setOpeningAmount("");
      setCoUsers({});
      onOpened();
      onClose();
    } catch {
      // El error queda disponible en openCashRegister.error para mostrarlo abajo.
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="items-center justify-between">
          <Heading size="md" className="text-gray-900">
            Abrir caja
          </Heading>
          <TouchableOpacity onPress={onClose}>
            <Icon as={X} size="sm" className="text-gray-400" />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody>
          <VStack space="md">
            <Text className="text-sm text-gray-500">
              No tenés una caja abierta. Elegí con cuál trabajar e ingresá el
              monto inicial para empezar a vender.
            </Text>

            {cashRegisters.length > 1 && (
              <VStack space="xs">
                <Text className="text-xs font-medium text-gray-500">Caja</Text>
                <Select
                  selectedValue={
                    cashRegisterId != null ? String(cashRegisterId) : ""
                  }
                  onValueChange={(v) => setCashRegisterId(v ? Number(v) : null)}
                >
                  <SelectTrigger
                    variant="outline"
                    size="md"
                    className="justify-between border-gray-300 bg-white"
                  >
                    <SelectInput
                      placeholder="Selecciona una caja"
                      value={
                        cashRegisters.find((r) => r.id === cashRegisterId)
                          ?.name ?? ""
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
                      {cashRegisters.map((r) => (
                        <SelectItem
                          key={r.id}
                          label={`${r.name} · ${r.code}`}
                          value={String(r.id)}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>
            )}

            {cashRegisters.length === 1 && (
              <HStack className="items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <Text className="text-xs text-gray-500">Caja</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {cashRegisters[0].name} · {cashRegisters[0].code}
                </Text>
              </HStack>
            )}

            {cashRegisters.length === 0 && (
              <Text className="text-sm font-medium text-red-600">
                No hay cajas registradas para esta sucursal.
              </Text>
            )}

            <VStack space="xs">
              <Text className="text-xs font-medium text-gray-500">
                Monto de apertura
              </Text>
              <Input
                variant="outline"
                size="md"
                className="border-gray-300 bg-white"
              >
                <InputField
                  value={openingAmount}
                  onChangeText={(v) => setOpeningAmount(sanitizeDecimal(v))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="text-sm text-gray-900"
                />
              </Input>
            </VStack>

            {/* Todos los usuarios del tenant (menos el que abre), para
                marcar a mano quién puede cerrar esta caja. */}
            <VStack space="xs">
              <Text className="text-xs font-medium text-gray-500">
                Usuarios que pueden cerrar esta caja
              </Text>

              {tenantUsers.isLoading && (
                <HStack space="xs" className="items-center py-2">
                  <Spinner size="small" />
                  <Text className="text-xs text-gray-400">
                    Cargando usuarios...
                  </Text>
                </HStack>
              )}

              {!tenantUsers.isLoading && otherUsers.length === 0 && (
                <Text className="text-xs text-gray-400">
                  No hay otros usuarios en el tenant.
                </Text>
              )}

              {otherUsers.length > 0 && (
                <ScrollView className="max-h-40">
                  <DesktopScrollView>
                    <VStack space="xs">
                      {otherUsers.map((u) => {
                        const active = !!coUsers[u.id];
                        return (
                          <TouchableOpacity
                            key={u.id}
                            onPress={() => toggleCoUser(u.id)}
                          >
                            <HStack className="items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                              <Text className="text-sm text-gray-900">
                                {u.first_name}
                              </Text>
                              <HStack space="xs" className="items-center">
                                <Text className="text-[10px] text-gray-400">
                                  puede cerrar
                                </Text>
                                <Box
                                  className={`h-5 w-5 items-center justify-center rounded border ${
                                    active
                                      ? "border-blue-600 bg-blue-600"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {active && (
                                    <Text className="text-xs text-white">
                                      ✓
                                    </Text>
                                  )}
                                </Box>
                              </HStack>
                            </HStack>
                          </TouchableOpacity>
                        );
                      })}
                    </VStack>
                  </DesktopScrollView>
                </ScrollView>
              )}
            </VStack>

            {openCashRegister.isError && (
              <Text className="text-sm font-medium text-red-600">
                {openCashRegister.error?.message ?? "No se pudo abrir la caja."}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            className={blocked ? "w-full bg-gray-300" : "w-full bg-blue-600"}
            isDisabled={blocked}
            onPress={handleSubmit}
          >
            <ButtonText className="text-white">
              {openCashRegister.isPending ? "Abriendo..." : "Abrir caja"}
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
