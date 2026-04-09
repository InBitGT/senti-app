export interface InventoryMovement {
  id: number;
  warehouse_id: number;
  warehouse: Warehouse;
  product_id: number;
  product: Product;
  batch_id: number | null;
  batch: Batch | null;
  user_id: number;
  movement_type: MovementType;
  reason: MovementReason;
  notes: string;
  qty: number;
  unit_cost: number;
  reference_id: number | null;
  reference_type: ReferenceType | null;
  reference_number: string;
}

export interface Warehouse {
  id: number;
  branch_id: number;
  code: string | null;
  name: string;
  type: WarehouseType;
  description: string | null;
  is_default: boolean;
}

export interface Product {
  id: number;
  tenant_id: number;
  category_id: number;
  category: null;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string;
  type: ProductType;
  unit_of_measure: UnitOfMeasure;
  average_cost: number;
  requires_batch: boolean;
  availability_status: AvailabilityStatus;
  picture: string | null;
  is_modifier: boolean;
  modifier_group: string | null;
  modifier_name: string | null;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface Batch {
  id: number;
  product_id: number;
  product: null;
  supplier_id: number;
  supplier: null;
  stock_entry_id: number;
  stock_entry: null;
  batch_number: string;
  unit_cost: number;
  production_date: string | null;
  expiration_date: string;
  alert_date: string | null;
  batch_status: BatchStatus;
  notes: string;
}

// Enums
export type MovementType =
  | 'entry'
  | 'sale_output'
  | 'recipe_consumption'
  | 'adjustment_in'
  | 'adjustment_out';

export type MovementReason =
  | 'stock_entry'
  | 'sale'
  | 'recipe_consumption'
  | 'expired'
  | 'damage'
  | 'manual_correction'
  | 'physical_count';

export type ReferenceType =
  | 'sale'
  | 'stock_entry';

export type WarehouseType =
  | 'main'
  | 'secondary';

export type ProductType =
  | 'finished_product'
  | 'ingredient'
  | 'raw_material';

export type UnitOfMeasure =
  | 'unit'
  | 'kg'
  | 'g'
  | 'l'
  | 'ml';

export type AvailabilityStatus =
  | 'available'
  | 'unavailable'
  | 'low_stock';

export type BatchStatus =
  | 'active'
  | 'expired'
  | 'exhausted';