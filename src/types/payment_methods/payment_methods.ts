export type PaymentMethodKind =
  | "cash"
  | "card"
  | "transfer"
  | "credit"
  | "other";

export interface PaymentMethod {
  id: number;
  tenant_id: number;
  method: PaymentMethodKind | string;
  enabled: boolean;
  display_order: number;
  status?: boolean;
  created_at?: string;
  update_at?: string;
}

export interface CreatePaymentMethod {
  tenant_id: number;
  method: string;
  enabled: boolean;
  display_order: number;
}

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethodKind;
  label: string;
}[] = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "credit", label: "Crédito" },
  { value: "other", label: "Otro" },
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  credit: "Crédito",
  other: "Otro",
};
