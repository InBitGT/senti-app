export interface Claims {
  email: string;
  exp: number;
  iat: number;
  role_id: number;
  role_name: string;
  sub: number;
  tenant_id: number;
  username: string;
}