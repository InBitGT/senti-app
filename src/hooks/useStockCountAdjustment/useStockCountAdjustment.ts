import {
  ApprovedStockCountAdjustment,
  PostStockCountAdjustment,
  StockCountAdjusmentFn,
} from "@/src/service/stock_count_adjustment/stock_count_adjustment.services";
import {
  ApprovedType,
  StatusAdjustmentStock,
  StatusAdjustmentStockSelect,
} from "@/src/types/stock_adjustment/stock_adjustment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStockCounAdjustment = (
  warehouseId?: string | number,
  status?: StatusAdjustmentStockSelect,
) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stock-adjusment-count", warehouseId, status],
    queryFn: () =>
      StockCountAdjusmentFn(
        warehouseId ? warehouseId : "",
        status ? status : StatusAdjustmentStockSelect.PENDING,
      ),
    enabled:
      warehouseId !== undefined && warehouseId !== 0 && warehouseId !== "",
  });

  const post = useMutation({
    mutationFn: PostStockCountAdjustment,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["stock-adjusment-count", warehouseId],
      });
    },
  });
  const approve = useMutation({
    mutationFn: ({
      adjusmentCountId,
      data,
      status,
    }: {
      adjusmentCountId: number;
      data: ApprovedType;
      status: StatusAdjustmentStock;
    }) => ApprovedStockCountAdjustment(adjusmentCountId, data, status),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["stock-adjusment-count", warehouseId, status],
      });
    },
  });

  return { data, isLoading, post, approve };
};
