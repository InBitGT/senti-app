import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
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
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashRegister } from "@/src/hooks/useCashRegister/useCashRegister";
import { useCashRegisterUsers } from "@/src/hooks/useCashRegisterUsers/useCashRegisterUsers";
import { useOpenCashRegister } from "@/src/hooks/useOpenCashRegister/useOpenCashRegister";
import { useAuthStore } from "@/src/store";
import { sanitizeDecimal } from "@/src/utils/sanitizeDecimal/sanitizeDecimal";
import { router } from "expo-router";
import {
  AlertTriangle,
  ChevronLeft,
  KeyRound,
  UserCheck,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

type UserFlags = {
  selected: boolean;
  canClose: boolean;
};

export default function OpenCashRegisterScreen() {
  const claims = useAuthStore((s) => s.claims);
  const { openCashRegister } = useOpenCashRegister();
  const { tenantUsers } = useCashRegisterUsers();
  const { data: cashRegistersData } = useCashRegister();
  const cashRegisters = cashRegistersData ?? [];

  const [cashRegisterId, setCashRegisterId] = useState<number | null>(null);
  const [openingAmount, setOpeningAmount] = useState("");
  const [userFlags, setUserFlags] = useState<Record<number, UserFlags>>({});
  const [authorizeOpen, setAuthorizeOpen] = useState(false);

  const otherUsers = (tenantUsers.data ?? []).filter(
    (u) => u.id !== claims?.sub,
  );

  useEffect(() => {
    if (cashRegisters.length === 1 && cashRegisterId == null) {
      setCashRegisterId(cashRegisters[0].id);
    }
  }, [cashRegisters, cashRegisterId]);

  function toggleSelected(userId: number) {
    setUserFlags((prev) => {
      const current = prev[userId] ?? { selected: false, canClose: false };
      const nextSelected = !current.selected;
      return {
        ...prev,
        [userId]: {
          selected: nextSelected,
          canClose: nextSelected ? current.canClose : false,
        },
      };
    });
  }

  function toggleCanClose(userId: number) {
    setUserFlags((prev) => {
      const current = prev[userId];
      if (!current?.selected) return prev; // no debería pasar por la UI, pero por seguridad
      return {
        ...prev,
        [userId]: { ...current, canClose: !current.canClose },
      };
    });
  }

  const selectedUsers = useMemo(
    () => otherUsers.filter((u) => userFlags[u.id]?.selected),
    [otherUsers, userFlags],
  );

  const usersWithCloseAccess = useMemo(
    () => selectedUsers.filter((u) => userFlags[u.id]?.canClose),
    [selectedUsers, userFlags],
  );

  const amount = Number.parseFloat(openingAmount) || 0;
  const blocked =
    amount <= 0 ||
    cashRegisterId == null ||
    !claims ||
    openCashRegister.isPending;

  function handlePressOpen() {
    if (blocked) return;
    if (usersWithCloseAccess.length > 0) {
      // Otorgar permiso de cierre es sensible (esas personas podrán
      // contar y cerrar la caja), así que se pide una confirmación
      // explícita adicional antes de mandar la apertura.
      setAuthorizeOpen(true);
      return;
    }
    handleSubmit();
  }

  async function handleSubmit() {
    if (!claims || cashRegisterId == null) return;

    try {
      await openCashRegister.mutateAsync({
        cash_register_id: cashRegisterId,
        user_id: claims.sub,
        opening_amount: amount,
        // Solo se mandan los usuarios explícitamente asociados
        // (checkbox "Asociar"), nunca todo el listado de tenantUsers.
        users: selectedUsers.map((u) => ({
          user_id: u.id,
          can_close: !!userFlags[u.id]?.canClose,
        })),
      });
      setOpeningAmount("");
      setUserFlags({});
      setAuthorizeOpen(false);
      router.back();
    } catch {
      // El error queda disponible en openCashRegister.error para mostrarlo abajo.
      setAuthorizeOpen(false);
    }
  }

  const cashRegisterOptions = useMemo(
    () =>
      cashRegisters.map((r) => ({
        label: `${r.name} · ${r.code}`,
        value: String(r.id),
      })),
    [cashRegisters],
  );

  return (
    <VStack className="flex-1 bg-white">
      <HStack className="items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="pr-2">
          <Icon as={ChevronLeft} size="sm" className="text-gray-600" />
        </TouchableOpacity>
        <Heading size="md" className="text-gray-900">
          Abrir caja
        </Heading>
      </HStack>

      <ScrollView contentContainerClassName="p-4" className="flex-1">
        <VStack space="md">
          <Text className="text-sm text-gray-500">
            Elegí con qué caja vas a trabajar e ingresá el monto inicial para
            empezar a vender.
          </Text>

          {cashRegisters.length > 1 && (
            <AppSelect
              label="Caja"
              placeholder="Selecciona una caja"
              searchable={cashRegisterOptions.length > 6}
              options={cashRegisterOptions}
              value={cashRegisterId != null ? String(cashRegisterId) : ""}
              onChange={(v) => setCashRegisterId(v ? Number(v) : null)}
            />
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

          <AppInput
            label="Monto de apertura"
            placeholder="0.00"
            value={openingAmount}
            onChangeText={(v) => setOpeningAmount(sanitizeDecimal(v))}
            keyboardType="decimal-pad"
          />

          <VStack space="xs" className="border-t border-gray-100 pt-3">
            <Text className="text-xs font-medium text-gray-500">
              Usuarios adicionales en esta sesión
            </Text>
            <Text className="text-[11px] text-gray-400">
              Solo las personas que marques como &quot;Asociar&quot; quedarán
              vinculadas a esta caja. El permiso de cierre es aparte.
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
              <DesktopScrollView>
                <VStack space="xs">
                  {otherUsers.map((u) => {
                    const flags = userFlags[u.id] ?? {
                      selected: false,
                      canClose: false,
                    };
                    return (
                      <VStack
                        key={u.id}
                        className={`rounded-md border px-3 py-2 ${
                          flags.selected
                            ? "border-blue-200 bg-blue-50/40"
                            : "border-gray-200"
                        }`}
                        space="xs"
                      >
                        <TouchableOpacity onPress={() => toggleSelected(u.id)}>
                          <HStack className="items-center justify-between">
                            <Text className="text-sm text-gray-900">
                              {u.first_name}
                            </Text>
                            <HStack space="xs" className="items-center">
                              <Text className="text-[10px] text-gray-400">
                                Asociar
                              </Text>
                              <Box
                                className={`h-5 w-5 items-center justify-center rounded border ${
                                  flags.selected
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {flags.selected && (
                                  <Text className="text-xs text-white">✓</Text>
                                )}
                              </Box>
                            </HStack>
                          </HStack>
                        </TouchableOpacity>

                        {flags.selected && (
                          <TouchableOpacity
                            onPress={() => toggleCanClose(u.id)}
                          >
                            <HStack className="items-center justify-between rounded-md bg-white/60 px-2 py-1.5">
                              <HStack space="xs" className="items-center">
                                <Icon
                                  as={KeyRound}
                                  size="xs"
                                  className="text-amber-600"
                                />
                                <Text className="text-xs text-gray-700">
                                  Puede cerrar caja
                                </Text>
                              </HStack>
                              <Box
                                className={`h-5 w-5 items-center justify-center rounded border ${
                                  flags.canClose
                                    ? "border-amber-600 bg-amber-600"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {flags.canClose && (
                                  <Text className="text-xs text-white">✓</Text>
                                )}
                              </Box>
                            </HStack>
                          </TouchableOpacity>
                        )}
                      </VStack>
                    );
                  })}
                </VStack>
              </DesktopScrollView>
            )}
          </VStack>

          {openCashRegister.isError && !authorizeOpen && (
            <Text className="text-sm font-medium text-red-600">
              {openCashRegister.error?.message ?? "No se pudo abrir la caja."}
            </Text>
          )}
        </VStack>
      </ScrollView>

      <VStack space="sm" className="border-t border-gray-100 p-4">
        <Button
          className={blocked ? "bg-gray-300" : "bg-blue-600"}
          isDisabled={blocked}
          onPress={handlePressOpen}
        >
          <ButtonText className="text-white">Abrir caja</ButtonText>
        </Button>
      </VStack>

      <Modal isOpen={authorizeOpen} onClose={() => setAuthorizeOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="bg-white">
          <ModalHeader className="items-center justify-between">
            <HStack space="xs" className="items-center">
              <Icon as={AlertTriangle} size="sm" className="text-amber-600" />
              <Heading size="md" className="text-gray-900">
                Autorizar permiso de cierre
              </Heading>
            </HStack>
          </ModalHeader>

          <ModalBody>
            <VStack space="md">
              <Text className="text-sm text-gray-700">
                Estás por darle permiso para{" "}
                <Text className="font-semibold text-gray-900">
                  cerrar esta caja
                </Text>{" "}
                (contar el efectivo y finalizar la sesión) a:
              </Text>

              <VStack
                space="xs"
                className="rounded-lg border border-gray-100 p-3"
              >
                {usersWithCloseAccess.map((u) => (
                  <HStack key={u.id} space="xs" className="items-center">
                    <Icon as={UserCheck} size="xs" className="text-amber-600" />
                    <Text className="text-sm text-gray-900">
                      {u.first_name}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Text className="text-xs text-gray-500">
                Confirmá que reconocés y autorizás este acceso antes de abrir la
                caja.
              </Text>

              {openCashRegister.isError && (
                <Text className="text-sm font-medium text-red-600">
                  {openCashRegister.error?.message ??
                    "No se pudo abrir la caja."}
                </Text>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter className="gap-2">
            <Box className="flex-1">
              <Button
                variant="outline"
                onPress={() => setAuthorizeOpen(false)}
                isDisabled={openCashRegister.isPending}
              >
                <ButtonText className="text-gray-700">Revisar</ButtonText>
              </Button>
            </Box>
            <Box className="flex-1">
              <Button
                className="bg-amber-600"
                onPress={handleSubmit}
                isDisabled={openCashRegister.isPending}
              >
                <ButtonText className="text-white">
                  {openCashRegister.isPending
                    ? "Abriendo..."
                    : "Autorizar y abrir"}
                </ButtonText>
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
