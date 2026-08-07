import {
    cashRegisterFn,
    DeleteCashRegister,
    PostCashRegister,
    PutCashRegister,
} from "@/src/service/cash_register/cash_register";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CASH_REGISTER_KEY = ["cash-registers"];

export function useCashRegister() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: CASH_REGISTER_KEY,
    queryFn: cashRegisterFn,
  });

  const post = useMutation({
    mutationFn: PostCashRegister,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY }),
  });

  const put = useMutation({
    mutationFn: PutCashRegister,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY }),
  });

  const remove = useMutation({
    mutationFn: DeleteCashRegister,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY }),
  });

  return { data, isLoading, post, put, remove };
}
