export interface CashRegister {
  id: number;
  tenant_id: number;
  warehouse_id: number;
  name: string;
  code: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CreateCashRegister {
  tenant_id: number;
  warehouse_id: number;
  name: string;
  code: string;
}

export interface CloseCashRegisterPayload {
  user_id: number;
  closing_amount: number;
}

export type CashMovementType = "income" | "expense";

export interface CashMovementPayload {
  cash_register_session_id: number;
  user_id: number;
  movement_type: CashMovementType;
  amount: number;
  description?: string;
}

export interface CashVoucher {
  session_id: number;
  cash_register_id: number;
  cash_register_name: string;
  user_id: number;
  users: User[];
  opening_amount: number;
  opening_datetime: string;
  closing_amount: number;
  closing_datetime: string;
  expected_amount: number;
  difference: number;
  session_status: string;
  total_sales: number;
  total_orders: number;
  total_by_method: TotalByMethod[];
  total_movements: number;
  notes: string;
}

export interface User {
  user_id: number;
  can_close: boolean;
}

export interface TotalByMethod {
  method: string;
  amount: number;
}
