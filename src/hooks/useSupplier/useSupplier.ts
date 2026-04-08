import { DeleteSupplier, PostSupplier, PutSupplier, SupplierFn } from "@/src/service/supplier/supplier.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSupplier = () => {
  const queryClient = useQueryClient();

  const supplier = useQuery({
    queryKey: ["supplier"],
    queryFn: SupplierFn,
  });

  const post = useMutation({
    mutationFn: PostSupplier,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
  });

  const put = useMutation({
    mutationFn: PutSupplier,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteSupplier,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
  });

  return { supplier, post, put, remove };
};