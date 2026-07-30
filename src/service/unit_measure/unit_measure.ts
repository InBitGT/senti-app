import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";

export async function UnitMeasureFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<UnitOfMeasure[]>(ENDPOINT.unitMeasure.info);
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostUnitMeasure(data: UnitOfMeasure) {
  const response = await post<UnitOfMeasure>(ENDPOINT.unitMeasure.info, data);
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutUnitMeasure({
  id,
  data,
}: {
  id: number;
  data: UnitOfMeasure;
}) {
  const response = await put<UnitOfMeasure>(
    ENDPOINT.unitMeasure.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteUnitMeasure(IdData: string | number) {
  const response = await remove<UnitOfMeasure>(
    ENDPOINT.unitMeasure.info + "/" + IdData,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
