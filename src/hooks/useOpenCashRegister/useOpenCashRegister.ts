import { OpenCashRegisterFn } from "@/src/service/cash_register_session/cash_register_session";
import { useMutation } from "@tanstack/react-query";

export const useOpenCashRegister = () => {
  const openCashRegister = useMutation({
    mutationFn: OpenCashRegisterFn,
  });

  return { openCashRegister };
};
