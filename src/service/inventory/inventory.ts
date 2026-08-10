import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { InventoryStockItem } from "@/src/types/inventory/inventory";

export async function inventoryStockSummaryFn(warehouseId: string | number) {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  const response = await get<InventoryStockItem[]>(
    ENDPOINT.invenrtory.detail(claims.tenant_id, warehouseId),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
