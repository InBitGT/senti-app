import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { CustomerCreditMovement } from "@/src/types/movement_credit/movement_credit";

export async function MovementCreditFn() {
  const { claims } = useAuthStore.getState();

  if (!claims) {
    throw new Error();
  }
  const response = await get<CustomerCreditMovement[]>(
    ENDPOINT.movement_credit.detail(claims.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
