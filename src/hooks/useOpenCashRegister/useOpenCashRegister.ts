import { OpenCashRegisterFn } from "@/src/service/cash_register_session/cash_register_session";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useOpenCashRegister = () => {
  const queryClient = useQueryClient();

  const openCashRegister = useMutation({
    mutationFn: OpenCashRegisterFn,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pos-catalog"] });
    },
  });

  return { openCashRegister };
};
