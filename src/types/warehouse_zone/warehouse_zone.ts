export type ZoneType = "zone" | "aisle" | "shelf" | "bin" | "rack";

export interface WarehouseZone {
  id: number;
  warehouse_id: number;
  parent_zone_id: number | null;
  parent_zone?: WarehouseZone | null;
  name: string;
  code: string;
  zone_type: ZoneType | string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CreateWarehouseZone {
  warehouse_id: number;
  parent_zone_id?: number | null;
  name: string;
  code: string;
  zone_type: string;
}

// ⚠️ Opciones inferidas de tu ejemplo (zone, aisle) — ajusta si tu backend usa otras.
export const ZONE_TYPE_OPTIONS: { value: ZoneType; label: string }[] = [
  { value: "zone", label: "Zona" },
  { value: "aisle", label: "Pasillo" },
  { value: "shelf", label: "Estante" },
  { value: "rack", label: "Rack" },
  { value: "bin", label: "Contenedor" },
];
