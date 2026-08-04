import {
    DeleteWarehouseZone,
    PostWarehouseZone,
    PutWarehouseZone,
    warehouseZoneFn,
} from "@/src/service/warehouse_zone/warehouse_zone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWarehouseZone = (warehouseId?: string | number) => {
  const queryClient = useQueryClient();
  const queryKey = ["warehouse-zones", warehouseId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => warehouseZoneFn(warehouseId ?? ""),
    enabled:
      warehouseId !== undefined && warehouseId !== 0 && warehouseId !== "",
  });

  const post = useMutation({
    mutationFn: PostWarehouseZone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const put = useMutation({
    mutationFn: PutWarehouseZone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: DeleteWarehouseZone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { data, isLoading, post, put, remove };
};
