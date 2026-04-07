import { categorieFn, DeleteCategorie, PostCategorie, PutCategorie } from "@/src/service";
import { Category, CategoryDetail } from "@/src/types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

interface Props {
  categorie: UseMutationResult<Category[] | undefined, Error, void, unknown>;
  post: UseMutationResult<CategoryDetail | undefined, Error, CategoryDetail, unknown>;
  put: UseMutationResult<CategoryDetail | undefined, Error, CategoryDetail, unknown>;
  remove: UseMutationResult<CategoryDetail | undefined, Error, string | number, unknown>; 
}

export const useCategorie = ():Props => {

  const categorie = useMutation({
    mutationFn: categorieFn,
    onSuccess: async (data) => {
      if(!data) return
      return data;
    },
    onError: async (error) => {
      console.log(error);
    },
  });

  const post = useMutation({
    mutationFn: PostCategorie,
    onSuccess: async () => {
      categorie.mutate()
    },
    onError: async (error) => {
      console.log(error);
    },
  });
  const put = useMutation({
    mutationFn: PutCategorie,
    onSuccess: async () => {
        categorie.mutate()
    },
    onError: async (error) => {
      console.log(error);
    },
  });
  const remove = useMutation({
    mutationFn: DeleteCategorie,
    onSuccess: async () => {
      categorie.mutate()
    },
    onError: async (error) => {
      console.log(error);
    },
  });
  return { categorie, post, put, remove }
}

