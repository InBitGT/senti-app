export interface InventoryStockDetail {
  id: number;
  warehouse_id: number;
  warehouse: {
    id: number;
    branch_id: number;
    code: string;
    name: string;
    type: string;
    description: string;
    is_default: boolean;
    uses_zones: boolean;
  };
  product_id: number;
  product: {
    id: number;
    tenant_id: number;
    category_id: number;
    name: string;
    description: string;
    sku: string;
    barcode: string;
    brand: string;
    type: string;
    unit_of_measure_id: number;
    average_cost: number;
    requires_batch: boolean;
    availability_status: string;
    picture: string | null;
    is_modifier: boolean;
    modifier_group: string | null;
    modifier_name: string | null;
    status: boolean;
    created_at: string;
    update_at: string;
  };
  batch_id: number | null;
  batch: {
    id: number;
    batch_number: string;
    [key: string]: any;
  } | null;
  user_id: number;
  movement_type: string;
  reason: string;
  notes: string;
  qty: number;
  unit_cost: number;
  reference_id: number | null;
  reference_type: string | null;
  reference_number: string;
}
