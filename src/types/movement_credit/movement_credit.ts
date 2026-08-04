import { Customer } from "@/src/types/customer/customer";

export type MovementType = "charge" | "payment";

export interface MovementUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  role_name: string;
}

export interface CustomerCreditMovement {
  id: number;
  customer_id: number;
  customer: Customer;
  order_id: number | null;
  movement_type: MovementType | string;
  amount: number;
  balance_after: number;
  is_override: boolean;
  authorized_by: number | null;
  payment_term_days: number | null;
  description?: string | null;
  user_id: number;
  user: MovementUser;
  status: boolean;
  created_at: string;
  update_at: string;
}

export const MOVEMENT_TYPE_OPTIONS: { value: MovementType; label: string }[] = [
  { value: "charge", label: "Cargo" },
  { value: "payment", label: "Pago" },
];
