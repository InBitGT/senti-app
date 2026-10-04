import {
    DeleteIngredient,
    ingredientFn,
    PostIngredient,
    PutIngredient,
} from "@/src/service/ingredient/ingredient.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const INGREDIENT_KEY = ["ingredients"];

export function useIngredient() {
  const queryClient = useQueryClient();

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: INGREDIENT_KEY });

  const { data, isLoading } = useQuery({
    queryKey: INGREDIENT_KEY,
    queryFn: ingredientFn,
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
}
