import { CloseCashRegisterFn } from "@/src/service/cash_register_session/cash_register_session";
import { CloseCashRegisterPayload } from "@/src/types/cash_register/cash_register";
import { useMutation } from "@tanstack/react-query";

export const useCloseCashRegister = () => {
  const closeCashRegister = useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: CloseCashRegisterPayload;
    }) => CloseCashRegisterFn(sessionId, payload),
  });

  return { closeCashRegister };
};
