import { loginFn } from '@/src/service';
import { LoginCredentials, LoginResponse } from '@/src/types';
import store from '@/src/utils';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCustomToast } from '../useCustomToast';

interface Props {
  login: UseMutationResult<LoginResponse | undefined, Error, LoginCredentials>;
}

export const useLogin = (): Props => {
  const router = useRouter();
  const { showToast } = useCustomToast();
    
  const login = useMutation({
    mutationFn: loginFn,
    onSuccess: async (data) => {
      if (!data?.access_token) {
        console.log("No token received"); 
        return;
      }
      await store.save({ name: 'auth_token', value: data.access_token });
      showToast({message: "Bienvenido", type:"success"})
      router.replace("/(drawer)/explore");
    },
    onError: async (error) => {
      console.log(error);
    },
  });

  return { login };
};