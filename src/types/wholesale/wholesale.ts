import { Product } from "../product/product.types";

export interface ProductWholesaleRule {
  id: number;
  tenant_id: number;
  product_id: number;
  product: Product;
  category_id: number | null;
  min_quantity: number;
  discount_percentage: number;
  status: boolean;
  created_at: string;
  update_at: string;
}

export interface CreateProductWholesaleRule {
  tenant_id: number;
  product_id: number;
  min_quantity: number;
  discount_percentage: number;
}
