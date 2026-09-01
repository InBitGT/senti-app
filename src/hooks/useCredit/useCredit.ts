import {
  creditFn,
  DeleteCustomerCredit,
  PostCustomerCredit,
  PreviousCustomerCredit,
  PutCustomerCredit,
} from "@/src/service/credit/credit";
import { CreatePreviousCredit } from "@/src/types/credit/credit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["credit"];

export function useCredit() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: creditFn,
  });

  const post = useMutation({
    mutationFn: PostCustomerCredit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const put = useMutation({
    mutationFn: PutCustomerCredit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: DeleteCustomerCredit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const previousCredit = useMutation({
    mutationFn: ({
      data,
      idCustomer,
    }: {
      data: CreatePreviousCredit;
      idCustomer: number;
    }) => PreviousCustomerCredit(data, idCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["loan-payments"] });
      queryClient.invalidateQueries({ queryKey: ["movement-credit"] });
    },
  });

  return { data, isLoading, post, put, remove, previousCredit };
}
