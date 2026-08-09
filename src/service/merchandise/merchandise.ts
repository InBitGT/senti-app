import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  Merchandise,
  MerchandiseDetail,
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

export async function PostMerchandise(data: MerchandiseDetail) {
  const response = await post<MerchandiseDetail>(
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
  data: MerchandiseDetail;
}) {
  const response = await put<MerchandiseDetail>(
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
  const response = await remove<MerchandiseDetail>(
    ENDPOINT.merchandise.info + "/" + IdCategorie,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
