import {
    DeleteServiceProduct,
    PostServiceProduct,
    PutServiceProduct,
    serviceProductFn,
} from "@/src/service/service_product/service_product.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SERVICE_PRODUCT_KEY = ["service-products"];

export function useServiceProduct() {
  const queryClient = useQueryClient();

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: SERVICE_PRODUCT_KEY });

  const { data, isLoading } = useQuery({
    queryKey: SERVICE_PRODUCT_KEY,
    queryFn: serviceProductFn,
  });

  const post = useMutation({
    mutationFn: PostServiceProduct,
    onSuccess: invalidate,
  });

  const put = useMutation({
    mutationFn: PutServiceProduct,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: DeleteServiceProduct,
    onSuccess: invalidate,
  });

  return { data, isLoading, post, put, remove };
}
