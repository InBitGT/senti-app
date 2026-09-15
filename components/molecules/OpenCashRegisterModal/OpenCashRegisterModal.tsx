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
import { router } from "expo-router";
import { RefreshCcw, Wallet, X } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

interface OpenCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const OpenCashRegisterModal: React.FC<OpenCashRegisterModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  isRefreshing = false,
}) => {
  function handleGoToOpen() {
    onClose();
    router.push("/(drawer)/(pos)/(process)/open-cash-register");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="items-center justify-between">
          <HStack space="xs" className="items-center">
            <Icon as={Wallet} size="sm" className="text-blue-600" />
            <Heading size="md" className="text-gray-900">
              Caja cerrada
            </Heading>
          </HStack>
          <TouchableOpacity onPress={onClose}>
            <Icon as={X} size="xl" className="text-gray-400" />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody>
          <VStack space="md">
            <Text className="text-sm text-gray-500">
              No tenés una caja abierta. Necesitás abrirla para empezar a
              vender.
            </Text>

            <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
              <HStack
                space="xs"
                className="items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                {isRefreshing ? (
                  <Spinner size="small" />
                ) : (
                  <Icon as={RefreshCcw} size="xs" className="text-gray-500" />
                )}
                <Text className="text-xs font-medium text-gray-600">
                  {isRefreshing
                    ? "Verificando..."
                    : "¿Alguien más abrió la caja? Recargar"}
                </Text>
              </HStack>
            </TouchableOpacity>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button className="w-full bg-blue-600" onPress={handleGoToOpen}>
            <ButtonText className="text-white">Abrir caja</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
