import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const routeTitles: Record<string, Record<string, string>> = {
  "(inventory)": {
    warehouse: "Almacén",
    supplier: "Proveedores",
    categorie: "Categorias",
    entry_stock: "Ingreso de inventario",
    inventory_adjustment: "Ajuste de inventario",
    inventory_movement: "Movimientos de inventario",
    product: "Productos",
    inventory_stock: "Stock de inventario",
    scrap: "Mermas/Desperdicios",
    stock_adjustment: "Ajustes de Stock por conteo",
    stock_count: "Conteo de artículos en almacén",
    unit_measure: "Unidades de medida",
    merchandise: "Mercadería",
    warehouse_zone: "Zonas de almacenes",
    wholesale: "Mayoreo",
    inventory: "Inventario",
    cachier: "Cajero",
  },
  "(portfolio)": {
    client: "Clientes",
    client_type: "Tipos de Clientes",
    credit: "Créditos",
    loan_payments: "Pagos de créditos",
    loan_transactions: "Transacciones de créditos",
  },
  "(pos_form)": {
    invoices: "Facturas",
    payment_methods: "Métodos de pago",
    point_of_sales: "Puntos de venta",
  },
  "(config)": {
    tenant: "Empresa",
    users: "Usuarios",
  },
  "(menu)": {
    recipe: "Productos del Menú",
  },
  "(pos)": {
    recipe: "Productos del Menú",
  },
};

export const getGroupTitle = (
  groupName: string,
  route: any,
  fallback = "Inicio",
) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  return routeTitles[groupName]?.[routeName ?? ""] ?? fallback;
};
