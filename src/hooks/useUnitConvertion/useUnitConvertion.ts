import { PostUnitConversion } from "@/src/service/unit_conversion/unit_conversion.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUnitConversion = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    mutationFn: PostUnitConversion,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversion"] });
    },
  });

  return { post };
};
