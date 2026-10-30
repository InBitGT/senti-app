import { ApiCustomerTypePrice, CheckoutPayload } from "@/src/types/pos/pos";

export interface RecipeCatalogVariant {
  id: number;
  name: string;
  price_adjustment: number;
  adjustment_type: string;
  stock_qty?: number;
}

export interface RecipeCatalogModifier {
  product_modifier_id: number;
  modifier_product_id: number;
  name: string;
  quantity: number;
  min_selection: number;
  max_selection: number;
  price_adjustment: number;
  is_default: boolean;
  modifier_type: string | null;
  stock_qty?: number;
}

export interface ApiRecipeCatalogProduct {
  product_id: number;
  name: string;
  sku: string;
  picture: string | null;
  brand?: string | null;
  type: string;
  has_recipe?: boolean;
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  parent_category_name: string;
  unit_of_measure_id: number;
  unit_of_measure_code: string;
  unit_of_measure_name: string;
  stock_qty: number;
  base_price: number;
  currency: string;
  has_customer_type_price: boolean;
  customer_type_price: number;
  customer_type_prices?: ApiCustomerTypePrice[];
  has_wholesale: boolean;
  wholesale_min_qty?: number;
  wholesale_discount_pct?: number;
  final_price: number;
  variants: RecipeCatalogVariant[];
  modifiers: RecipeCatalogModifier[];
}

export interface RecipeCheckoutItem {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  product_type: "recipe";
  product_variant_id?: number;
  modifier_product_ids?: number[];
  notes?: string;
  quantity: number;
  unit_price: number;
}

export interface RecipeCheckoutPayload extends Omit<CheckoutPayload, "items"> {
  items: RecipeCheckoutItem[];
  generate_kitchen_ticket: boolean;
}
