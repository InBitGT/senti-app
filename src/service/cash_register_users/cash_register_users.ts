import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { CashRegisterUsers } from "@/src/types/cash_register_user/cash_register_user";

export async function CashRegisterUserFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  const response = await get<CashRegisterUsers[]>(
    ENDPOINT.cash_register_users.detail(claims.sub),
  );

  if (response.message === "CLOSED_REGISTER_CASH") {
    return null;
  }

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
