import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/src/store";
import { useOpenCashModalStore } from "@/src/store/useOpenCashModalStore/useOpenCashModalStore";
import { CashRegisterSession } from "@/src/types/cash_register_session/cash_register_session";
import { UseQueryResult } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { Lock } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";

const ROLES_THAT_CAN_OPEN_REGISTER = [1, 2];

interface CashRegisterGateProps {
  children: React.ReactNode;
  session: UseQueryResult<CashRegisterSession | null, Error>;
  refetchProduct?: () => void;
}

export const CashRegisterGate: React.FC<CashRegisterGateProps> = ({
  children,
  session,
  refetchProduct,
}) => {
  const claims = useAuthStore((s) => s.claims);
  const [isFocused, setIsFocused] = useState(false);

  const openModal = useOpenCashModalStore((s) => s.open);
  const closeModal = useOpenCashModalStore((s) => s.close);
  const resetDismissed = useOpenCashModalStore((s) => s.resetDismissed);

  const canOpenRegister =
    !!claims && ROLES_THAT_CAN_OPEN_REGISTER.includes(claims.role_id);

  const hasSession = !!session.data;

  const refresh = useCallback(async () => {
    await session.refetch();
    refetchProduct?.();
  }, [session, refetchProduct]);

  // Marca si esta pantalla es la visible. Al perder el foco (o
  // desmontarse) cierra el modal para que no quede encima de otra.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        closeModal();
      };
    }, [closeModal]),
  );

  useEffect(() => {
    // Solo la pantalla visible controla el modal. Las que quedaron
    // atrás en el stack siguen montadas pero no hacen nada.
    if (!isFocused) return;

    if (hasSession) {
      // Si la caja se abrió, se resetea el dismissed para que si en el
      // futuro se vuelve a cerrar, el modal pueda auto-abrirse de nuevo.
      resetDismissed();
      closeModal();
      return;
    }

    if (!session.isLoading && canOpenRegister) {
      openModal(refresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, hasSession, session.isLoading, canOpenRegister]);

  if (session.isLoading) {
    return (
      <VStack className="flex-1 items-center justify-center bg-gray-50">
        <Spinner size="large" />
        <Text className="mt-2 text-gray-400">Verificando caja...</Text>
      </VStack>
    );
  }

  if (hasSession) {
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
        <Button onPress={refresh}>
          <Text className="text-center text-base font-medium text-white">
            Recargar información
          </Text>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 items-center justify-center gap-3 bg-gray-50 px-6">
      <Icon as={Lock} size="xl" className="text-gray-300" />
      <Text className="text-center text-base font-medium text-gray-700">
        Caja cerrada
      </Text>
      <Text className="text-center text-sm text-gray-500">
        Abrí la caja para empezar a vender.
      </Text>
      <Button onPress={() => openModal(refresh, true)}>
        <Text className="text-center text-base font-medium text-white">
          Abrir caja
        </Text>
      </Button>
      <Button onPress={refresh}>
        <Text className="text-center text-base font-medium text-white">
          Recargar información
        </Text>
      </Button>
    </VStack>
  );
};
