import {
  RecipeAdjustmentType,
  RecipeAvailabilityStatus,
} from "@/src/types/recipe/recipe";

export interface RecipeVariantFormValue {
  name: string;
  price_adjustment: string;
  adjustment_type: RecipeAdjustmentType;
}

export interface RecipeIngredientFormValue {
  ingredient_id: string;
  quantity: string;
  waste_factor: string;
  variant_name: string;
}

export interface RecipeFormValues {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category_root_id: string;
  subcategory_id: string;
  /** No se muestra: siempre es la unidad de medida tipo "Unidad". */
  unit_of_measure_id: string;
  average_cost: string;
  availability_status: RecipeAvailabilityStatus;
  price_amount: string;
  has_wholesale_rule: boolean;
  wholesale_min_quantity: string;
  wholesale_discount_percentage: string;
  variants: RecipeVariantFormValue[];
  product_modifier_ids: number[];
  recipe_version: string;
  recipe_ingredients: RecipeIngredientFormValue[];
}

export const EMPTY_RECIPE_VARIANT: RecipeVariantFormValue = {
  name: "",
  price_adjustment: "0",
  adjustment_type: "fixed",
};

export const EMPTY_RECIPE_INGREDIENT: RecipeIngredientFormValue = {
  ingredient_id: "",
  quantity: "1",
  waste_factor: "",
  variant_name: "",
};
