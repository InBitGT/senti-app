import { CashMovementFn } from "@/src/service/cash_register_session/cash_register_session";
import { useMutation } from "@tanstack/react-query";

export const useCashMovement = () => {
  const cashMovement = useMutation({
    mutationFn: CashMovementFn,
  });

  return { cashMovement };
};
