import { DeleteAddress, DeleteUser, PostAddress, PostUser, PutAddress, PutUser, rolesFn, userFn } from "@/src/service/user/user.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () => {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["users"],
    queryFn: userFn,
  });

  const post = useMutation({
    mutationFn: PostUser,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const put = useMutation({
    mutationFn: PutUser,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const remove = useMutation({
    mutationFn: DeleteUser,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const postAddress = useMutation({
    mutationFn: PostAddress,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const putAddress = useMutation({
    mutationFn: PutAddress,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
  
  const removeAddress = useMutation({
    mutationFn: DeleteAddress,
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const {data: roleData, isLoading:isLoadingData } = useQuery({
    queryKey: ["role"],
    queryFn: rolesFn,
  });

  return { data, isLoading, post, put, remove, postAddress, putAddress, removeAddress, roleData, isLoadingData };
};