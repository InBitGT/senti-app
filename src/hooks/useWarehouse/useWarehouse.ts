import {
    DeleteWarehouse,
    PostWarehouse,
    PutWarehouse,
    warehouseFn,
} from "@/src/service/warehouse/warehouse.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWarehouse = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["warehouse"],
    queryFn: warehouseFn,
    retry: 3,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const post = useMutation({
    mutationFn: PostWarehouse,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
    },
  });

  const put = useMutation({
    mutationFn: PutWarehouse,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteWarehouse,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
    },
  });

  return { data, isLoading, post, put, remove };
};
