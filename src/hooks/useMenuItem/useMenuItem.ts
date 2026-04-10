import { DeleteMenuItem, menuItemsFn, PostMenuItem, PutMenuItem } from "@/src/service/menu_item/Menu_item.services";
import { productIngredientFn } from "@/src/service/product/product.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMenuItem = () => {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["menuItem"],
    queryFn: menuItemsFn,
  });

  const {data:dataIngredient, isLoading: loader} = useQuery({
    queryKey: ["menuItem-ingredient"],
    queryFn: productIngredientFn,
    retry: 3,
  });

  const post = useMutation({
    mutationFn: PostMenuItem,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["menuItem"] });
    },
  });

  const put = useMutation({
    mutationFn: PutMenuItem,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["menuItem"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteMenuItem,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["menuItem"] });
    },
  });

  return { data, isLoading, post, put, remove, dataIngredient, loader };
};