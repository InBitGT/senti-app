export interface UnitOfMeasure {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  uom_type: string;
  is_conversion_manual: boolean;
  status: boolean;
  created_at: string;
  update_at: string;
}
