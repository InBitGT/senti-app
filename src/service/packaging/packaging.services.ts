import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CreatePackaging,
  Packaging,
  UpdatePackagingParams,
} from "@/src/types/packaging/packaging";

export async function packagingFn(): Promise<Packaging[] | undefined> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error("Sesión no válida");
  }

  const response = await get<Packaging[]>(
    ENDPOINT.packaging.detail(claims.tenant_id, "packaging"),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostPackaging(
  data: CreatePackaging,
): Promise<Packaging | undefined> {
  const response = await post<Packaging>(ENDPOINT.packaging.info, data);

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutPackaging({
  id,
  data,
}: UpdatePackagingParams): Promise<Packaging | undefined> {
  const response = await put<Packaging>(
    `${ENDPOINT.packaging.info}/${id}`,
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeletePackaging(
  id: number,
): Promise<Packaging | undefined> {
  const response = await remove<Packaging>(`${ENDPOINT.packaging.info}/${id}`);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
