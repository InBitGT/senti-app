import { AppButton } from "@/components/atom/AppButton/AppButton";
import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
import { router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { View } from "react-native";

// Ruta comodín: atrapa cualquier ruta del menú que todavía no exista
// y muestra un aviso de mantenimiento en lugar del "Unmatched route".
export default function UnmatchedRoute() {
  return (
    <View
      style={{ flex: 1, justifyContent: "center", backgroundColor: "#fff" }}
    >
      <EmptyHint
        icon={Wrench}
        iconSize={56}
        iconColor="#9ca3af"
        label="Pantalla en mantenimiento"
        description="Esta sección aún no está disponible. Intenta más tarde."
      >
        <AppButton
          label="Ir al inicio"
          fullWidth={false}
          onPress={() => router.replace("/dashboard")}
        />
      </EmptyHint>
    </View>
  );
}
