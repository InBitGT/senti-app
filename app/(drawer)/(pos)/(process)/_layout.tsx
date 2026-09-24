import { Stack } from "expo-router";

export default function ProcessLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="payment" />
      <Stack.Screen name="receipt" />
      <Stack.Screen name="chekout" />
      <Stack.Screen name="cash_count_close" />
      <Stack.Screen name="open-cash-register" />
    </Stack>
  );
}
