import { Stack } from "expo-router";

export default function FoodPrepLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="kitchen" />
    </Stack>
  );
}
