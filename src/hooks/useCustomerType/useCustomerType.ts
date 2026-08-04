import {
    customerTypeFn,
    DeleteCustomerType,
    PostCustomerType,
    PutCustomerType,
} from "@/src/service/customer_type/customer_type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CUSTOMER_TYPE_KEY = ["customer-types"];

export function useCustomerType() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: CUSTOMER_TYPE_KEY,
    queryFn: customerTypeFn,
  });

  const post = useMutation({
    mutationFn: PostCustomerType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CUSTOMER_TYPE_KEY }),
  });

  const put = useMutation({
    mutationFn: PutCustomerType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CUSTOMER_TYPE_KEY }),
  });

  const remove = useMutation({
    mutationFn: DeleteCustomerType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CUSTOMER_TYPE_KEY }),
  });

  return { data, isLoading, post, put, remove };
}
