import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { InventoryStockDetail } from "@/src/types/inventory_stock/inventory_stock.types";

export async function StockFn() {
  const { claims } = useAuthStore.getState() 
   
  if (!claims){
    throw new Error();
  }
  console.log(ENDPOINT.stock.detail(claims.tenant_id))
  const response = await get<InventoryStockDetail[]>(ENDPOINT.stock.detail(claims.tenant_id));
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

