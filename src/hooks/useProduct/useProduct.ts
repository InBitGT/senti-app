import {
  DeleteIngredient,
  PostIngredient,
  productByTypeFn,
  PutIngredient,
} from "@/src/service/product/product.services";
import { StockProductType } from "@/src/types/product/product.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PRODUCT_KEY = "ingredient";

/**
 * Productos por tipo. Por defecto "finished_product" (producto final),
 * como antes; con "ingredient" trae los ingredientes.
 */
export const useProduct = (type: StockProductType = "finished_product") => {
  const queryClient = useQueryClient();

  // Invalida todas las listas (producto final e ingrediente).
  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] });

  const { data, isLoading } = useQuery({
    queryKey: [PRODUCT_KEY, type],
    queryFn: () => productByTypeFn(type),
    retry: 3,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const post = useMutation({
    mutationFn: PostIngredient,
    onSuccess: invalidate,
  });

  const put = useMutation({
    mutationFn: PutIngredient,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: DeleteIngredient,
    onSuccess: invalidate,
  });

  return { data, isLoading, post, put, remove };
};
