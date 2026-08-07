import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { useCashRegisterSessionStore } from "@/src/store/useCashRegisterSessionStore/useCashRegisterSessionStore";
import { ApiCatalogProduct, CheckoutPayload } from "@/src/types/pos/pos";
import { Vaucher } from "@/src/types/vaucher/vaucher";

export async function CatalogFn() {
  const { claims } = useAuthStore.getState();
  const { session } = useCashRegisterSessionStore.getState();
  console.log("llega aqui ---", session);

  if (!claims || !session) {
    throw new Error();
  }
  console.log("llega aqui");

  const response = await get<ApiCatalogProduct[]>(
    ENDPOINT.pos.detail(
      session.cash_register.branch_id,
      claims.tenant_id,
      "finished_product",
    ),
  );

  console.log(response, "valores");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function CheckoutFn(
  payload: CheckoutPayload,
): Promise<Vaucher | undefined> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  // TODO: confirmar el endpoint real de checkout del POS.
  const response = await post<Vaucher, CheckoutPayload>(
    ENDPOINT.pos.checkout,
    payload,
  );
  console.log(response, "valores", payload);

  if (response.code !== "200" && response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}
