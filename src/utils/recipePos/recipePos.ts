import { RecipeCartLine } from "@/src/store/useRecipeCartStore/useRecipeCartStore";
import {
  ApiRecipeCatalogProduct,
  RecipeCatalogModifier,
  RecipeCatalogVariant,
} from "@/src/types/recipe_pos/recipe_pos";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function recipeCustomerTypePrice(
  product: ApiRecipeCatalogProduct,
  customerTypeId?: number | null,
): number {
  if (customerTypeId == null) return 0;
  const matches = (product.customer_type_prices ?? []).filter(
    (price) =>
      Number(price.customer_type_id) === Number(customerTypeId) &&
      Number(price.amount) > 0,
  );
  if (matches.length === 0) return 0;
  const latest = matches.reduce((a, b) =>
    Number(b.id) > Number(a.id) ? b : a,
  );
  return Number(latest.amount);
}

export function recipeBasePrice(
  product: ApiRecipeCatalogProduct,
  customerTypeId?: number | null,
): number {
  const typePrice = recipeCustomerTypePrice(product, customerTypeId);
  const legacyTypePrice = product.has_customer_type_price
    ? Number(product.customer_type_price)
    : 0;
  const appliedTypePrice = typePrice > 0 ? typePrice : legacyTypePrice;
  return appliedTypePrice > 0 ? appliedTypePrice : Number(product.base_price);
}

export function isRecipeWholesaleActive(
  product: ApiRecipeCatalogProduct,
  totalQty: number,
): boolean {
  return (
    product.has_wholesale &&
    product.wholesale_min_qty != null &&
    totalQty >= product.wholesale_min_qty
  );
}

export function recipeUnitPrice({
  product,
  variant,
  modifiers,
  customerTypeId,
  wholesaleActive,
}: {
  product: ApiRecipeCatalogProduct;
  variant: RecipeCatalogVariant | null;
  modifiers: RecipeCatalogModifier[];
  customerTypeId?: number | null;
  wholesaleActive: boolean;
}): number {
  const base = recipeBasePrice(product, customerTypeId);
  const variantAdjustment = variant?.price_adjustment ?? 0;
  const modifiersAdjustment = modifiers.reduce(
    (sum, modifier) => sum + modifier.price_adjustment,
    0,
  );
  const price = base + variantAdjustment + modifiersAdjustment;
  if (wholesaleActive) {
    return round2(price * (1 - (product.wholesale_discount_pct ?? 0) / 100));
  }
  return round2(price);
}

export function recipeStockLimit(
  product: ApiRecipeCatalogProduct,
  variant: RecipeCatalogVariant | null,
): number {
  return variant ? (variant.stock_qty ?? product.stock_qty) : product.stock_qty;
}

export function recipeRemaining(
  cart: RecipeCartLine[],
  product: ApiRecipeCatalogProduct,
  variant: RecipeCatalogVariant | null,
  excludeIndex?: number,
): number {
  const variantId = variant?.id ?? null;
  const inCart = cart.reduce((sum, line, index) => {
    if (index === excludeIndex) return sum;
    if (line.product.product_id !== product.product_id) return sum;
    if ((line.variant?.id ?? null) !== variantId) return sum;
    return sum + line.quantity;
  }, 0);
  return Math.max(0, recipeStockLimit(product, variant) - inCart);
}

export function recipeProductRemaining(
  cart: RecipeCartLine[],
  product: ApiRecipeCatalogProduct,
): number {
  if (product.variants.length === 0) {
    return recipeRemaining(cart, product, null);
  }
  return Math.max(
    ...product.variants.map((variant) =>
      recipeRemaining(cart, product, variant),
    ),
  );
}

export function recipeModifierUsed(
  cart: RecipeCartLine[],
  modifierProductId: number,
  excludeIndex?: number,
): number {
  return cart.reduce((sum, line, index) => {
    if (index === excludeIndex) return sum;
    const perRecipe = line.modifiers
      .filter((modifier) => modifier.modifier_product_id === modifierProductId)
      .reduce((total, modifier) => total + modifier.quantity, 0);
    return sum + perRecipe * line.quantity;
  }, 0);
}

export function recipeModifierRemaining(
  cart: RecipeCartLine[],
  modifier: RecipeCatalogModifier,
  excludeIndex?: number,
): number {
  if (modifier.stock_qty == null) return Number.POSITIVE_INFINITY;
  return Math.max(
    0,
    modifier.stock_qty -
      recipeModifierUsed(cart, modifier.modifier_product_id, excludeIndex),
  );
}

export function recipeModifiersMaxQty(
  modifiers: RecipeCatalogModifier[],
  getRemaining: (modifier: RecipeCatalogModifier) => number,
): number {
  const perRecipe = new Map<
    number,
    { modifier: RecipeCatalogModifier; units: number }
  >();
  modifiers.forEach((modifier) => {
    const current = perRecipe.get(modifier.modifier_product_id);
    perRecipe.set(modifier.modifier_product_id, {
      modifier,
      units: (current?.units ?? 0) + modifier.quantity,
    });
  });
  let max = Number.POSITIVE_INFINITY;
  perRecipe.forEach(({ modifier, units }) => {
    if (units <= 0) return;
    max = Math.min(max, Math.floor(getRemaining(modifier) / units));
  });
  return max;
}

export function recipeLineMax(
  cart: RecipeCartLine[],
  line: RecipeCartLine,
  index: number,
): number {
  return Math.min(
    recipeRemaining(cart, line.product, line.variant, index),
    recipeModifiersMaxQty(line.modifiers, (modifier) =>
      recipeModifierRemaining(cart, modifier, index),
    ),
  );
}
