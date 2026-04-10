import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { MenuItem, MenuItemDetail } from "@/src/types/menuItem/menuItem.types";

export async function menuItemsFn() {
  const { claims } = useAuthStore.getState()  
  if (!claims){
    throw new Error();
  }
  const response = await get<MenuItem[]>(ENDPOINT.menuItem.detail(claims?.tenant_id));
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function PostMenuItem(data: MenuItemDetail) {
  const response = await post<MenuItemDetail>(ENDPOINT.menuItem.info, data);
  console.log(response,"post")
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function PutMenuItem({id, data}:{id: number,data: MenuItemDetail}) {
  const response = await put<MenuItemDetail>(ENDPOINT.menuItem.info+"/"+id, data);
  console.log(response,"put")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteMenuItem(IdCategorie: string | number) {
  const response = await remove<MenuItemDetail>(ENDPOINT.menuItem.info+"/"+ IdCategorie);
  console.log(response,"remove")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}