import { Stack } from 'expo-router';

export default function InventoryFormLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="warehouse_form"
      />
      <Stack.Screen
        name="supplier_form"
      />
      <Stack.Screen
        name="categorie_form"
        options={{headerShown:false}}
      />
      <Stack.Screen
        name="entry_stock_form"
      />
      <Stack.Screen
        name="inventory_adjustment_form"
      />
      <Stack.Screen
        name="inventory_movement_form"
      />
      <Stack.Screen
        name="product_form"
      />
    </Stack>
  );
}