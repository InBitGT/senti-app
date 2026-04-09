import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="warehouse"
        options={{ title: 'Almacén' }}       
      />
      <Stack.Screen
        name="supplier"
        options={{ title: 'Proveedores' }}   
      />
      <Stack.Screen
        name="categorie"
        options={{ title: 'Categorias' }}   
      />
      <Stack.Screen
        name="entry_stock"
        options={{ title: 'Inventario Entrante' }}   
      />
      <Stack.Screen
        name="inventory_adjustment"
        options={{ title: 'Ajuste de inventario' }}   
      />
      <Stack.Screen
        name="inventory_movement"
        options={{ title: 'Inventario movimientos' }}   
      />
      <Stack.Screen
        name="product"
        options={{ title: 'Productos' }}   
      />
      <Stack.Screen
        name="inventory_stock"
        options={{ title: 'Stock de inventario' }}   
      />
    </Stack>
  );
}