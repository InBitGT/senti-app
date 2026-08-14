// ---------------------------------------------------------------------------
// 1) Shape crudo que devuelve el endpoint del catálogo
// ---------------------------------------------------------------------------
export interface ApiConversion {
  id: number;
  from_uom_id: number;
  from_uom_name: string;
  from_uom_code: string;
  to_uom_id: number;
  to_uom_name: string;
  to_uom_code: string;
  factor: number;
  // Precio especial para vender exactamente 1 de esta unidad de
  // conversión (ej. 1 "Caja" a Q18 en vez de los Q20 que daría la regla
  // de 3 con el precio base * factor). Pueden venir vacíos/null si esta
  // conversión no tiene precio especial — en ese caso el precio de la
  // unidad se sigue calculando como `price_normal * factor`.
  price_per_uom_id?: number | null;
  price_per_uom_amount?: number | null;
  price_per_uom_currency?: string | null;
}

export interface ApiCatalogProduct {
  product_id: number;
  name: string;
  sku: string;
  picture: string | null;
  category_id: number;
  category_name: string;
  parent_category_id: number;
  parent_category_name: string;
  unit_of_measure_id: number;
  unit_of_measure_code: string;
  unit_of_measure_name: string;
  stock_qty: number;
  base_price: number;
  currency: string;
  has_customer_type_price: boolean;
  customer_type_price: number;
  has_promotion: boolean;
  promotion_pct?: number;
  has_wholesale: boolean;
  wholesale_min_qty?: number;
  wholesale_discount_pct?: number;
  // NOTA: `final_price` es el precio YA con el descuento de mayoreo
  // aplicado por el backend. NO es "el precio a usar por defecto" — solo
  // debe usarse una vez que la cantidad en el carrito alcanza
  // `wholesale_min_qty`. El precio normal (antes de mayoreo) es
  // `base_price` (o `customer_type_price` si aplica).
  final_price: number;
  conversions: ApiConversion[];
}

// ---------------------------------------------------------------------------
// 2) Shape que consume la UI
// ---------------------------------------------------------------------------
export interface SellUnit {
  uom_id: number;
  code: string;
  name: string;
  factorToBase: number;
  // Precio de UNA unidad de este tipo en tarifa NORMAL (sin mayoreo). Si
  // la conversión trae price_per_uom_amount lo usa tal cual; si no, es
  // `normalPrice * factorToBase`.
  unitPrice: number;
  // Precio de UNA unidad de este tipo en tarifa de MAYOREO. Solo debe
  // usarse cuando la cantidad total en el carrito de este producto (en
  // unidades base, sumando todas las líneas sin importar la unidad con
  // la que se agregaron) alcanza `CatalogProduct.wholesale_min_qty`.
  wholesaleUnitPrice: number;
}

export interface CatalogProduct {
  product_id: number;
  name: string;
  sku: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  stock_qty: number;
  units: SellUnit[];
  // Precio normal (sin mayoreo). Antes este campo mezclaba normal y
  // mayoreo según cuál viniera con valor — ahora siempre es la tarifa
  // normal; para la tarifa de mayoreo usar `wholesalePrice`.
  price: number;
  // Precio con el descuento de mayoreo ya aplicado (viene de
  // `final_price` del backend). Solo se debe usar cuando la cantidad en
  // el carrito alcanza `wholesale_min_qty` — ver `has_wholesale` /
  // `wholesale_min_qty` abajo.
  wholesalePrice: number;
  hasPrice: boolean;
  has_wholesale: boolean;
  wholesale_min_qty: number | null;
  wholesale_discount_pct: number;
}

//checkout

export interface CheckoutItem {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  quantity: number;
  unit_price: number;
}

// Una de dos formas por línea, igual que en los ejemplos del backend:
// - crédito: solo { is_credit: true, amount }
// - efectivo/tarjeta: { payment_method_id, amount, amount_received?, reference? }
export type CheckoutPayment =
  | { is_credit: true; amount: number }
  | {
      payment_method_id: number;
      amount: number;
      amount_received?: number;
      reference?: string;
    };

export interface CheckoutPayload {
  branch_id: number;
  warehouse_id: number;
  user_id: number;
  cash_register_session_id: number;
  customer_id?: number;
  customer_type_id?: number;
  channel: "pos";
  tax: number;
  items: CheckoutItem[];
  payments: CheckoutPayment[];
  generate_fiscal_document: boolean;
  fiscal?: {
    document_type: string;
    customer_nit: string;
    customer_name: string;
  };
}
