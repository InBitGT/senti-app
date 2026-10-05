import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CreateRecipe,
  Recipe,
  UpdateRecipeParams,
} from "@/src/types/recipe/recipe";

export async function recipeFn(): Promise<Recipe[] | undefined> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error("Sesión no válida");
  }

  const response = await get<Recipe[]>(
    ENDPOINT.recipe.detail(claims.tenant_id, "finished_product"),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return (response.data ?? []).filter((item) => item.recipe !== null);
}

export async function PostRecipe(
  data: CreateRecipe,
): Promise<Recipe | undefined> {
  const response = await post<Recipe>(ENDPOINT.recipe.info, data);

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutRecipe({
  id,
  data,
}: UpdateRecipeParams): Promise<Recipe | undefined> {
  const response = await put<Recipe>(`${ENDPOINT.recipe.info}/${id}`, data);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteRecipe(id: number): Promise<Recipe | undefined> {
  const response = await remove<Recipe>(`${ENDPOINT.recipe.info}/${id}`);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
