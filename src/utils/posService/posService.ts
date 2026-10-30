import { CartLine } from "@/src/store/useCartStore/useCartStore";
import { RecipeCatalogModifier } from "@/src/types/recipe_pos/recipe_pos";
import { recipeModifiersMaxQty } from "@/src/utils/recipePos/recipePos";

// Suma que agregan la variante y los modificadores elegidos en un servicio,
// por unidad base. En productos normales siempre es 0.
export function serviceLineAdjustment(line: CartLine): number {
  const variantAdjustment = line.variant?.price_adjustment ?? 0;
  const modifiersAdjustment = (line.modifiers ?? []).reduce(
    (sum, modifier) => sum + modifier.price_adjustment,
    0,
  );
  return variantAdjustment + modifiersAdjustment;
}

// Precio por unidad de venta con los ajustes del servicio. Con mayoreo
// activo el descuento también aplica a los ajustes, igual que en recetas.
export function withServiceAdjustment(
  line: CartLine,
  unitPrice: number,
  wholesaleActive: boolean,
): number {
  const adjustment = serviceLineAdjustment(line) * line.unit.factorToBase;
  if (adjustment === 0) return unitPrice;
  const discount = wholesaleActive
    ? 1 - line.product.wholesale_discount_pct / 100
    : 1;
  return unitPrice + adjustment * discount;
}

// Los modificadores (material de empaque) sí tienen stock: se descuenta lo
// que ya usan las líneas del carrito.
export function serviceModifierRemaining(
  cart: CartLine[],
  modifier: RecipeCatalogModifier,
  excludeIndex?: number,
): number {
  if (modifier.stock_qty == null) return Number.POSITIVE_INFINITY;
  const used = cart.reduce((sum, line, index) => {
    if (index === excludeIndex) return sum;
    const perUnit = (line.modifiers ?? [])
      .filter((m) => m.modifier_product_id === modifier.modifier_product_id)
      .reduce((total, m) => total + m.quantity, 0);
    return sum + perUnit * line.quantity;
  }, 0);
  return Math.max(0, modifier.stock_qty - used);
}

// Un servicio no tiene stock propio; solo lo limitan sus modificadores.
export function serviceLineMax(cart: CartLine[], index: number): number {
  const line = cart[index];
  if (!line) return 0;
  return recipeModifiersMaxQty(line.modifiers ?? [], (modifier) =>
    serviceModifierRemaining(cart, modifier, index),
  );
}
