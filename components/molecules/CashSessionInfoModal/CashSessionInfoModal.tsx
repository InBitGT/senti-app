import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
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
    ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCloseCashRegister } from "@/src/hooks/useCloseCashRegister/useCloseCashRegister";
import { useAuthStore } from "@/src/store";
import { CashRegisterSession } from "@/src/types/cash_register_session/cash_register_session";
import { CreditCard, User, Wallet, X } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

export const CashSessionInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  session: CashRegisterSession;
  onClosed: () => void;
}> = ({ isOpen, onClose, session, onClosed }) => {
  const claims = useAuthStore((s) => s.claims);
  const { closeCashRegister } = useCloseCashRegister();

  const [closing, setClosing] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");

  const amount = Number.parseFloat(closingAmount) || 0;
  const blocked = amount <= 0 || !claims || closeCashRegister.isPending;

  async function handleClose() {
    if (!claims) return;
    try {
      await closeCashRegister.mutateAsync({
        sessionId: session.id,
        payload: {
          user_id: claims.sub,
          closing_amount: amount,
        },
      });
      setClosingAmount("");
      setClosing(false);
      onClosed();
      onClose();
    } catch {
      // El error queda disponible en closeCashRegister.error para mostrarlo abajo.
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="items-center justify-between">
          <HStack space="xs" className="items-center">
            <Icon as={Wallet} size="sm" className="text-blue-600" />
            <Heading size="md" className="text-gray-900">
              {session.cash_register.name}
            </Heading>
          </HStack>
          <TouchableOpacity onPress={onClose}>
            <Icon as={X} size="sm" className="text-gray-400" />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody>
          <VStack space="md">
            <VStack
              space="xs"
              className="rounded-lg border border-gray-100 p-3"
            >
              <HStack className="items-center justify-between">
                <Text className="text-xs text-gray-500">Código</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {session.cash_register.code}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-xs text-gray-500">Abierta desde</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatDate(session.opening_datetime)}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-xs text-gray-500">Monto de apertura</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(session.opening_amount)}
                </Text>
              </HStack>
            </VStack>

            {session.users.length > 0 && (
              <VStack space="xs">
                <Text className="text-xs font-medium text-gray-500">
                  Usuarios con acceso
                </Text>
                {session.users.map((u) => (
                  <HStack
                    key={u.id}
                    className="items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                  >
                    <HStack space="xs" className="items-center">
                      <Icon as={User} size="xs" className="text-gray-400" />
                      <Text className="text-sm text-gray-900">
                        Usuario #{u.user_id}
                      </Text>
                    </HStack>
                    {u.can_close && (
                      <HStack space="xs" className="items-center">
                        <Icon
                          as={CreditCard}
                          size="xs"
                          className="text-blue-600"
                        />
                        <Text className="text-[10px] font-medium text-blue-600">
                          puede cerrar
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                ))}
              </VStack>
            )}

            {/* Cierre de caja */}
            <VStack space="sm" className="border-t border-gray-100 pt-3">
              {!closing ? (
                <Button
                  variant="outline"
                  className="border-red-300"
                  onPress={() => setClosing(true)}
                >
                  <ButtonText className="text-red-600">Cerrar caja</ButtonText>
                </Button>
              ) : (
                <VStack space="xs">
                  <Text className="text-xs font-medium text-gray-500">
                    Monto de cierre (efectivo contado)
                  </Text>
                  <Input
                    variant="outline"
                    size="md"
                    className="border-gray-300 bg-white"
                  >
                    <InputField
                      value={closingAmount}
                      onChangeText={(v) => setClosingAmount(sanitizeDecimal(v))}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className="text-sm text-gray-900"
                    />
                  </Input>

                  {closeCashRegister.isError && (
                    <Text className="text-sm font-medium text-red-600">
                      {closeCashRegister.error?.message ??
                        "No se pudo cerrar la caja."}
                    </Text>
                  )}

                  <HStack space="xs">
                    <Box className="flex-1">
                      <Button
                        variant="outline"
                        onPress={() => {
                          setClosing(false);
                          setClosingAmount("");
                        }}
                      >
                        <ButtonText className="text-gray-700">
                          Cancelar
                        </ButtonText>
                      </Button>
                    </Box>
                    <Box className="flex-1">
                      <Button
                        className={blocked ? "bg-gray-300" : "bg-red-600"}
                        isDisabled={blocked}
                        onPress={handleClose}
                      >
                        <ButtonText className="text-white">
                          {closeCashRegister.isPending
                            ? "Cerrando..."
                            : "Confirmar cierre"}
                        </ButtonText>
                      </Button>
                    </Box>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
