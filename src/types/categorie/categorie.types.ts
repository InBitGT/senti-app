export interface Category {
  id: number;
  tenant_id: number;
  parent_id?: number;
  parent?: Parent;
  name: string;
  description: string;
  sort_order: number;
}

export interface CategoryDetail {
  id?: number;
  tenant_id: number;
  name: string;
  description: string;
  parent_id?: null | number;
  sort_order?: number;
}

export interface Parent {
  id: number;
  tenant_id: number;
  parent_id: number;
  parent: string | null;
  name: string;
  description: string;
  sort_order: number;
}
