import { OpenCashRegisterModal } from "@/components/molecules/OpenCashRegisterModal/OpenCashRegisterModal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/src/store";
import { CashRegisterSession } from "@/src/types/cash_register_session/cash_register_session";
import { Lock } from "lucide-react-native";
import React, { useEffect, useState } from "react";

// TODO: confirmar los ids/nombre real del rol en tus claims. Asumo
// claims.role_id === 1 (dueño/admin) o 2 (encargado de sucursal) como los
// únicos que pueden abrir caja por su cuenta.
const ROLES_THAT_CAN_OPEN_REGISTER = [1, 2];

// La sesión ya la consulta Pos.tsx (una sola vez, con useCashRegisterSession)
// y se la pasa acá como prop — el Gate NO vuelve a llamar el hook, así que
// no hay pedido duplicado ni doble suscripción.
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

  // Diagnóstico: si esto imprime `role_id: undefined` (o no existe ese
  // campo), es que el rol viene con otro nombre/forma en tus claims reales.
  // Revisa el objeto completo abajo y pasame la ruta correcta.
  if (__DEV__ && claims && !canOpenRegister) {
    console.warn(
      "[CashRegisterGate] claims.role_id no matcheó ROLES_THAT_CAN_OPEN_REGISTER. claims completo:",
      claims,
    );
  }

  useEffect(() => {
    if (!session.isLoading && !session.data && canOpenRegister) {
      setModalOpen(true);
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

  // Hay sesión abierta: se puede vender con normalidad.
  if (session.data) {
    return <>{children}</>;
  }

  // No hay sesión abierta y el usuario NO puede abrir caja por su cuenta:
  // pantalla bloqueada, sin modal.
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
          <Text className="text-center text-base font-medium text-gray-700">
            Recargar información
          </Text>
        </Button>
      </VStack>
    );
  }

  // No hay sesión abierta pero el usuario SÍ puede abrir caja: se muestra
  // la pantalla bloqueada de fondo y el modal de apertura encima.
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
          <Text className="text-center text-base font-medium text-gray-700">
            Abrir caja
          </Text>
        </Button>
        <Button onPress={() => session.refetch}>
          <Text className="text-center text-base font-medium text-gray-700">
            Recargar información
          </Text>
        </Button>
      </VStack>

      <OpenCashRegisterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOpened={() => {
          // Vuelve a consultar para traer la sesión recién creada.
          session.refetch();
        }}
      />
    </>
  );
};
