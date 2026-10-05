export type ServiceProductType = "service";
export type ServiceAvailabilityStatus = "available" | "unavailable";
export type ServiceAdjustmentType = "fixed" | "percentage";
export type ServiceCurrencyCode = "GTQ";

export interface ServiceProductInfo {
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
  type: ServiceProductType;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: ServiceAvailabilityStatus;
  picture: string | null;
  is_modifier: boolean;
  modifier_group: string | null;
  modifier_name: string | null;
  modifier_type: string | null;
  has_variable_price: boolean;
  product_modifier_id: number | null;
  modifier_quantity: number | null;
  modifier_min_selection: number | null;
  modifier_max_selection: number | null;
  modifier_price_adjustment: number | null;
  modifier_is_default: boolean | null;
}

export interface ServicePrice {
  id: number;
  amount: number;
  currency: ServiceCurrencyCode;
  is_base: boolean;
}

export interface ServiceVariant {
  id: number;
  name: string;
  price_adjustment: number;
  adjustment_type: ServiceAdjustmentType;
}

export interface ServiceModifierLink {
  product_modifier_id: number;
  modifier_product_id: number;
  name: string;
  quantity: number;
  min_selection: number;
  max_selection: number;
  price_adjustment: number;
  is_default: boolean;
  modifier_type: string | null;
}

export interface ServiceRecipeIngredient {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit?: string;
  waste_factor: number;
  variant_id: number | null;
  variant_name: string | null;
}

export interface ServiceRecipe {
  id: number;
  name: string;
  version: number;
  ingredients: ServiceRecipeIngredient[];
}

export interface ServiceProduct {
  product: ServiceProductInfo;
  price: ServicePrice | null;
  // Forma aún desconocida: llegan vacíos o en null
  conversions: unknown[];
  customer_type_prices: unknown[];
  price_per_uom: unknown[];
  wholesale_rule: unknown;
  variants: ServiceVariant[];
  modifiers: ServiceModifierLink[];
  recipe: ServiceRecipe | null;
}

// ---------- Payload de creación / edición ----------

export interface CreateServicePrice {
  amount: number;
  currency: ServiceCurrencyCode;
}

export interface CreateServiceVariant {
  name: string;
  price_adjustment: number;
  adjustment_type: ServiceAdjustmentType;
}

export interface CreateServiceRecipeIngredient {
  ingredient_id: number;
  quantity: number;
  waste_factor?: number;
  variant_name?: string;
}

export interface CreateServiceRecipe {
  name?: string;
  version?: number;
  ingredients: CreateServiceRecipeIngredient[];
}

export interface CreateServiceProduct {
  tenant_id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: ServiceProductType;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: ServiceAvailabilityStatus;
  price: CreateServicePrice;
  variants?: CreateServiceVariant[];
  product_modifier_ids?: number[];
  recipe?: CreateServiceRecipe;
}

export interface UpdateServiceProductParams {
  id: number;
  data: CreateServiceProduct;
}

// ---------- Opciones ----------

export interface ServiceModifierOption {
  product_modifier_id: number;
  name: string;
  price_adjustment: number;
}

export interface ServiceOption<T extends string> {
  value: T;
  label: string;
}

export const SERVICE_AVAILABILITY_OPTIONS: ServiceOption<ServiceAvailabilityStatus>[] =
  [
    { value: "available", label: "Disponible" },
    { value: "unavailable", label: "No disponible" },
  ];

export const SERVICE_ADJUSTMENT_OPTIONS: ServiceOption<ServiceAdjustmentType>[] =
  [
    { value: "fixed", label: "Monto fijo" },
    { value: "percentage", label: "Porcentaje" },
  ];

export function isServiceAvailabilityStatus(
  value: string,
): value is ServiceAvailabilityStatus {
  return SERVICE_AVAILABILITY_OPTIONS.some((option) => option.value === value);
}

export function isServiceAdjustmentType(
  value: string,
): value is ServiceAdjustmentType {
  return SERVICE_ADJUSTMENT_OPTIONS.some((option) => option.value === value);
}

export function getServiceOptionLabel<T extends string>(
  options: ServiceOption<T>[],
  value: T,
): string {
  const option = options.find((item) => item.value === value);
  return option ? option.label : value;
}
