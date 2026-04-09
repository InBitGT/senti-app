import { profileAddressUpdateFn, profileUserInfoFn, profileUserUpdatefoFn } from "@/src/service";
import { useProfileStore } from "@/src/store";
import { UpdateAddress, UserInfo, UserUpdate } from "@/src/types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useCustomToast } from "../useCustomToast";

interface Props {
  userInfo: UseMutationResult<UserInfo | undefined, Error, string | number, unknown>;
  updateUser: UseMutationResult<UserInfo | undefined, Error, { idUser: string | number; data: UserUpdate; }, unknown>
  updateAddress: UseMutationResult<UserInfo | undefined, Error, { idAddress: string | number; data: UpdateAddress; }>
}

export const useProfile = (): Props => {
  const { setUser, user } = useProfileStore()
    const { showToast } = useCustomToast();
  
  const userInfo = useMutation({
    mutationFn: profileUserInfoFn,
    onSuccess: async (data) => {
      if(!data) return
      setUser(data)
      return data;
    },
    onError: async (error) => {
      console.log(error);
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ idUser, data }: { idUser: string | number; data: UserUpdate }) =>
    profileUserUpdatefoFn(idUser, data),
    onSuccess: async () => {
        if(!user) return
        userInfo.mutate(user?.id)
        showToast({ message: "Información actualizada correctamente.", type: "success" })
        return 
     },
    onError: async (error) => {
      showToast({ message: "No se pudo actualizar tu información. Intenta de nuevo.", type: "error" })
        console.log(error)
    },
   })

   const updateAddress = useMutation({
    mutationFn: ({ idAddress, data }: { idAddress: string | number; data: UpdateAddress }) =>
    profileAddressUpdateFn(idAddress, data),
    onSuccess: async () => {
        if(!user) return
        userInfo.mutate(user?.id)
        showToast({ message: "Información actualizada correctamente.", type: "success" })
        return 
    },
    onError: (error) => {
      showToast({ message: "No se pudo actualizar tu dirección. Intenta de nuevo.", type: "error" })
      console.log(error)
    },
   })

  return { userInfo, updateUser, updateAddress };
};