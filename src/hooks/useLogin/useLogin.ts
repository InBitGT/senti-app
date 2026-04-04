import { loginFn, logoutFn } from '@/src/service';
import { useAuthStore } from '@/src/store';
import { LoginCredentials, LoginResponse } from '@/src/types';
import store from '@/src/utils';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCustomToast } from '../useCustomToast';

interface Props {
  login: UseMutationResult<LoginResponse | undefined, Error, LoginCredentials>;
  logout: UseMutationResult<LoginResponse | undefined, Error, number>;

}

export const useLogin = (): Props => {
  const router = useRouter();
  const { showToast } = useCustomToast();
  const { setClaims, clearClaims } = useAuthStore.getState();
    
  const login = useMutation({
    mutationFn: loginFn,
    onSuccess: async (data) => {
      if (!data?.access_token) {
        console.log("No token received"); 
        return;
      }
      setClaims(data.access_token);
      await Promise.all([
        store.save({ name: 'access_token', value: data.access_token }),
        store.save({ name: 'refresh_token', value: data.refresh_token }),
        store.save({ name: 'expires_in', value: String(data.expires_in) }),
      ]);
      showToast({message: "Bienvenido", type:"success"})
      router.replace("/(drawer)/explore");
    },
    onError: async (error) => {
      console.log(error);
    },
  });


  const logout = useMutation({
    mutationFn: logoutFn,
    onSuccess: async ()=>{
      clearClaims()
      await Promise.all([
        store.remove({ name: 'access_token' }),
        store.remove({ name: 'refresh_token' }),
        store.remove({ name: 'expires_in' }),
      ]);
    },
    onError: async (error)=>{
      console.log(error);
    }
  })

  return { login , logout};
};