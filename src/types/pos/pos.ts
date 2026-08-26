export interface ApiConversion {
  id: number;
  from_uom_id: number;
  from_uom_name: string;
  from_uom_code: string;
  to_uom_id: number;
  to_uom_name: string;
  to_uom_code: string;
  factor: number;
  price_per_uom_id?: number | null;
  price_per_uom_amount?: number | null;
  price_per_uom_currency?: string | null;
}

export interface ApiCatalogProduct {
  product_id: number;
  name: string;
  sku: string;
  picture: string | null;
  brand?: string;
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
  final_price: number;
  conversions: ApiConversion[];
}

export interface SellUnit {
  uom_id: number;
  code: string;
  name: string;
  factorToBase: number;
  unitPrice: number;
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
  price: number;
  brand?: string;
  wholesalePrice: number;
  hasPrice: boolean;
  has_wholesale: boolean;
  wholesale_min_qty: number | null;
  wholesale_discount_pct: number;
}

export interface CheckoutItem {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  quantity: number;
  unit_price: number;
}

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
