import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CreateIngredient,
  MenuIngredient,
  StockProductType,
} from "@/src/types/product/product.types";

/** Productos del tenant filtrados por tipo: producto final o ingrediente. */
export async function productByTypeFn(
  type: StockProductType,
): Promise<MenuIngredient[] | undefined> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<MenuIngredient[]>(
    ENDPOINT.product.detail(claims.tenant_id, type),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

/** Compatibilidad: productos finales. */
export function productIngredientFn(): Promise<MenuIngredient[] | undefined> {
  return productByTypeFn("finished_product");
}

export async function PostIngredient(data: CreateIngredient) {
  const response = await post<CreateIngredient>(ENDPOINT.product.info, data);
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutIngredient({
  id,
  data,
}: {
  id: number;
  data: CreateIngredient;
}) {
  const response = await put<CreateIngredient>(
    ENDPOINT.product.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteIngredient(IdCategorie: string | number) {
  const response = await remove<CreateIngredient>(
    ENDPOINT.product.info + "/" + IdCategorie,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
