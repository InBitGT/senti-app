import { Stack } from "expo-router";

export default function PortfolioFormLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="client_form" options={{ title: "Clientes" }} />
      <Stack.Screen
        name="client_type_form"
        options={{ title: "Tipos de Clientes " }}
      />
      <Stack.Screen name="credit_form" options={{ title: "Creditos" }} />
    </Stack>
  );
}
