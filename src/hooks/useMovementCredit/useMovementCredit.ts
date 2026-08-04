import { MovementCreditFn } from "@/src/service/movement_credit/movement_credit";
import { useQuery } from "@tanstack/react-query";

export const useMovementCredit = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["movement-credit"],
    queryFn: MovementCreditFn,
  });

  return { data, isLoading };
};
