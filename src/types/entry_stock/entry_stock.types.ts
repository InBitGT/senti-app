export type EntryStatus = "confirmed" | "pending" | "cancelled";

export type WarehouseType = "main" | "secondary";

export interface StockEntryWarehouse {
  id: number;
  branch_id: number;
  code: string | null;
  name: string;
  type: WarehouseType;
  description: string | null;
  is_default: boolean;
}

export interface StockEntrySupplier {
  id: number;
  tenant_id: number;
  address_id: number | null;
  name: string;
  description: string | null;
  nit: string;
  phone: string;
  email: string;
  contact_name: string;
}

export interface StockEntry {
  id: number;
  tenant_id: number;
  warehouse_id: number;
  warehouse: StockEntryWarehouse;
  supplier_id: number;
  supplier: StockEntrySupplier;
  user_id: number;
  document_number: string;
  document_date: string;
  total: number;
  entry_status: EntryStatus;
  notes: string | null;
}

export interface InventoryItem {
  product_id: number;
  quantity: number;
  unit: string;
  unit_cost: number;
  subtotal: number;
  expiration_date: string | null;
  batch_number: string | null;
  notes: string;
  new_sale_price: number | null;
}

export interface InventoryDetail {
  tenant_id: number;
  warehouse_id: number;
  supplier_id: number;
  user_id: number;
  document_number: string;
  document_date: string;
  entry_status: string;
  notes: string;
  items: InventoryItem[];
}

export interface Adjustment {
  warehouse_id: number;
  product_id: number;
  batch_id: number | null;
  user_id: number;
  movement_type: string;
  reason: string;
  notes: string;
  qty: number;
  unit_cost: number | null;
  reference_number: string;
}

export interface EntryStockProduct {
  id: number;
  tenant_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  sku: string;
  barcode?: string | null;
  brand?: string | null;
  type: string;
  unit_of_measure_id: number;
  is_modifier: boolean;
  modifier_group?: string | null;
  modifier_name?: string | null;
}

export interface EntryStockWarehouse {
  id: number;
  branch_id: number;
  code?: string | null;
  name: string;
  type: string;
  description?: string | null;
  is_default: boolean;
  uses_zones: boolean;
}

export interface EntryStockSupplier {
  id: number;
  tenant_id: number;
  address_id?: number | null;
  name: string;
  description?: string | null;
  nit: string;
  phone: string;
  email: string;
  contact_name: string;
}

/** Lote tal como lo devuelve el detalle del ingreso. */
export interface EntryStockBatch {
  id: number;
  product_id: number;
  product?: EntryStockProduct | null;
  supplier_id?: number | null;
  supplier?: EntryStockSupplier | null;
  stock_entry_id?: number | null;
  stock_entry?: unknown;
  batch_number: string;
  unit_cost?: number;
  production_date?: string | null;
  expiration_date?: string | null;
  alert_date?: string | null;
  batch_status?: string;
  notes?: string | null;
}

export interface EntryStockDetailItem {
  id: number;
  product_id: number;
  product?: EntryStockProduct;
  batch_id?: number | null;
  batch?: EntryStockBatch | null;
  quantity: number;
  unit: string;
  unit_cost: number;
  subtotal: number;
  expiration_date?: string | null;
  notes?: string | null;
}

export interface EntryStockDetail {
  id: number;
  tenant_id: number;
  warehouse_id: number;
  warehouse?: EntryStockWarehouse;
  supplier_id: number;
  supplier?: EntryStockSupplier;
  user_id: number;
  document_number: string;
  document_date: string;
  total: number;
  entry_status: string;
  notes?: string | null;
  items?: EntryStockDetailItem[];
}
