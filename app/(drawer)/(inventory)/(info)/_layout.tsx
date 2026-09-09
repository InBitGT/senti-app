import { Stack } from "expo-router";

export default function InventoryInfoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="entry_stock_info" />
    </Stack>
  );
}
