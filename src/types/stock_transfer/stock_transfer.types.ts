export type TransferStatus =
  | "draft"
  | "in_transit"
  | "received"
  | "received_with_differences"
  | "rejected"
  | "cancelled";

export type TransferType = "normal" | "return";

export type RejectionReason =
  | "damaged"
  | "expired"
  | "wrong_product"
  | "quality"
  | "other";

export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  damaged: "Dañado",
  expired: "Vencido",
  wrong_product: "Producto equivocado",
  quality: "Calidad",
  other: "Otro",
};

export interface TransferUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface TransferLink {
  id: number;
  number: string;
  status: TransferStatus;
}

export interface TransferEndpoint {
  warehouse: {
    id: number;
    code: string | null;
    name: string;
    type: string;
    branch_id: number;
  } | null;
  branch: { id: number; name: string } | null;
  warehouse_code_snapshot: string | null;
  warehouse_name_snapshot: string;
  branch_name_snapshot: string;
}

export interface TransferTotals {
  lines: number;
  qty_sent: number;
  qty_accepted: number;
  qty_rejected: number;
  qty_missing: number;
  value_sent: number;
  value_accepted?: number;
  value_rejected: number;
  value_lost: number;
  compliance_rate: number | null;
}

/** Datos del producto/lote congelados al momento del traslado. */
export interface TransferItemSnapshot {
  product_sku: string;
  product_name: string;
  uom_code: string | null;
  batch_number: string | null;
  batch_expiration: string | null;
}

export interface StockTransfer {
  id: number;
  tenant_id: number;
  tenant_name: string;
  number: string;
  transfer_type: TransferType;
  status: TransferStatus;
  status_label: string;
  parent_transfer: TransferLink | null;
  return_transfer: TransferLink | null;
  group_id: number | null;
  request_id: number | null;
  origin: TransferEndpoint;
  destination: TransferEndpoint;
  notes: string | null;
  created_by: TransferUser | null;
  created_at: string;
  dispatched_by: TransferUser | null;
  dispatched_at: string | null;
  received_by: TransferUser | null;
  received_at: string | null;
  cancelled_by: TransferUser | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  hours_in_transit: number | null;
  update_at: string;
  totals: TransferTotals;
}

export interface StockTransferItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    sku: string;
    name: string;
    barcode: string | null;
    type: string;
  } | null;
  batch_id: number | null;
  snapshot: TransferItemSnapshot;
  qty_sent: number;
  qty_accepted: number;
  qty_rejected: number;
  qty_missing: number;
  rejection_reason: RejectionReason | null;
  unit_cost: number;
  value_sent: number;
  value_lost: number;
  notes: string | null;
  reception_notes: string | null;
}

export interface TransferTimelineEntry {
  action: string;
  label: string;
  user: TransferUser | null;
  at: string;
}

export interface TransferMovement {
  id: number;
  movement_type: string;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  batch_id: number | null;
  qty: number;
  unit_cost: number;
  user: TransferUser | null;
  created_at: string;
}

export interface StockTransferDetail extends StockTransfer {
  items: StockTransferItem[];
  timeline: TransferTimelineEntry[];
  movements?: TransferMovement[];
}

export interface TransferSummary {
  total_transfers: number;
  by_status: { status: TransferStatus; label: string; total: number }[];
  qty_sent: number;
  qty_accepted: number;
  qty_rejected: number;
  qty_missing: number;
  value_sent: number;
  value_rejected: number;
  value_lost: number;
  compliance_rate: number | null;
  avg_hours_in_transit: number;
}

export interface StockTransferPage {
  data: StockTransfer[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  summary: TransferSummary;
}

export interface StockTransferFilters {
  branch_id?: number | string;
  status?: TransferStatus[];
  transfer_type?: TransferType;
  number?: string;
  with_differences?: boolean;
  sort?: string;
  page?: number;
  page_size?: number;
}

export interface TransferReceptionItem {
  item_id: number;
  product_id: number;
  batch_id: number | null;
  snapshot: TransferItemSnapshot;
  qty_sent: number;
  qty_accepted: number;
  qty_rejected: number;
  qty_missing: number;
  rejection_reason: RejectionReason | null;
  rejection_reason_label: string | null;
  reception_notes: string | null;
  unit_cost: number;
  value_sent: number;
  value_accepted: number;
  value_rejected: number;
  value_lost: number;
}

/** Acta de recepción: solo existe para traslados ya recibidos. */
export interface TransferReception {
  transfer_id: number;
  number: string;
  transfer_type: TransferType;
  status: TransferStatus;
  status_label: string;
  origin: TransferEndpoint;
  destination: TransferEndpoint;
  dispatched_by: TransferUser | null;
  dispatched_at: string | null;
  received_by: TransferUser | null;
  received_at: string | null;
  hours_in_transit: number | null;
  notes: string | null;
  items: TransferReceptionItem[];
  totals: TransferTotals;
  parent_transfer: TransferLink | null;
  return_transfer: TransferLink | null;
}

export interface ReceiveTransferItem {
  item_id: number;
  qty_accepted: number;
  qty_rejected: number;
  rejection_reason?: RejectionReason;
  notes?: string;
}

export interface ReceiveTransferBody {
  user_id: number;
  notes?: string;
  items: ReceiveTransferItem[];
}

export interface CreateTransferItem {
  product_id: number;
  quantity: number;
  notes?: string;
}

export interface CreateTransferBody {
  tenant_id: number;
  user_id: number;
  origin_warehouse_id: number;
  destination_warehouse_id: number;
  notes?: string;
  items: CreateTransferItem[];
}

export interface DispatchTransferBody {
  user_id: number;
}

export interface CancelTransferBody {
  user_id: number;
  reason?: string;
}
