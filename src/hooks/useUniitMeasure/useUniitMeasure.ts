import {
    DeleteUnitMeasure,
    PostUnitMeasure,
    PutUnitMeasure,
    UnitMeasureFn,
} from "@/src/service/unit_measure/unit_measure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUnit = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["unit-measure"],
    queryFn: UnitMeasureFn,
  });

  const post = useMutation({
    mutationFn: PostUnitMeasure,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["unit-measure"] });
    },
  });

  const put = useMutation({
    mutationFn: PutUnitMeasure,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["unit-measure"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteUnitMeasure,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["unit-measure"] });
    },
  });

  return { data, isLoading, post, put, remove };
};
