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
