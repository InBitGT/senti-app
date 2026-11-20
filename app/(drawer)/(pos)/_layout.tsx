import { PrinterStatusBanner } from "@/components/molecules/PrinterStatusBanner/PrinterStatusBanner";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function PosFormLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Aviso si la impresora térmica no responde (solo Android). */}
      <PrinterStatusBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="invoices"
          options={{ title: "Ajustes de Stock por conteo" }}
        />
        <Stack.Screen
          name="payment_methods"
          options={{ title: "Conteo de articulos en almacen " }}
        />
        <Stack.Screen
          name="point_of_sales"
          options={{ title: "Unidades de medida" }}
        />
        <Stack.Screen name="recipe_pos" options={{ title: "POS de recetas" }} />
      </Stack>
    </View>
  );
}
