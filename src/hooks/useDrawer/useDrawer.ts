import { drawerFn } from "@/src/service";
import { Module } from "@/src/types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

interface Props {
  drawer: UseMutationResult<Module[] | undefined, Error, string | number, unknown>;
}

export const useDrawer = (): Props => {
  const drawer = useMutation({
    mutationFn: drawerFn,
    onSuccess: async (data) => {
      return data;
    },
    onError: async (error) => {
      console.log(error);
    },
  });

  return { drawer };
};