import { CashRegisterSessionFn } from "@/src/service/cash_register_session/cash_register_session";
import { useQuery } from "@tanstack/react-query";

export const useCashRegisterSession = () => {
  const session = useQuery({
    queryKey: ["cash-register-session"],
    queryFn: CashRegisterSessionFn,
  });

  return { session };
};
