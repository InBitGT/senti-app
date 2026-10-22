export interface PrepStationCategory {
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  parent_category_name: string | null;
}

export interface PrepStationProduct {
  product_id: number;
  product_name: string;
  product_sku: string;
  category_id: number;
  category_name: string;
}

export interface PrepStation {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  status: boolean;
  created_at: string;
  update_at: string;
  categories: PrepStationCategory[];
  products: PrepStationProduct[];
}

export interface PrepStationDetail {
  tenant_id: number;
  name: string;
  code: string;
  category_ids: number[];
  product_ids: number[];
}

export type PrepStationPayload = Omit<PrepStationDetail, "tenant_id">;

export interface PrepStationOption {
  label: string;
  value: number;
}

// Tipos de producto que se pueden asignar a una estación
export type PrepStationProductType = "merchandise" | "recipe";

// Producto disponible para el select de estaciones
export interface PrepStationProductItem {
  id: number;
  name: string;
  sku: string;
  type: PrepStationProductType;
}
