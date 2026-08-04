export interface StockCount {
  tenant_id: number;
  warehouse_id: number;
  user_id: number;
  scope_notes: string;
  items: Item[];
}

export interface Item {
  product_id: number;
  counted_qty: number;
  counted_by: any;
}

export interface StockCountProduct {
  category_id: number;
  category_name: string;
  products: Product[];
}

interface Product {
  product_id: number;
  product_name: string;
  sku: string;
  system_qty: number;
}

// No viene en las interfaces compartidas: estado local de cada línea contada.
export interface CountLine {
  line_id: string;
  product_id: number;
  counted_qty: number;
  counted_by: any;
}

// Producto "aplanado" con su categoría, útil para el buscador/selector,
// ya que StockCountProduct agrupa los productos por categoría.
export type FlatProduct = Product & {
  category_id: number;
  category_name: string;
};

export function flattenStockCountProducts(
  groups: StockCountProduct[] | undefined,
): FlatProduct[] {
  if (!groups) return [];
  return groups.flatMap((group) =>
    group.products.map((p) => ({
      ...p,
      category_id: group.category_id,
      category_name: group.category_name,
    })),
  );
}

export interface DataResponse {
  id: number;
  tenant_id: number;
  warehouse_id: number;
  user_id: number;
  scope_notes: string;
  count_status: string;
  completed_at: string;
  differences: Difference[];
}

export interface Difference {
  stock_count_item_id: number;
  product_id: number;
  product_name: string;
  system_qty: number;
  counted_qty: number;
  difference: number;
  unit_cost: number;
}
