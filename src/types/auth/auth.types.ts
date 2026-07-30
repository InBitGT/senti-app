export interface Claims {
  sub: number;
  tenant_id: number;
  tenant_name: string;
  email: string;
  username: string;
  role_id: number;
  role_name: string;
  branches: Branch[];
  exp: number;
  iat: number;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  warehouses: Warehouse[];
}

export interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
}
