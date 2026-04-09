import { StockFn } from "@/src/service/inventory_stock/inventory_stock.services";
import { useQuery } from "@tanstack/react-query";

export const useInventoryStock = () => {

  const {data, isLoading} = useQuery({
    queryKey: ["stock"],
    queryFn: StockFn,
  });

  return { data, isLoading };
};