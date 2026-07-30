import {
  PostStockCount,
  ProductStockCountFn,
  StockCountFn,
} from "@/src/service/stock_count/stock_count.services";
import { useStockCountStore } from "@/src/store/useStockCountStore/useStockCountStore";
import {
  DataResponse,
  StockCount,
} from "@/src/types/stock_count/stock_count.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStockCount = (warehouseId?: string | number) => {
  const queryClient = useQueryClient();
  const { setData } = useStockCountStore();

  const { data, isLoading } = useQuery({
    queryKey: ["stock-count", warehouseId],
    queryFn: () => StockCountFn(warehouseId as string | number),
    enabled:
      warehouseId !== undefined && warehouseId !== 0 && warehouseId !== "",
  });

  const post = useMutation<DataResponse, Error, StockCount>({
    mutationFn: PostStockCount,
    onSuccess: async (data: DataResponse) => {
      queryClient.invalidateQueries({ queryKey: ["stock-count", warehouseId] });
      setData(data);
    },
  });

  const { data: dataProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["stock-products", warehouseId],
    queryFn: () => ProductStockCountFn(warehouseId as string | number),
    enabled:
      warehouseId !== undefined && warehouseId !== 0 && warehouseId !== "",
  });

  return { data, isLoading, post, dataProduct, isLoadingProduct };
};
