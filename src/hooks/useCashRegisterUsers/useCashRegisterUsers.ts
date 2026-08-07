import { CashRegisterUserFn } from "@/src/service/cash_register_users/cash_register_users";
import { useQuery } from "@tanstack/react-query";

export const useCashRegisterUsers = () => {
  const tenantUsers = useQuery({
    queryKey: ["tenant-users"],
    queryFn: CashRegisterUserFn,
  });

  return { tenantUsers };
};
