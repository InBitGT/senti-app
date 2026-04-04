import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { Module } from "@/src/types";

export async function drawerFn(idRol: string | number) {
  const response = await get<Module[]>(ENDPOINT.drawer.detail(idRol));
   
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
