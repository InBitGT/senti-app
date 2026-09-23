import { CustomerType } from "../customer_type/customer_type";

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
  credit?: Credit;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CreateCustomer {
  tenant_id: number;
  customer_type_id: number;
  name: string;
  document_type: string;
  document_number: string;
  phone: string;
  email: string;
  address: string;
}

interface Credit {
  id: number;
  customer_id: number;
  has_credit: boolean;
  credit_limit: number;
  credit_available: number;
  credit_used: number;
  payment_term_days: number;
  credit_due_date: any;
  status: boolean;
  created_at: string;
  update_at: string;
}
