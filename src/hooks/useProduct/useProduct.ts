import { DeleteIngredient, PostIngredient, productIngredientFn, PutIngredient } from "@/src/service/product/product.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProduct = (queryKey = "ingredient") => {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: [queryKey],
    queryFn: productIngredientFn,
    retry: 3,
  staleTime: 0,        
  gcTime: 0
  });

  const post = useMutation({
    mutationFn: PostIngredient,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const put = useMutation({
    mutationFn: PutIngredient,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteIngredient,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return { data, isLoading, post, put, remove };
};