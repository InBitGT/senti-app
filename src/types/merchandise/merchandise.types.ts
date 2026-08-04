// merchandise.types.ts

// ── Sub-tipos compartidos ──

export interface Price {
  amount: number;
  currency: string;
}

export interface PricePerUom {
  id?: number;
  amount: number;
  currency: string;
  wholesale_min_qty?: number | null;
  wholesale_amount?: number | null;
}

export interface MerchandiseConversion {
  id?: number;
  from_uom_id: number;
  to_uom_id: number;
  factor: number;
  // Precio específico para esta conversión de unidad (opcional).
  price_per_uom?: PricePerUom | null;
}

export interface CustomerTypePrice {
  id?: number;
  customer_type_id: number;
  amount: number;
  currency: string;
}

export interface WholesaleRule {
  id?: number;
  min_quantity: number;
  discount_percentage: number;
}

// ── Producto base, tal como viene dentro de "product" en el GET ──

export interface MerchandiseProduct {
  id: number;
  tenant_id: number;
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  parent_category_name: string | null;
  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: string;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  picture: string | null;
  is_modifier: boolean;
  modifier_group: string | null;
  modifier_name: string | null;
  product_modifier_id: number | null;
  modifier_quantity: number | null;
  modifier_min_selection: number | null;
  modifier_max_selection: number | null;
  modifier_price_adjustment: number | null;
  modifier_is_default: boolean | null;
}

// ── Shape completo que devuelve el GET (detalle y, asumimos, cada item del listado) ──

export interface MerchandiseListItem {
  product: MerchandiseProduct;
  price: Price | null;
  conversions: MerchandiseConversion[];
  customer_type_prices: CustomerTypePrice[];
  price_per_uom: PricePerUom[];
  wholesale_rule: WholesaleRule | null;
}

// ── Payload para crear/editar (POST/PUT) ──

export interface MerchandiseDetail {
  tenant_id: number;
  category_id: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string | null;
  type: string;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  picture: string | null;
  is_modifier: boolean;
  price: Price;
  conversions: MerchandiseConversion[];
  customer_type_prices: CustomerTypePrice[];
  wholesale_rule: WholesaleRule | null;
}

// ── Fila plana para MerchandiseTable ──

export interface Merchandise {
  id: number;
  tenant_id: number;
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  parent_category_name: string | null;
  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  brand: string | null;
  type: string;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  is_modifier: boolean;
  modifier_group: string | null;
  modifier_name: string | null;
  modifier_quantity: number | null;
  modifier_min_selection: number | null;
  modifier_max_selection: number | null;
  modifier_price_adjustment: number | null;
  modifier_is_default: boolean | null;
  // Derivados del resto del payload, útiles para columnas/badges en la tabla
  // y para el modal de detalle.
  sale_price: number | null;
  sale_price_currency: string | null;
  has_wholesale_rule: boolean;
  wholesale_min_quantity: number | null;
  wholesale_discount_percentage: number | null;
  conversions_count: number;
  customer_type_prices_count: number;
}

// Aplana un item del GET (product + price + conversions + ...) a una fila de tabla.
export function flattenMerchandiseListItem(
  item: MerchandiseListItem,
): Merchandise {
  const { product } = item;
  return {
    id: product.id,
    tenant_id: product.tenant_id,
    category_id: product.category_id,
    category_name: product.category_name,
    parent_category_id: product.parent_category_id,
    parent_category_name: product.parent_category_name,
    name: product.name,
    description: product.description,
    sku: product.sku,
    barcode: product.barcode,
    brand: product.brand,
    type: product.type,
    unit_of_measure_id: product.unit_of_measure_id,
    average_cost: product.average_cost,
    requires_batch: product.requires_batch,
    availability_status: product.availability_status,
    is_modifier: product.is_modifier,
    modifier_group: product.modifier_group,
    modifier_name: product.modifier_name,
    modifier_quantity: product.modifier_quantity,
    modifier_min_selection: product.modifier_min_selection,
    modifier_max_selection: product.modifier_max_selection,
    modifier_price_adjustment: product.modifier_price_adjustment,
    modifier_is_default: product.modifier_is_default,
    sale_price: item.price?.amount ?? null,
    sale_price_currency: item.price?.currency ?? null,
    has_wholesale_rule: !!item.wholesale_rule,
    wholesale_min_quantity: item.wholesale_rule?.min_quantity ?? null,
    wholesale_discount_percentage:
      item.wholesale_rule?.discount_percentage ?? null,
    conversions_count: item.conversions?.length ?? 0,
    customer_type_prices_count: item.customer_type_prices?.length ?? 0,
  };
}

export function flattenMerchandiseList(
  items: MerchandiseListItem[] | undefined,
): Merchandise[] {
  if (!items) return [];
  return items.map(flattenMerchandiseListItem);
}
