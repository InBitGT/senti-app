import {
  DeleteRecipe,
  PostRecipe,
  PutRecipe,
  recipeFn,
} from "@/src/service/recipe/recipe.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const RECIPE_KEY = ["recipes"];

export function useRecipe() {
  const queryClient = useQueryClient();

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: RECIPE_KEY });

  const { data, isLoading } = useQuery({
    queryKey: RECIPE_KEY,
    queryFn: recipeFn,
  });

  const post = useMutation({
    mutationFn: PostRecipe,
    onSuccess: invalidate,
  });

  const put = useMutation({
    mutationFn: PutRecipe,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: DeleteRecipe,
    onSuccess: invalidate,
  });

  return { data, isLoading, post, put, remove };
}
