import { Stack } from "expo-router";

export default function InventoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="warehouse" options={{ title: "Almacén" }} />
      <Stack.Screen name="supplier" options={{ title: "Proveedores" }} />
      <Stack.Screen name="categorie" options={{ title: "Categorias" }} />
      <Stack.Screen
        name="entry_stock"
        options={{ title: "Inventario Entrante" }}
      />
      <Stack.Screen
        name="inventory_adjustment"
        options={{ title: "Ajuste de inventario" }}
      />
      <Stack.Screen
        name="inventory_movement"
        options={{ title: "Inventario movimientos" }}
      />
      <Stack.Screen name="product" options={{ title: "Productos" }} />
      <Stack.Screen
        name="inventory_stock"
        options={{ title: "Stock de inventario" }}
      />
      <Stack.Screen name="scrap" options={{ title: "Mermas/Desperdicios" }} />
      <Stack.Screen
        name="stock_adjustment"
        options={{ title: "Ajustes de Stock por conteo" }}
      />
      <Stack.Screen
        name="stock_count"
        options={{ title: "Conteo de articulos en almacen " }}
      />
      <Stack.Screen
        name="unit_measure"
        options={{ title: "Unidades de medida" }}
      />
      <Stack.Screen name="merchandise" options={{ title: "Mercaderia" }} />
      <Stack.Screen
        name="warehouse_zone"
        options={{ title: "Zonas de almacenes" }}
      />
      <Stack.Screen
        name="wholesale"
        options={{ title: "Zonas de almacenes" }}
      />
      <Stack.Screen
        name="inventory"
        options={{ title: "Zonas de almacenes" }}
      />
    </Stack>
  );
}
