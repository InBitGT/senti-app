import { entryStockFn, PostAdjustment, PostEntry } from "@/src/service/entry_stock/entry_stock.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useEntryStock = () => {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["entry_stock"],
    queryFn: entryStockFn,
  });

  const post = useMutation({
    mutationFn: PostEntry,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["entry_stock"] });
    },
  });

  const postAdjustment = useMutation({
    mutationFn: PostAdjustment,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["entry_stock"] });
    },
  });

  return { data, isLoading, post, postAdjustment };
};