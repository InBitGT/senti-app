import { Stack } from "expo-router";

export default function PortfolioLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="client" options={{ title: "Clientes" }} />
      <Stack.Screen
        name="client_type"
        options={{ title: "Tipos de Clientes " }}
      />
      <Stack.Screen name="credit" options={{ title: "Creditos" }} />
      <Stack.Screen name="loan_payments" options={{ title: "Creditos" }} />
      <Stack.Screen name="loan_transactions" options={{ title: "Creditos" }} />
    </Stack>
  );
}
