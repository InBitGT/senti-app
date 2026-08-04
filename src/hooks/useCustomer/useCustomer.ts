import {
  customerFn,
  DeleteCustomer,
  PostCustomer,
  PutCustomer,
} from "@/src/service/customer/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["customers"];

export function useCustomer() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: customerFn,
  });

  const post = useMutation({
    mutationFn: PostCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const put = useMutation({
    mutationFn: PutCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: DeleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return { data, isLoading, post, put, remove };
}
