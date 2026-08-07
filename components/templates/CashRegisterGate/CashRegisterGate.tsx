import { OpenCashRegisterModal } from "@/components/molecules/OpenCashRegisterModal/OpenCashRegisterModal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCashRegisterSession } from "@/src/hooks/useCashRegisterSession/useCashRegisterSession";
import { useAuthStore } from "@/src/store";
import { Lock } from "lucide-react-native";
import React, { useEffect, useState } from "react";

// TODO: confirmar los ids/nombre real del rol en tus claims. Asumo
// claims.role_id === 1 (dueño/admin) o 2 (encargado de sucursal) como los
// únicos que pueden abrir caja por su cuenta.
const ROLES_THAT_CAN_OPEN_REGISTER = [1, 2];

export const CashRegisterGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const claims = useAuthStore((s) => s.claims);
  const { session } = useCashRegisterSession();
  // const setSession = useCashRegisterSessionStore((s) => s.setSession);

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

  // En cuanto la consulta trae una sesión abierta, la guardamos para que
  // Checkout.tsx la use como cash_register_session_id real.
  // useEffect(() => {
  //   console.log(session, "valores de session");
  //   if (session.data) {
  //     setSession(session.data);
  //   }
  // }, [session, session.data, setSession]);

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
      </VStack>

      <OpenCashRegisterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOpened={() => {
          // Vuelve a consultar para traer la sesión recién creada y
          // guardarla en el store (ver el useEffect de arriba).
          session.refetch();
        }}
      />
    </>
  );
};
