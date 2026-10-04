import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    CreateServiceProduct,
    ServiceProduct,
    UpdateServiceProductParams,
} from "@/src/types/service/service";

export async function serviceProductFn(): Promise<
  ServiceProduct[] | undefined
> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error("Sesión no válida");
  }

  const response = await get<ServiceProduct[]>(
    ENDPOINT.serviceProduct.detail(claims.tenant_id, "service"),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostServiceProduct(
  data: CreateServiceProduct,
): Promise<ServiceProduct | undefined> {
  const response = await post<ServiceProduct>(
    ENDPOINT.serviceProduct.info,
    data,
  );

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutServiceProduct({
  id,
  data,
}: UpdateServiceProductParams): Promise<ServiceProduct | undefined> {
  const response = await put<ServiceProduct>(
    `${ENDPOINT.serviceProduct.info}/${id}`,
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteServiceProduct(
  id: number,
): Promise<ServiceProduct | undefined> {
  const response = await remove<ServiceProduct>(
    `${ENDPOINT.serviceProduct.info}/${id}`,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
