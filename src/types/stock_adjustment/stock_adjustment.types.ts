export interface StockAdjustment {
  tenant_id: number;
  warehouse_id: number;
  requested_by: number;
  stock_count_id: number;
  notes: string;
  items: Item[];
}

export interface Item {
  product_id: number;
  batch_id?: number;
  stock_count_item_id: number;
  qty_difference: number;
  unit_cost: number;
}

export enum StatusAdjustmentStock {
  PENDING = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
}
