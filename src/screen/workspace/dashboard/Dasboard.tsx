import { Icon } from "@/components/ui/icon";
import { useDashboard } from "@/src/hooks/useDashboard/useDashboard";
import {
  ArrowRight,
  ClipboardList,
  Store,
  TriangleAlert,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------- Tipos ----------
interface DataHeader {
  title: string;
  subtitle: string;
}

// ---------- Colores centralizados ----------
const colors = {
  primary: "#8B5CF6",
  info: "#0EA5E9",
  danger: "#991B1B",
  dangerBg: "#FCA5A566",
  white: "#fff",
  whiteTransparent: "#FFFFFF33",
  circleBg: "#D4D4D433",
};

// Breakpoint simple: a partir de este ancho consideramos "desktop"
const DESKTOP_BREAKPOINT = 768;
const MAX_CONTENT_WIDTH = 900;

// ---------- Helpers ----------
function getSaludo(): DataHeader {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) {
    return {
      title: "Buenos días",
      subtitle: "Todo listo para un gran día de ventas.",
    };
  } else if (hora >= 12 && hora < 19) {
    return {
      title: "Buenas tardes",
      subtitle: "El negocio no se mueve solo… ¡vamos!",
    };
  } else {
    return {
      title: "Buenas noches",
      subtitle: "Cerremos el día con todo bajo control.",
    };
  }
}

// ---------- Banner: Nueva venta ----------
function NewSaleBanner({
  onPress,
  isDesktop,
}: {
  onPress?: () => void;
  isDesktop: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.primary,
        height: isDesktop ? 220 : 200,
        margin: 20,
        borderRadius: 40,
        padding: 24,
        justifyContent: "space-between",
      }}
    >
      <Icon as={Store} size="xl" style={{ color: colors.white }} />

      <View style={{ alignItems: "flex-start" }}>
        <Text
          style={{
            fontSize: isDesktop ? 24 : 20,
            fontWeight: "700",
            color: colors.white,
            marginTop: 10,
          }}
        >
          Nueva venta
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "300", color: colors.white }}>
          Empieza una nueva transacción
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.circleBg,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon as={ArrowRight} size="md" style={{ color: colors.white }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Banner: Contar inventario ----------
function CountInventoryBanner({
  onPress,
  style,
}: {
  onPress?: () => void;
  style?: object;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.info,
          borderRadius: 40,
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
        },
        style,
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.whiteTransparent,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon as={ClipboardList} size="md" style={{ color: colors.white }} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.white,
          marginLeft: 16,
        }}
      >
        Contar inventario
      </Text>
    </TouchableOpacity>
  );
}

// ---------- Banner: Alerta de inventario ----------
interface InventoryAlertBannerProps {
  isLoading: boolean;
  isError: boolean;
  total: number;
  onPress?: () => void;
  style?: object;
}

function InventoryAlertBanner({
  isLoading,
  isError,
  total,
  onPress,
  style,
}: InventoryAlertBannerProps) {
  const hasAlerts = total > 0;

  // Si ya terminó de cargar, no hubo error, y no hay alertas: no mostramos nada
  if (!isLoading && !isError && !hasAlerts) {
    return null;
  }

  const message = isLoading
    ? "Revisando inventario..."
    : isError
      ? "No se pudo cargar el inventario"
      : `${total} producto${total === 1 ? "" : "s"} por acabarse`;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.dangerBg,
          borderRadius: 40,
          padding: 24,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon as={TriangleAlert} size="md" style={{ color: colors.danger }} />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.danger,
            marginLeft: 12,
          }}
        >
          Alerta de inventario
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "400",
          color: colors.danger,
          marginTop: 8,
        }}
      >
        {message}
      </Text>
    </TouchableOpacity>
  );
}

// ---------- Pantalla principal ----------
export const DasboardScreen = () => {
  const [saludo, setSaludo] = useState(getSaludo());
  const { alertInventory } = useDashboard();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  // Actualiza el saludo si el usuario deja la app abierta
  useEffect(() => {
    const interval = setInterval(() => setSaludo(getSaludo()), 60000);
    return () => clearInterval(interval);
  }, []);

  const totalAlertas = useMemo(
    () => alertInventory.data?.length ?? 0,
    [alertInventory.data],
  );

  const mostrarSeccionAlertas =
    alertInventory.isPending || alertInventory.isError || totalAlertas > 0;

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          maxWidth: isDesktop ? MAX_CONTENT_WIDTH : undefined,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            fontSize: isDesktop ? 34 : 28,
            fontWeight: "bold",
            marginHorizontal: 20,
            marginTop: 20,
          }}
        >
          {saludo.title}
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            marginHorizontal: 20,
            marginTop: 10,
          }}
        >
          {saludo.subtitle}
        </Text>

        <NewSaleBanner isDesktop={isDesktop} />

        {/* En desktop, "Contar inventario" y "Alerta" van lado a lado */}
        {isDesktop ? (
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 20,
              marginTop: 0,
              gap: 20,
            }}
          >
            <CountInventoryBanner style={{ flex: 1 }} />
            {mostrarSeccionAlertas && (
              <InventoryAlertBanner
                isLoading={alertInventory.isPending}
                isError={alertInventory.isError}
                total={totalAlertas}
                style={{ flex: 1 }}
              />
            )}
          </View>
        ) : (
          <>
            <CountInventoryBanner
              style={{ marginHorizontal: 20, marginTop: 0 }}
            />

            {mostrarSeccionAlertas && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "200",
                    color: "#000",
                    marginLeft: 20,
                    marginTop: 20,
                  }}
                >
                  Alertas
                </Text>

                <InventoryAlertBanner
                  isLoading={alertInventory.isPending}
                  isError={alertInventory.isError}
                  total={totalAlertas}
                  style={{ marginHorizontal: 20, marginTop: 10 }}
                />
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};
