import { Stack } from 'expo-router';

export default function InventoryFormLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="warehouse_form"
        options={{ title: 'Almacén' }}       
      />
      <Stack.Screen
        name="supplier_form"
        options={{ title: 'Proveedores' }}   
      />
      <Stack.Screen
        name="categorie_form"
        options={{ title: 'Categorias' }}   
      />
      <Stack.Screen
        name="entry_stock_form"
        options={{ title: 'Inventario Entrante' }}   
      />
      <Stack.Screen
        name="inventory_adjustment_form"
        options={{ title: 'Ajuste de inventario' }}   
      />
      <Stack.Screen
        name="inventory_movement_form"
        options={{ title: 'Inventario movimientos' }}   
      />
      <Stack.Screen
        name="product_form"
        options={{ title: 'Productos' }}   
      />
    </Stack>
  );
}