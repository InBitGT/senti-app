import { MovementFn } from "@/src/service/movement/movement.services";
import { useQuery } from "@tanstack/react-query";

export const useMovement = () => {

  const {data, isLoading} = useQuery({
    queryKey: ["stock"],
    queryFn: MovementFn,
  });

  return { data, isLoading };
};