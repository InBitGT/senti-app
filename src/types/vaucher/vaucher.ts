// TODO: si ya tenés estos tipos definidos en otro lado (p. ej. junto al
// resto de tipos de pos), mové este archivo ahí y ajustá el import en
// useOrderStore.ts y Payment.tsx.

export interface VaucherItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  category_id: number | null;
  category_name: string | null;
  prep_station_code: string | null;
  product_variant_id: number | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  unit_cost_snapshot: number;
  margin: number;
  discount: number;
  subtotal: number;
  notes: string | null;
  status: boolean;
  created_at: string;
  update_at: string;
  modifiers: unknown[];
}

export interface VaucherPayment {
  id: number;
  order_id: number;
  payment_method_id: number;
  cash_register_session_id: number;
  amount: number;
  amount_received: number;
  change_amount: number;
  reference: string | null;
  payment_status: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface Vaucher {
  id: number;
  branch_id: number;
  warehouse_id: number;
  user_id: number;
  promotion_id: number | null;
  cash_register_session_id: number;
  customer_id: number | null;
  customer_type_id: number | null;
  order_type: string;
  order_status: string;
  channel: string;
  subtotal: number;
  total_discount: number;
  tax: number;
  total: number;
  status: boolean;
  created_at: string;
  update_at: string;
  items: VaucherItem[];
  payments: VaucherPayment[];
  kitchen_tickets: unknown[];
  fiscal_documents: unknown[];
}
