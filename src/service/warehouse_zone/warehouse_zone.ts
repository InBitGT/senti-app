import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import {
    CreateWarehouseZone,
    WarehouseZone,
} from "@/src/types/warehouse_zone/warehouse_zone";

export async function warehouseZoneFn(warehouseId: string | number) {
  const response = await get<WarehouseZone[]>(
    ENDPOINT.warehouse_zone.detail(warehouseId),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostWarehouseZone(data: CreateWarehouseZone) {
  const response = await post<CreateWarehouseZone>(
    ENDPOINT.warehouse_zone.info,
    data,
  );
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutWarehouseZone({
  id,
  data,
}: {
  id: number;
  data: WarehouseZone;
}) {
  const response = await put<WarehouseZone>(
    ENDPOINT.warehouse_zone.info + "/" + id,
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteWarehouseZone(IdData: string | number) {
  const response = await remove<WarehouseZone>(
    ENDPOINT.warehouse_zone.info + "/" + IdData,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
