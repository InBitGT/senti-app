export interface CustomerType {
  id: number;
  tenant_id: number;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CreateCustomerType {
  tenant_id: number;
  name: string;
  description: string;
}
