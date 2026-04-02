import { loginFn } from '@/src/service';
import { LoginCredentials, LoginResponse } from '@/src/types';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

interface Props {
  login: UseMutationResult<LoginResponse | undefined, Error, LoginCredentials>;
}

export const useLogin = (): Props => {
      const router = useRouter();
    
  const login = useMutation({
    mutationFn: loginFn,
   onSuccess: async (data) => {
  if (!data?.access_token) {
    console.log("No token received"); 
    return;
  }
  console.log("Token:", data.access_token); 
//   await store.save({ name: 'auth_token', value: data.access_token });
  router.replace("/(drawer)/explore");
},
    onError: async (error) => {
      console.log(error);
    },
  });

  return { login };
};