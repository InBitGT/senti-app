import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    CreateProductWholesaleRule,
    ProductWholesaleRule,
} from "@/src/types/wholesale/wholesale";

export async function productWholesaleFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<ProductWholesaleRule[]>(
    ENDPOINT.wholesale.detail(claims.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostProductWholesale(data: CreateProductWholesaleRule) {
  const response = await post<CreateProductWholesaleRule>(
    ENDPOINT.wholesale.info,
    data,
  );
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutProductWholesale({
  id,
  data,
}: {
  id: number;
  data: ProductWholesaleRule;
}) {
  const response = await put<ProductWholesaleRule>(
    ENDPOINT.wholesale.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteProductWholesale(IdData: string | number) {
  const response = await remove<ProductWholesaleRule>(
    ENDPOINT.wholesale.info + "/" + IdData,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
