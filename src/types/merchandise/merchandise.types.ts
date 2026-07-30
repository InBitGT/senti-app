export interface Merchandise {
  id: number;
  tenant_id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: "storable" | "ingredient" | "finished_product" | "menu_item" | string;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  picture: string | null;
  is_modifier: boolean;
  modifier_group: string | null;
  modifier_name: string | null;
  product_modifier_id: number | null;
  modifier_quantity: number | null;
  modifier_min_selection: number | null;
  modifier_max_selection: number | null;
  modifier_price_adjustment: number | null;
  modifier_is_default: boolean | null;
}

export interface CreateMerchandise {
  id?: number;
  tenant_id: number;
  category_id: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: any;
  type: string;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  picture: any;
  is_modifier: boolean;
}
