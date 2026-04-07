import { categorieFn, DeleteCategorie, PostCategorie, PutCategorie } from "@/src/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCategorie = () => {
  const queryClient = useQueryClient();

  const categorie = useQuery({
    queryKey: ["categories"],
    queryFn: categorieFn,
  });

  const post = useMutation({
    mutationFn: PostCategorie,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const put = useMutation({
    mutationFn: PutCategorie,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteCategorie,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return { categorie, post, put, remove };
};