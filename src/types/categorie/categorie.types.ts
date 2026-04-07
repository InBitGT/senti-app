

export interface Category {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface CategoryDetail {
  tenant_id: number
  name: string
  description: string
  parent_id: null | number
  sort_order: number
}