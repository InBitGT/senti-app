import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { Module } from "@/src/types";
import store from "@/src/utils";

export async function drawerFn(idRol: string | number) {
  const token = await store.get({ name: "access_token" }) ?? undefined;
  const response = await get<Module[]>(ENDPOINT.drawer.detail(idRol), token);
   
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
