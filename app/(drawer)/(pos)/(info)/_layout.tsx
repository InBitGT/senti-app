import { Stack } from "expo-router";

export default function POSInfoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="invoices_info" />
    </Stack>
  );
}
