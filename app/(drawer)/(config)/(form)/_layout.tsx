import { Stack } from 'expo-router';

export default function InventoryFormLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="users_form"
      />
      <Stack.Screen
        name="tenant_form"
      />
    </Stack>
  );
}