export interface InventoryStockDetail {
  warehouse_id: number
  warehouse_name: string
  product_id: number
  product_name: string
  sku: string
  unit_of_measure: string
  total_qty_on_hand: number
  total_qty_reserved: number
  available_qty: number
  average_cost: number
  batch_lines: number
}
