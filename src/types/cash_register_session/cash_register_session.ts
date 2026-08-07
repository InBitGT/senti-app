export interface CashRegister {
  id: number;
  tenant_id: number;
  warehouse_id: number;
  branch_id: number;
  name: string;
  code: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CashRegisterSessionUser {
  id: number;
  cash_register_session_id: number;
  user_id: number;
  can_close: boolean;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CashRegisterSession {
  id: number;
  cash_register_id: number;
  cash_register: CashRegister;
  user_id: number;
  users: CashRegisterSessionUser[];
  opening_amount: number;
  opening_datetime: string;
  closing_amount: number | null;
  closing_datetime: string | null;
  expected_amount: number | null;
  difference: number | null;
  session_status: "open" | "closed";
  notes: string | null;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface OpenCashRegisterPayload {
  cash_register_id: number;
  user_id: number;
  opening_amount: number;
  users: { user_id: number; can_close: boolean }[];
}
