import {
    DeleteProductWholesale,
    PostProductWholesale,
    productWholesaleFn,
    PutProductWholesale,
} from "@/src/service/wholesale/wholesale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PRODUCT_WHOLESALE_KEY = ["product-wholesale-rules"];

export function useProductWholesale() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: PRODUCT_WHOLESALE_KEY,
    queryFn: productWholesaleFn,
  });

  const post = useMutation({
    mutationFn: PostProductWholesale,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_WHOLESALE_KEY }),
  });

  const put = useMutation({
    mutationFn: PutProductWholesale,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_WHOLESALE_KEY }),
  });

  const remove = useMutation({
    mutationFn: DeleteProductWholesale,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_WHOLESALE_KEY }),
  });

  return { data, isLoading, post, put, remove };
}
