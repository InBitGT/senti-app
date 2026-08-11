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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashMovement } from "@/src/hooks/useCashMovement/useCashMovement";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useAuthStore } from "@/src/store";
import { CashMovementType } from "@/src/types/cash_register/cash_register";
import { ArrowDownCircle, ArrowUpCircle, X } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";

function sanitizeDecimal(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
}

export const CashMovementModal: React.FC<{
  isOpen: boolean;

  sessionId: number;
  onDone: () => void;
}> = ({ isOpen, sessionId, onDone }) => {
  const claims = useAuthStore((s) => s.claims);
  const { cashMovement } = useCashMovement();
  const { showToast } = useCustomToast();

  const [movementType, setMovementType] = useState<CashMovementType>("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const amountNum = Number.parseFloat(amount) || 0;
  const blocked = amountNum <= 0 || !claims || cashMovement.isPending;

  function reset() {
    setAmount("");
    setDescription("");
    setMovementType("income");
  }

  async function handleSubmit() {
    if (!claims) return;
    try {
      await cashMovement.mutateAsync({
        cash_register_session_id: sessionId,
        user_id: claims.sub,
        movement_type: movementType,
        amount: amountNum,
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      showToast({
        message: "Movimiento registrado correctamente .",
        type: "success",
      });

      reset();
      onDone();
    } catch {
      // El error queda disponible en cashMovement.error para mostrarlo abajo.
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
      }}
    >
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="items-center justify-between">
          <Heading size="md" className="text-gray-900">
            Movimiento de caja
          </Heading>
          <TouchableOpacity
            onPress={() => {
              reset();
            }}
          >
            <Icon as={X} size="sm" className="text-gray-400" />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody>
          <VStack space="md">
            <HStack space="xs">
              <Box className="flex-1">
                <TouchableOpacity onPress={() => setMovementType("income")}>
                  <HStack
                    space="xs"
                    className={`items-center justify-center rounded-lg border py-3 ${
                      movementType === "income"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <Icon
                      as={ArrowUpCircle}
                      size="sm"
                      className={
                        movementType === "income"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    />
                    <Text
                      className={`text-sm font-medium ${
                        movementType === "income"
                          ? "text-blue-700"
                          : "text-gray-600"
                      }`}
                    >
                      Ingreso
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </Box>
              <Box className="flex-1">
                <TouchableOpacity onPress={() => setMovementType("expense")}>
                  <HStack
                    space="xs"
                    className={`items-center justify-center rounded-lg border py-3 ${
                      movementType === "expense"
                        ? "border-red-600 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <Icon
                      as={ArrowDownCircle}
                      size="sm"
                      className={
                        movementType === "expense"
                          ? "text-red-600"
                          : "text-gray-400"
                      }
                    />
                    <Text
                      className={`text-sm font-medium ${
                        movementType === "expense"
                          ? "text-red-700"
                          : "text-gray-600"
                      }`}
                    >
                      Retiro
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </Box>
            </HStack>

            <VStack space="xs">
              <Text className="text-xs font-medium text-gray-500">Monto</Text>
              <Input
                variant="outline"
                size="md"
                className="border-gray-300 bg-white"
              >
                <InputField
                  value={amount}
                  onChangeText={(v) => setAmount(sanitizeDecimal(v))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="text-sm text-gray-900"
                />
              </Input>
            </VStack>

            <VStack space="xs">
              <Text className="text-xs font-medium text-gray-500">
                Descripción (opcional)
              </Text>
              <Input
                variant="outline"
                size="md"
                className="border-gray-300 bg-white"
              >
                <InputField
                  value={description}
                  onChangeText={setDescription}
                  placeholder={
                    movementType === "income"
                      ? "Ej. fondo de cambio adicional"
                      : "Ej. retiro de efectivo"
                  }
                  className="text-sm text-gray-900"
                />
              </Input>
            </VStack>

            {cashMovement.isError && (
              <Text className="text-sm font-medium text-red-600">
                {cashMovement.error?.message ??
                  "No se pudo registrar el movimiento."}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            className={
              blocked
                ? "w-full bg-gray-300"
                : movementType === "income"
                  ? "w-full bg-blue-600"
                  : "w-full bg-red-600"
            }
            isDisabled={blocked}
            onPress={handleSubmit}
          >
            <ButtonText className="text-white">
              {cashMovement.isPending
                ? "Guardando..."
                : movementType === "income"
                  ? "Registrar ingreso"
                  : "Registrar retiro"}
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
