export type WarehouseType = "storage" | "distribution" | "transit" | "returns";

export interface Branch {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  branch_id: number;
  code: string;
  name: string;
  type: WarehouseType | string;
  description?: string;
  is_default: boolean;
  uses_zones: boolean;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
  branch?: Branch;
}

export interface WarehouseDetail extends Warehouse {}

export interface WarehousePayload {
  branch_id: number;
  code: string;
  name: string;
  type: string;
  description?: string;
  is_default: boolean;
  uses_zones: boolean;
}

export const WAREHOUSE_TYPE_OPTIONS: { value: WarehouseType; label: string }[] =
  [
    { value: "storage", label: "Almacenamiento" },
    { value: "distribution", label: "Distribución" },
    { value: "transit", label: "Tránsito" },
    { value: "returns", label: "Devoluciones" },
  ];
