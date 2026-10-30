export type RecipeProductType = "recipe";
export type RecipeAvailabilityStatus = "available" | "unavailable";
export type RecipeAdjustmentType = "fixed" | "percentage";
export type RecipeCurrencyCode = "GTQ";

export interface RecipeProductInfo {
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
  type: RecipeProductType;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: RecipeAvailabilityStatus;
  picture: string | null;
  is_modifier: boolean;
  has_variable_price: boolean;
}

export interface RecipePrice {
  id: number;
  amount: number;
  currency: RecipeCurrencyCode;
  is_base: boolean;
}

export interface RecipeCustomerTypePrice {
  id: number;
  customer_type_id: number;
  amount: number;
  currency: RecipeCurrencyCode;
}

export interface RecipeWholesaleRule {
  id: number;
  min_quantity: number;
  discount_percentage: number;
}

export interface RecipeVariant {
  id: number;
  name: string;
  price_adjustment: number;
  adjustment_type: RecipeAdjustmentType;
}

export interface RecipeModifierLink {
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

export interface RecipeIngredient {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit?: string;
  waste_factor: number;
  variant_id: number | null;
  variant_name: string | null;
}

export interface RecipeDetail {
  id: number;
  name: string;
  version: number;
  ingredients: RecipeIngredient[];
}

export interface Recipe {
  product: RecipeProductInfo;
  price: RecipePrice | null;
  customer_type_prices: RecipeCustomerTypePrice[];
  wholesale_rule: RecipeWholesaleRule | null;
  variants: RecipeVariant[];
  modifiers: RecipeModifierLink[];
  recipe: RecipeDetail | null;
}

export interface CreateRecipePrice {
  amount: number;
  currency: RecipeCurrencyCode;
}

export interface CreateRecipeCustomerTypePrice {
  customer_type_id: number;
  amount: number;
  currency: RecipeCurrencyCode;
}

export interface CreateRecipeWholesaleRule {
  min_quantity: number;
  discount_percentage: number;
}

export interface CreateRecipeVariant {
  name: string;
  price_adjustment: number;
  adjustment_type: RecipeAdjustmentType;
}

export interface CreateRecipeIngredient {
  ingredient_id: number;
  quantity: number;
  waste_factor?: number;
  variant_name?: string;
}

export interface CreateRecipeDetail {
  name?: string;
  version?: number;
  ingredients: CreateRecipeIngredient[];
}

export interface CreateRecipe {
  tenant_id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: RecipeProductType;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: RecipeAvailabilityStatus;
  price: CreateRecipePrice;
  customer_type_prices: CreateRecipeCustomerTypePrice[];
  wholesale_rule: CreateRecipeWholesaleRule | null;
  variants?: CreateRecipeVariant[];
  product_modifier_ids?: number[];
  recipe: CreateRecipeDetail;
}

export interface UpdateRecipeParams {
  id: number;
  data: CreateRecipe;
}

export interface RecipeModifierOption {
  product_modifier_id: number;
  name: string;
  price_adjustment: number;
  type_label: string;
}

export interface RecipeOption<T extends string> {
  value: T;
  label: string;
}

export const RECIPE_AVAILABILITY_OPTIONS: RecipeOption<RecipeAvailabilityStatus>[] =
  [
    { value: "available", label: "Disponible" },
    { value: "unavailable", label: "No disponible" },
  ];

export const RECIPE_ADJUSTMENT_OPTIONS: RecipeOption<RecipeAdjustmentType>[] = [
  { value: "fixed", label: "Monto fijo" },
];

export function isRecipeAvailabilityStatus(
  value: string,
): value is RecipeAvailabilityStatus {
  return RECIPE_AVAILABILITY_OPTIONS.some((option) => option.value === value);
}

export function isRecipeAdjustmentType(
  value: string,
): value is RecipeAdjustmentType {
  return RECIPE_ADJUSTMENT_OPTIONS.some((option) => option.value === value);
}
