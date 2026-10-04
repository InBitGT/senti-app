import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    CreateIngredient,
    Ingredient,
    UpdateIngredientParams,
} from "@/src/types/ingredient/ingredient";

export async function ingredientFn(): Promise<Ingredient[] | undefined> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error("Sesión no válida");
  }

  const response = await get<Ingredient[]>(
    ENDPOINT.ingredient.detail(claims.tenant_id, "ingredients"),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostIngredient(
  data: CreateIngredient,
): Promise<Ingredient | undefined> {
  const response = await post<Ingredient>(ENDPOINT.ingredient.info, data);

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutIngredient({
  id,
  data,
}: UpdateIngredientParams): Promise<Ingredient | undefined> {
  const response = await put<Ingredient>(
    `${ENDPOINT.ingredient.info}/${id}`,
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteIngredient(
  id: number,
): Promise<Ingredient | undefined> {
  const response = await remove<Ingredient>(
    `${ENDPOINT.ingredient.info}/${id}`,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
