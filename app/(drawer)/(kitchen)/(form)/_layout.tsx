import { Stack } from "expo-router";

export default function formKitchenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="recipes_form" />
      <Stack.Screen name="ingredient_form" />
    </Stack>
  );
}
