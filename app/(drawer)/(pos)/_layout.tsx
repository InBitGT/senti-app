import { Stack } from "expo-router";

export default function PosFormLayout() {
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
        name="point_of_sales"
        options={{ title: "Unidades de medida" }}
      />
    </Stack>
  );
}
