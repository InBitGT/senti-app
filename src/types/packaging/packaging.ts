export type PackagingProductType = "packaging";
export type ModifierType = "packing";
export type AvailabilityStatus = "available" | "unavailable";

export interface Packaging {
  id: number;
  tenant_id: number;
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  parent_category_name: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: PackagingProductType;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: AvailabilityStatus;
  picture: string | null;
  is_modifier: boolean;
  modifier_group: string | null;
  modifier_name: string;
  modifier_type: ModifierType;
  has_variable_price: boolean;
  product_modifier_id: number;
  modifier_quantity: number;
  modifier_min_selection: number;
  modifier_max_selection: number;
  modifier_price_adjustment: number;
  modifier_is_default: boolean;
}

export interface CreatePackaging {
  tenant_id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: PackagingProductType;
  unit_of_measure_id: number;
  average_cost: number;
  availability_status: AvailabilityStatus;
  is_modifier: boolean;
  modifier_name: string;
  modifier_quantity: number;
  modifier_min_selection: number;
  modifier_max_selection: number;
  modifier_price_adjustment: number;
  modifier_is_default: boolean;
  modifier_type: ModifierType;
}

export interface UpdatePackagingParams {
  id: number;
  data: CreatePackaging;
}

export interface AvailabilityOption {
  value: AvailabilityStatus;
  label: string;
}

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { value: "available", label: "Disponible" },
  { value: "unavailable", label: "No disponible" },
];

export function isAvailabilityStatus(
  value: string,
): value is AvailabilityStatus {
  return AVAILABILITY_OPTIONS.some((option) => option.value === value);
}

export function getAvailabilityLabel(value: AvailabilityStatus): string {
  const option = AVAILABILITY_OPTIONS.find((item) => item.value === value);
  return option ? option.label : value;
}
