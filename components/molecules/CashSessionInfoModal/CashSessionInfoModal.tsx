import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { CashRegisterSession } from "@/src/types/cash_register_session/cash_register_session";
import { formatDateTime } from "@/src/utils/formatDateTime/formatDateTime";
import { router } from "expo-router";
import { CreditCard, User, Wallet, X } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

export const CashSessionInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  session: CashRegisterSession;
  onClosed: () => void;
}> = ({ isOpen, onClose, session }) => {
  function handleGoToCount() {
    onClose();
    router.push("/(drawer)/(pos)/(process)/cash_count_close");
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
                  {formatDateTime(session.opening_datetime)}
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

            <VStack space="sm" className="border-t border-gray-100 pt-3">
              <Button
                variant="outline"
                className="border-red-300"
                onPress={handleGoToCount}
              >
                <ButtonText className="text-red-600">Cerrar caja</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
