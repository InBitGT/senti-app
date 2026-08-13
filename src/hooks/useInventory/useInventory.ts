import { inventoryStockSummaryFn } from "@/src/service/inventory/inventory";
import { useQuery } from "@tanstack/react-query";

export function useInventory(warehouseId?: string | number) {
  const normalizedId =
    warehouseId === undefined || warehouseId === null
      ? ""
      : String(warehouseId);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["inventory-stock-summary", normalizedId],
    queryFn: () => inventoryStockSummaryFn(normalizedId),
    enabled: normalizedId !== "" && normalizedId !== "0",
    refetchOnMount: "always",
    placeholderData: undefined,
  });

  return { data, isLoading: isLoading || isFetching, error };
}
