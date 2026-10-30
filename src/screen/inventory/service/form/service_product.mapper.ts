import {
    CreateServiceProduct,
    CreateServiceRecipeIngredient,
    ServiceProduct,
} from "@/src/types/service/service";
import { toNullable, toNumber, toText } from "@/src/utils/form/formHelpers";
import { ServiceProductFormValues } from "./service_product_form";

export function toServiceProductFormValues(
  data?: ServiceProduct,
): ServiceProductFormValues {
  const product = data?.product;

  const isInSubcategory =
    !!product?.parent_category_id &&
    product.parent_category_id !== product.category_id;

  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? "",
    brand: product?.brand ?? "",
    category_root_id: isInSubcategory
      ? toText(product?.parent_category_id)
      : toText(product?.category_id),
    subcategory_id: isInSubcategory ? toText(product?.category_id) : "",
    unit_of_measure_id: toText(product?.unit_of_measure_id),
    average_cost: toText(product?.average_cost ?? 0),
    availability_status: product?.availability_status ?? "available",
    price_amount: toText(data?.price?.amount ?? 0),
    customer_type_prices: (data?.customer_type_prices ?? []).map((item) => ({
      customer_type_id: String(item.customer_type_id),
      amount: String(item.amount),
    })),
    has_wholesale_rule: !!data?.wholesale_rule,
    wholesale_min_quantity: toText(data?.wholesale_rule?.min_quantity),
    wholesale_discount_percentage: toText(
      data?.wholesale_rule?.discount_percentage,
    ),
    variants: (data?.variants ?? []).map((variant) => ({
      name: variant.name,
      price_adjustment: String(variant.price_adjustment),
      adjustment_type: variant.adjustment_type,
    })),
    product_modifier_ids: (data?.modifiers ?? []).map(
      (modifier) => modifier.product_modifier_id,
    ),
    has_recipe: data?.recipe !== null && data?.recipe !== undefined,
    recipe_name: data?.recipe?.name ?? "",
    recipe_version: toText(data?.recipe?.version),
    recipe_ingredients: (data?.recipe?.ingredients ?? []).map((item) => ({
      ingredient_id: String(item.ingredient_id),
      quantity: String(item.quantity),
      waste_factor: toText(item.waste_factor),
      variant_name: item.variant_name ?? "",
    })),
  };
}

export function toServiceProductPayload(
  values: ServiceProductFormValues,
  tenantId: number,
): CreateServiceProduct {
  const payload: CreateServiceProduct = {
    tenant_id: tenantId,
    category_id: Number(values.subcategory_id || values.category_root_id),
    name: values.name.trim(),
    description: toNullable(values.description),
    sku: values.sku.trim(),
    barcode: toNullable(values.barcode),
    brand: toNullable(values.brand),
    type: "service",
    unit_of_measure_id: Number(values.unit_of_measure_id),
    average_cost: toNumber(values.average_cost),
    requires_batch: false,
    availability_status: values.availability_status,
    price: {
      amount: toNumber(values.price_amount),
      currency: "GTQ",
    },
    customer_type_prices: values.customer_type_prices.map((item) => ({
      customer_type_id: Number(item.customer_type_id),
      amount: toNumber(item.amount),
      currency: "GTQ",
    })),
    wholesale_rule: values.has_wholesale_rule
      ? {
          min_quantity: Number(values.wholesale_min_quantity),
          discount_percentage: toNumber(values.wholesale_discount_percentage),
        }
      : null,
    variants: values.variants.map((variant) => ({
      name: variant.name.trim(),
      price_adjustment: toNumber(variant.price_adjustment),
      adjustment_type: variant.adjustment_type,
    })),
    product_modifier_ids: values.product_modifier_ids,
  };

  if (values.has_recipe && values.recipe_ingredients.length > 0) {
    payload.recipe = {
      ingredients: values.recipe_ingredients.map(
        (item): CreateServiceRecipeIngredient => {
          const ingredient: CreateServiceRecipeIngredient = {
            ingredient_id: Number(item.ingredient_id),
            quantity: toNumber(item.quantity),
          };
          if (item.waste_factor.trim().length > 0) {
            ingredient.waste_factor = toNumber(item.waste_factor);
          }
          const variantName = item.variant_name.trim();
          if (variantName.length > 0) {
            ingredient.variant_name = variantName;
          }
          return ingredient;
        },
      ),
    };
    const recipeName = values.recipe_name.trim();
    if (recipeName.length > 0) {
      payload.recipe.name = recipeName;
    }
    if (values.recipe_version.trim().length > 0) {
      payload.recipe.version = Number(values.recipe_version);
    }
  }

  return payload;
}
