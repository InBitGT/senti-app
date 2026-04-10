export interface MenuItemPrice {
  id: number
  product_id: number
  amount: number
  currency: string
  is_base: boolean
  status: boolean
}

export interface MenuItemRecipeIngredient {
  id: number
  ingredient_id: number
  quantity: number
  unit: string
  waste_factor: number
}

export interface MenuItemRecipe {
  id: number
  product_id: number
  name: string
  version: number
  ingredients: MenuItemRecipeIngredient[]
}

export interface MenuItemVariant {
  id: number
  product_id: number
  name: string
  price_adjustment: number
  adjustment_type: 'fixed' | 'percentage'
  status: boolean
}

export interface MenuItemModifier {
  product_modifier_id: number
  modifier_product_id: number
  name: string
  modifier_group: string
  modifier_name: string
  quantity: number
  min_selection: number
  max_selection: number
  price_adjustment: number
  is_default: boolean
  status: boolean
}

export interface MenuItemProduct {
  id: number
  tenant_id: number
  category_id: number
  name: string
  description: string
  sku: string
  barcode: string
  brand: string
  type: string
  unit_of_measure: string
  average_cost: number
  requires_batch: boolean
  availability_status: string
  picture: string
  status: boolean
  is_modifier: boolean
  modifier_group: string
  modifier_name: string
}

export interface MenuItem {
  product: MenuItemProduct
  price: MenuItemPrice | null
  recipe: MenuItemRecipe | null
  variants: MenuItemVariant[]
  modifiers: MenuItemModifier[]
}

export interface MenuItemDetail {
  product: {
    tenant_id: number;
    category_id: number;
    name: string;
    sku: string;
    type: string;
    unit_of_measure: string;
    availability_status: string;
    price: number;
    currency: string;
  };
  recipe: {
    version: number;
    ingredients: {
      ingredient_id: number;
      quantity: number;
      unit: string;
      waste_factor: number;
    }[];
  };
  variants: {
    name: string;
    price_adjustment: number;
    adjustment_type: string;
  }[];
  modifiers: number[];
}