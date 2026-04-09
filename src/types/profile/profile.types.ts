export interface UserInfo {
  id: number
  tenant_id: number
  tenant: any
  username: string
  email: string
  password: string
  phone: string
  first_name: string
  last_name: string
  address_id: number
  address?: Address
  role_id: number
  role?: Role
  is_active: boolean
  two_fa_enabled: boolean
  status: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  description: string
  status: boolean
  created_at: string
  update_at: string
}

export interface UserUpdate {
  username: string
  email: string
  phone: string
  first_name: string
  last_name: string
  address_id: number
  role_id: number
  is_active: boolean
  two_fa_enabled: boolean
  status: boolean
}

export interface Address {
  id: number
  line1: string
  line2: string
  city: string
  state: string
  country: string
  postal_code: string
  status: boolean
  created_at: string
  update_at: string
}

export interface UpdateAddress {
  line1: string
  line2: string
  city: string
  state: string
  country: string
  postal_code: string
  status: boolean
}

