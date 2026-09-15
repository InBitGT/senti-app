import {
  entryStockByIDFn,
  entryStockFn,
  PostAdjustment,
  PostEntry,
} from "@/src/service/entry_stock/entry_stock.services";
import { useEntryStockStore } from "@/src/store/useEntryStockStore/useEntryStockStore";
import { EntryStockDetail } from "@/src/types/entry_stock/entry_stock.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useEntryStock = (idRegister?: string | number) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["entry_stock"],
    queryFn: entryStockFn,
  });

  const post = useMutation({
    mutationFn: PostEntry,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["entry_stock"] });
      queryClient.invalidateQueries({ queryKey: ["merchandise"] });
      queryClient.invalidateQueries({ queryKey: ["pos-catalog"] });
    },
  });

  const postAdjustment = useMutation({
    mutationFn: PostAdjustment,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["entry_stock"] });
      queryClient.invalidateQueries({ queryKey: ["merchandise"] });
      queryClient.invalidateQueries({ queryKey: ["pos-catalog"] });
    },
  });

  const { data: dataRegister, isLoading: isLoadingRegister } = useQuery({
    queryKey: ["entry_stock", idRegister],
    queryFn: () => entryStockByIDFn(idRegister ?? ""),
    enabled: idRegister !== undefined && idRegister !== 0 && idRegister !== "",
  });

  return {
    data,
    isLoading,
    post,
    postAdjustment,
    dataRegister,
    isLoadingRegister,
  };
};

export const useEntryStockDetail = () => {
  const selectedId = useEntryStockStore((s) => s.selectedId);

  const { data, isLoading } = useQuery<EntryStockDetail | undefined, Error>({
    queryKey: ["entry_stock", "detail", selectedId],
    queryFn: () => entryStockByIDFn(selectedId ?? ""),
    enabled: selectedId !== undefined && selectedId !== 0,
  });

  return { data, isLoading };
};
