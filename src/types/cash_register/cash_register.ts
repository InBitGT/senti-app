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
