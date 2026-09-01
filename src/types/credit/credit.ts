export interface CreateCredit {
  customer_id: number;
  has_credit: boolean;
  credit_limit: number;
  payment_term_days: number;
}

export interface CustomerCredit {
  id: number;
  customer_id: number;
  customer: Customer;
  has_credit: boolean;
  credit_limit: number;
  credit_available: number;
  credit_used: number;
  payment_term_days: number;
  credit_due_date: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface Customer {
  id: number;
  tenant_id: number;
  customer_type_id: number;
  customer_type: CustomerType;
  name: string;
  document_type: string;
  document_number: string;
  phone: string;
  email: string;
  address: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CustomerType {
  id: number;
  tenant_id: number;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CreatePreviousCredit {
  amount: number;
  user_id: number;
  description: string;
}
