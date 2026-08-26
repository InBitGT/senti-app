import { OpenCashRegisterModal } from "@/components/molecules/OpenCashRegisterModal/OpenCashRegisterModal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/src/store";
import { CashRegisterSession } from "@/src/types/cash_register_session/cash_register_session";
import { Lock } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";

const ROLES_THAT_CAN_OPEN_REGISTER = [1, 2];

interface CashRegisterGateProps {
  children: React.ReactNode;
  session: {
    data: CashRegisterSession | null | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
}

export const CashRegisterGate: React.FC<CashRegisterGateProps> = ({
  children,
  session,
}) => {
  const claims = useAuthStore((s) => s.claims);

  const [modalOpen, setModalOpen] = useState(false);

  const canOpenRegister =
    !!claims && ROLES_THAT_CAN_OPEN_REGISTER.includes(claims.role_id);

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (
      !session.isLoading &&
      !session.data &&
      canOpenRegister &&
      !hasAutoOpened.current
    ) {
      hasAutoOpened.current = true;
      setModalOpen(true);
    }
    if (session.data) {
      hasAutoOpened.current = false;
    }
  }, [session.isLoading, session.data, canOpenRegister]);

  if (session.isLoading) {
    return (
      <VStack className="flex-1 items-center justify-center bg-gray-50">
        <Spinner size="large" />
        <Text className="mt-2 text-gray-400">Verificando caja...</Text>
      </VStack>
    );
  }

  if (session.data) {
    return <>{children}</>;
  }

  if (!canOpenRegister) {
    return (
      <VStack className="flex-1 items-center justify-center gap-3 bg-gray-50 px-6">
        <Icon as={Lock} size="xl" className="text-gray-300" />
        <Text className="text-center text-base font-medium text-gray-700">
          Caja cerrada
        </Text>
        <Text className="text-center text-sm text-gray-500">
          No tenés una caja abierta y no tenés permiso para abrir una. Pedile a
          un encargado que la abra para poder vender.
        </Text>
        <Button onPress={() => session.refetch}>
          <Text className="text-center text-base font-medium text-white">
            Recargar información
          </Text>
        </Button>
      </VStack>
    );
  }

  return (
    <>
      <VStack className="flex-1 items-center justify-center gap-3 bg-gray-50 px-6">
        <Icon as={Lock} size="xl" className="text-gray-300" />
        <Text className="text-center text-base font-medium text-gray-700">
          Caja cerrada
        </Text>
        <Text className="text-center text-sm text-gray-500">
          Abrí la caja para empezar a vender.
        </Text>
        <Button onPress={() => setModalOpen(true)}>
          <Text className="text-center text-base font-medium text-white">
            Abrir caja
          </Text>
        </Button>
        <Button onPress={() => session.refetch}>
          <Text className="text-center text-base font-medium text-white">
            Recargar información
          </Text>
        </Button>
      </VStack>

      <OpenCashRegisterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOpened={() => {
          session.refetch();
        }}
      />
    </>
  );
};
