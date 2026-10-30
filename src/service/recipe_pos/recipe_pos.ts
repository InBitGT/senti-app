import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import {
  ApiRecipeCatalogProduct,
  RecipeCheckoutPayload,
} from "@/src/types/recipe_pos/recipe_pos";
import { Vaucher } from "@/src/types/vaucher/vaucher";

export async function RecipeCatalogFn(): Promise<
  ApiRecipeCatalogProduct[] | undefined
> {
  const { claims } = useAuthStore.getState();
  const { session } = useCashRegisterSessionStore.getState();

  if (!claims || !session) {
    throw new Error("Sesión no válida");
  }

  const response = await get<ApiRecipeCatalogProduct[]>(
    ENDPOINT.pos.detail(
      session.cash_register.warehouse_id,
      claims.tenant_id,
      "recipe",
    ),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function RecipeCheckoutFn(
  payload: RecipeCheckoutPayload,
): Promise<Vaucher | undefined> {
  const response = await post<Vaucher, RecipeCheckoutPayload>(
    ENDPOINT.pos.checkout,
    payload,
  );

  if (response.code !== "200" && response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}
