export type DocumentType = "receipt" | "invoice" | "credit_note" | "debit_note";
export type DocumentStatus = "issued" | "voided" | "pending";

export interface FiscalDocumentItem {
  product_id: number;
  product_name: string;
  category_name: string | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  notes: string | null;
}

export interface FiscalDocument {
  id: number;
  order_id: number;
  branch_id: number;
  branch_name: string;
  user_first_name: string;
  user_last_name: string;
  document_type: DocumentType | string;
  series: string;
  number: string;
  document_status: DocumentStatus | string;
  customer_nit: string;
  customer_name: string;
  subtotal: number;
  iva: number;
  total: number;
  issued_at: string;
  voided_at?: string | null;
  items?: FiscalDocumentItem[];
  status: boolean;
}

// ⚠️ Opciones inferidas de tu ejemplo (receipt, issued/voided) — ajusta si tu backend usa otras.
export const DOCUMENT_STATUS_OPTIONS: {
  value: DocumentStatus;
  label: string;
}[] = [
  { value: "issued", label: "Emitido" },
  { value: "voided", label: "Anulado" },
  { value: "pending", label: "Pendiente" },
];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  receipt: "Recibo",
  invoice: "Factura",
  credit_note: "Nota de crédito",
  debit_note: "Nota de débito",
};
