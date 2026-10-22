import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  PrepStation,
  PrepStationDetail,
} from "@/src/types/prep_station/prep_station.types";

export async function prepStationFn(): Promise<PrepStation[] | undefined> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error("Sesión no válida");
  }

  const response = await get<PrepStation[]>(
    ENDPOINT.prepStation.detail(claims.tenant_id),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostPrepStation(
  data: PrepStationDetail,
): Promise<PrepStation | undefined> {
  const response = await post<PrepStation, PrepStationDetail>(
    ENDPOINT.prepStation.info,
    data,
  );

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutPrepStation({
  id,
  data,
}: {
  id: number;
  data: PrepStationDetail;
}): Promise<PrepStation | undefined> {
  const response = await put<PrepStation, PrepStationDetail>(
    ENDPOINT.prepStation.update(id),
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeletePrepStation(
  idPrepStation: string | number,
): Promise<PrepStation | undefined> {
  const response = await remove<PrepStation>(
    ENDPOINT.prepStation.remove(idPrepStation),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function prepStationByIdFn(
  idPrepStation: string | number,
): Promise<PrepStation | undefined> {
  const response = await get<PrepStation>(
    ENDPOINT.prepStation.byId(idPrepStation),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
