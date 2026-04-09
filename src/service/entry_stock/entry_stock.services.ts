import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { Adjustment, InventoryDetail, StockEntry } from "@/src/types/entry_stock/entry_stock.types";

export async function entryStockFn() {
  const { claims } = useAuthStore.getState() 
   
  if (!claims){
    throw new Error();
  }
  const response = await get<StockEntry[]>(ENDPOINT.stockEntry.detail(1));
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostEntry(data: InventoryDetail) {
  const response = await post<InventoryDetail>(ENDPOINT.stockEntry.info, data);
  console.log(response,"post")
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostAdjustment(data: Adjustment) {
  const response = await post<InventoryDetail>(ENDPOINT.stockEntry.adjustment, data);
  console.log(response,"post")
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}