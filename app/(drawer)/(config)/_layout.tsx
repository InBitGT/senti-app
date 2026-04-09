import { Stack } from 'expo-router';

export default function ConfigLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="tenant"
      />
      <Stack.Screen
        name="users"
      />
    </Stack>
  );
}