import {
  RecipeCatalogFn,
  RecipeCheckoutFn,
} from "@/src/service/recipe_pos/recipe_pos";
import { useVaucherStore } from "@/src/store/useVaucherStore/useVaucherStore";
import { RecipeCheckoutPayload } from "@/src/types/recipe_pos/recipe_pos";
import { Vaucher } from "@/src/types/vaucher/vaucher";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const RECIPE_POS_CATALOG_KEY = ["recipe-pos-catalog"];

export function useRecipeCatalog() {
  const { setOrder } = useVaucherStore();
  const queryClient = useQueryClient();

  const {
    data: catalog,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: RECIPE_POS_CATALOG_KEY,
    queryFn: RecipeCatalogFn,
  });

  const checkout = useMutation<
    Vaucher | undefined,
    Error,
    RecipeCheckoutPayload
  >({
    mutationFn: RecipeCheckoutFn,
    onSuccess: (data) => {
      if (!data) return;
      setOrder(data);
      [
        RECIPE_POS_CATALOG_KEY,
        ["credit"],
        ["loan-payments"],
        ["customers"],
        ["fiscal-documents"],
      ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
  });

  return { catalog, isError, isLoading, refetch, checkout };
}
