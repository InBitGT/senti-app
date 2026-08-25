import { DeleteIngredient, PostIngredient, productIngredientFn, PutIngredient } from "@/src/service/product/product.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProduct = () => {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["ingredient"],
    queryFn: productIngredientFn,
    retry: 3,
    refetchOnMount: true,
    staleTime: 0,        
    gcTime: 0
  });

  const post = useMutation({
    mutationFn: PostIngredient,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
    },
  });

  const put = useMutation({
    mutationFn: PutIngredient,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteIngredient,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
    },
  });

  return { data, isLoading, post, put, remove };
};