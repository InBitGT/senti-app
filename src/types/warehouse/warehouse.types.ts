export type WarehouseType = "storage" | "distribution" | "transit" | "returns";

export interface Address {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface Branch {
  id: number;
  name: string;
  address_id?: number;
  address?: Address;
  description?: string;
  tenant_id?: number;
}

export type ZoneType = "zone" | "aisle" | "shelf" | "bin" | "rack";

export interface WarehouseZone {
  id: number;
  warehouse_id: number;
  parent_zone_id: number | null;
  name: string;
  code: string;
  zone_type: ZoneType | string;
  status: boolean;
}

export interface Warehouse {
  id: number;
  branch_id: number;
  branch?: Branch;
  code: string | null;
  name: string;
  type: WarehouseType | string;
  description?: string;
  is_default: boolean;
  uses_zones: boolean;
  zones?: WarehouseZone[];
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseDetail extends Warehouse {}

export interface WarehouseZonePayload {
  id?: number; // presente si es una zona ya existente que se está editando
  temp_id: string;
  parent_temp_id?: string | null;
  name: string;
  code: string;
  zone_type: string;
}

export interface WarehousePayload {
  branch_id: number;
  code: string;
  name: string;
  type: string;
  description?: string;
  is_default: boolean;
  uses_zones: boolean;
  zones?: WarehouseZonePayload[];
}

export const WAREHOUSE_TYPE_OPTIONS: { value: WarehouseType; label: string }[] =
  [
    { value: "storage", label: "Almacenamiento" },
    { value: "distribution", label: "Distribución" },
    { value: "transit", label: "Tránsito" },
    { value: "returns", label: "Devoluciones" },
  ];

// ⚠️ Opciones inferidas de tu ejemplo (zone, aisle) — ajusta si tu backend usa otras.
export const ZONE_TYPE_OPTIONS: { value: ZoneType; label: string }[] = [
  { value: "zone", label: "Zona" },
  { value: "aisle", label: "Pasillo" },
  { value: "shelf", label: "Estante" },
  { value: "rack", label: "Rack" },
  { value: "bin", label: "Contenedor" },
];
