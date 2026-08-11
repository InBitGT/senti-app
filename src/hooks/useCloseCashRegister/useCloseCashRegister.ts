import { CloseCashRegisterFn } from "@/src/service/cash_register_session/cash_register_session";
import { useCashVoucherStore } from "@/src/store/useCashVoucher/useCashVoucher";
import {
  CashVoucher,
  CloseCashRegisterPayload,
} from "@/src/types/cash_register/cash_register";
import { useMutation } from "@tanstack/react-query";

export const useCloseCashRegister = () => {
  const { setData } = useCashVoucherStore();
  const closeCashRegister = useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: CloseCashRegisterPayload;
    }) => CloseCashRegisterFn(sessionId, payload),
    onSuccess: (data: CashVoucher) => {
      setData(data);
    },
  });

  return { closeCashRegister };
};
