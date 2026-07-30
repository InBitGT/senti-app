import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CreateMerchandise,
  Merchandise,
} from "@/src/types/merchandise/merchandise.types";

export async function merchandiseFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<Merchandise[]>(
    ENDPOINT.merchandise.detail(claims?.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostMerchandise(data: CreateMerchandise) {
  const response = await post<CreateMerchandise>(
    ENDPOINT.merchandise.info,
    data,
  );
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutMerchandise({
  id,
  data,
}: {
  id: number;
  data: CreateMerchandise;
}) {
  const response = await put<CreateMerchandise>(
    ENDPOINT.merchandise.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteMerchandise(IdCategorie: string | number) {
  const response = await remove<CreateMerchandise>(
    ENDPOINT.merchandise.info + "/" + IdCategorie,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
