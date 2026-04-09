import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const routeTitles: Record<string, Record<string, string>> = {
  '(inventory)': {
    warehouse: 'Almacén',
    supplier: 'Proveedores',
    categorie: 'Categorias',
    entry_stock: 'Inventario Entrante',
    inventory_adjustment: 'Ajuste de inventario',
    inventory_movement: 'Inventario movimientos',
    product: 'Productos',
    inventory_stock: "Stock de inventario"
  },
  '(config)': {
    tenant: 'Empresa',
    users: 'Usuarios',
  },
};

export const getGroupTitle = (groupName: string, route: any, fallback = 'Inicio') => {
  const routeName = getFocusedRouteNameFromRoute(route);
  return routeTitles[groupName]?.[routeName ?? ''] ?? fallback;
};