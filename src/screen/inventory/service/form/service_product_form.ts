import {
    ServiceAdjustmentType,
    ServiceAvailabilityStatus,
} from "@/src/types/service/service";

export interface ServiceVariantFormValue {
  name: string;
  price_adjustment: string;
  adjustment_type: ServiceAdjustmentType;
}

export interface ServiceRecipeIngredientFormValue {
  ingredient_id: string;
  quantity: string;
  waste_factor: string;
  variant_name: string;
}

export interface ServiceProductFormValues {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string;
  category_root_id: string;
  subcategory_id: string;
  unit_of_measure_id: string;
  average_cost: string;
  availability_status: ServiceAvailabilityStatus;
  price_amount: string;
  variants: ServiceVariantFormValue[];
  product_modifier_ids: number[];
  has_recipe: boolean;
  recipe_name: string;
  recipe_version: string;
  recipe_ingredients: ServiceRecipeIngredientFormValue[];
}

export const EMPTY_SERVICE_VARIANT: ServiceVariantFormValue = {
  name: "",
  price_adjustment: "0",
  adjustment_type: "fixed",
};

export const EMPTY_SERVICE_RECIPE_INGREDIENT: ServiceRecipeIngredientFormValue =
  {
    ingredient_id: "",
    quantity: "1",
    waste_factor: "",
    variant_name: "",
  };
