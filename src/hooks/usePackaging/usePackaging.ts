import {
  DeletePackaging,
  packagingFn,
  PostPackaging,
  PutPackaging,
} from "@/src/service/packaging/packaging.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PACKAGING_KEY = ["packagings"];

export function usePackaging() {
  const queryClient = useQueryClient();

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: PACKAGING_KEY });

  const { data, isLoading } = useQuery({
    queryKey: PACKAGING_KEY,
    queryFn: packagingFn,
  });

  const post = useMutation({
    mutationFn: PostPackaging,
    onSuccess: invalidate,
  });

  const put = useMutation({
    mutationFn: PutPackaging,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: DeletePackaging,
    onSuccess: invalidate,
  });

  return { data, isLoading, post, put, remove };
}
