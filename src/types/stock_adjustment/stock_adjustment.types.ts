export interface StockAdjustmentCount {
  id: number;
  tenant_id: number;
  stock_count_id: number;
  warehouse_id: number;
  warehouse: Warehouse;
  requested_by: number;
  requested_by_name: string;
  approved_by: any;
  adjustment_status: string;
  adjustment_date: any;
  notes: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface Warehouse {
  id: number;
  branch_id: number;
  code: string;
  name: string;
  type: string;
  description: string;
  is_default: boolean;
  uses_zones: boolean;
}

export enum StatusAdjustmentStock {
  PENDING = "pending_approval",
  APPROVED = "approve",
  REJECTED = "reject",
}

export interface CreateAdjustmentCount {
  tenant_id: number;
  warehouse_id: number;
  requested_by: number;
  stock_count_id: number;
  notes: string;
  items: ItemCreateAdjustment[];
}

export interface ItemCreateAdjustment {
  product_id: number;
  stock_count_item_id: number;
  qty_difference: number;
}

export const ADJUSTMENT_STATUS_OPTIONS: {
  value: StatusAdjustmentStock;
  label: string;
}[] = [
  { value: StatusAdjustmentStock.PENDING, label: "Pendiente de aprobación" },
  { value: StatusAdjustmentStock.APPROVED, label: "Aprobado" },
  { value: StatusAdjustmentStock.REJECTED, label: "Rechazado" },
];

export const ADJUSTMENT_STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  pending_approval: { bg: "#fef9c3", color: "#a16207", label: "Pendiente" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "Aprobado" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rechazado" },
  completed: { bg: "#e0e7ff", color: "#4338ca", label: "Completado" },
};

export interface ApprovedType {
  approved_by: number;
  notes: string;
}
