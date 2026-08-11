export interface InventoryStockItem {
  product_id: number;
  product_name: string;
  sku: string;
  average_cost: number;
  batch_lines: number;
  total_qty_on_hand: number;
  total_qty_reserved: number;
  available_qty: number;
  unit_of_measure: string;
  warehouse_id: number;
  warehouse_name: string;
}

export const TYPE_LABELS: Record<string, string> = {
  storable: "Almacenable",
  ingredient: "Ingrediente",
  finished_product: "Producto terminado",
  menu_item: "Ítem de menú",
};

export const AVAILABILITY_LABELS: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  available: { bg: "#dcfce7", color: "#16a34a", label: "Disponible" },
  unavailable: { bg: "#fee2e2", color: "#dc2626", label: "No disponible" },
  low_stock: { bg: "#fef9c3", color: "#ca8a04", label: "Stock bajo" },
};
