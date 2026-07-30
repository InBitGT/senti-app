import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    Warehouse,
    WarehousePayload,
} from "@/src/types/warehouse/warehouse.types";

export async function warehouseFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<Warehouse[]>(
    ENDPOINT.warehouse.detail(claims?.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostWarehouse(data: WarehousePayload) {
  const response = await post<WarehousePayload>(ENDPOINT.warehouse.info, data);
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutWarehouse({
  id,
  data,
}: {
  id: number;
  data: WarehousePayload;
}) {
  const response = await put<WarehousePayload>(
    ENDPOINT.warehouse.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteWarehouse(IdCategorie: string | number) {
  const response = await remove<WarehousePayload>(
    ENDPOINT.warehouse.info + "/" + IdCategorie,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
