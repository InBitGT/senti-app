import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { Category, CategoryDetail } from "@/src/types";

export async function categorieFn() {
  const { claims } = useAuthStore.getState()  
  if (!claims){
    throw new Error();
  }
  const response = await get<Category[]>(ENDPOINT.categorie.detail(claims?.tenant_id));
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function PostCategorie(data: CategoryDetail) {
  const response = await post<CategoryDetail>(ENDPOINT.categorie.info, data);
  console.log(response,"post")
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function PutCategorie({id, data}:{id: number,data: CategoryDetail}) {
  const response = await put<CategoryDetail>(ENDPOINT.categorie.info+"/"+id, data);
  console.log(response,"put")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteCategorie(IdCategorie: string | number) {
  const response = await remove<CategoryDetail>(ENDPOINT.categorie.info+"/"+ IdCategorie);
  console.log(response,"remove")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}