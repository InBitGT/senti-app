export type EntryStatus = 'confirmed' | 'pending' | 'cancelled'

export type WarehouseType = 'main' | 'secondary'

export interface StockEntryWarehouse {
  id: number
  branch_id: number
  code: string | null
  name: string
  type: WarehouseType
  description: string | null
  is_default: boolean
}

export interface StockEntrySupplier {
  id: number
  tenant_id: number
  address_id: number | null
  name: string
  description: string | null
  nit: string
  phone: string
  email: string
  contact_name: string
}

export interface StockEntry {
  id: number
  tenant_id: number
  warehouse_id: number
  warehouse: StockEntryWarehouse
  supplier_id: number
  supplier: StockEntrySupplier
  user_id: number
  document_number: string
  document_date: string
  total: number
  entry_status: EntryStatus
  notes: string | null
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