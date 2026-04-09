export interface Ingredien {
  id: number
  category_id: number
  name: string
  sku: string
  barcode: string
  unit_of_measure: string
  requires_batch: boolean
  picture: any
}

export interface CreateIngredient {
  tenant_id: number
  category_id: number
  name: string
  description: string
  sku: string
  barcode: string
  brand: string | null
  type: string
  unit_of_measure: string
  average_cost: number
  requires_batch: boolean
  availability_status: string
  picture: string | null
  is_modifier: boolean
}
