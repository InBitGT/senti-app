import { inventoryStockSummaryFn } from "@/src/service/inventory/inventory";
import { useQuery } from "@tanstack/react-query";

export function useInventory(warehouseId?: string | number) {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory-stock-summary", warehouseId],
    queryFn: () => inventoryStockSummaryFn(warehouseId ?? ""),
    enabled:
      warehouseId !== undefined && warehouseId !== 0 && warehouseId !== "",
  });

  return { data, isLoading };
}
