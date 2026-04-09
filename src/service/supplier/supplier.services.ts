import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { SupplierDetail } from "@/src/types/supplier/supplier.types";

export async function SupplierFn() {
  const { claims } = useAuthStore.getState()  
  if (!claims){
    throw new Error();
  }
  const response = await get<SupplierDetail[]>(ENDPOINT.supplier.info);
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function PostSupplier(data: SupplierDetail) {
  const response = await post<SupplierDetail>(ENDPOINT.supplier.info, data);
  console.log(response,"post")
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function PutSupplier({id, data}:{id: number,data: SupplierDetail}) {
  const response = await put<SupplierDetail>(ENDPOINT.supplier.info+"/"+id, data);
  console.log(response,"put")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteSupplier(IdCategorie: string | number) {
  const response = await remove<SupplierDetail>(ENDPOINT.supplier.info+"/"+ IdCategorie);
  console.log(response,"remove")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}