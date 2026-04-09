import { drawerFn } from "@/src/service";
import { useDrawerStore } from "@/src/store";
import { Module } from "@/src/types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

interface Props {
  drawer: UseMutationResult<Module[] | undefined, Error, string | number, unknown>;
}

export const useDrawer = (): Props => {
  const { setModule } = useDrawerStore.getState()
  const drawer = useMutation({
    mutationFn: drawerFn,
    onSuccess: async (data) => {
      if(!data) return
      setModule(data)
      return data;
    },
    onError: async (error) => {
      console.log(error);
    },
  });

  return { drawer };
};