import { DeleteMenuItem, menuItemsFn, PostMenuItem, PutMenuItem } from "@/src/service/menu_item/Menu_item.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMenuItem = () => {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["ingredient"],
    queryFn: menuItemsFn,
  });

  const post = useMutation({
    mutationFn: PostMenuItem,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
    },
  });

  const put = useMutation({
    mutationFn: PutMenuItem,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteMenuItem,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
    },
  });

  return { data, isLoading, post, put, remove };
};