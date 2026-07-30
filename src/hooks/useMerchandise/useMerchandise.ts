import {
    DeleteMerchandise,
    merchandiseFn,
    PostMerchandise,
    PutMerchandise,
} from "@/src/service/merchandise/merchandise";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMerchandise = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["merchandise"],
    queryFn: merchandiseFn,
    retry: 3,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const post = useMutation({
    mutationFn: PostMerchandise,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["merchandise"] });
    },
  });

  const put = useMutation({
    mutationFn: PutMerchandise,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["merchandise"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteMerchandise,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["merchandise"] });
    },
  });

  return { data, isLoading, post, put, remove };
};
