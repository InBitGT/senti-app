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



export type ProductType = 'finished_product' | 'ingredient' | 'raw_material'

export type UnitOfMeasure = 'unit' | 'kg' | 'g' | 'l' | 'ml'

export type AvailabilityStatus = 'available' | 'unavailable' | 'low_stock'

export interface Product {
  id: number
  tenant_id: number
  category_id: number
  name: string
  description: string | null
  sku: string
  barcode: string | null
  brand: string | null
  type: ProductType
  unit_of_measure: UnitOfMeasure
  average_cost: number
  requires_batch: boolean
  availability_status: AvailabilityStatus
  picture: string | null
  is_modifier: boolean
  modifier_group: string | null
  modifier_name: string | null
  modifier_quantity: number | null
  modifier_min_selection: number | null
  modifier_max_selection: number | null
  modifier_price_adjustment: number | null
  modifier_is_default: boolean | null
}

// Para cuando el endpoint devuelve solo ingredientes del menú
export type MenuIngredient = Product & {
  type: 'ingredient'
  is_modifier: true
}
