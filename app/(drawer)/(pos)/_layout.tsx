import { Stack } from "expo-router";

export default function PosLayout() {
  return (
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
        name="punto_venta"
        options={{ title: "Unidades de medida" }}
      />
    </Stack>
  );
}
