import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    CashRegister,
    CreateCashRegister,
} from "@/src/types/cash_register/cash_register";

export async function cashRegisterFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<CashRegister[]>(
    ENDPOINT.cash_register.detail(claims.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostCashRegister(data: CreateCashRegister) {
  const response = await post<CreateCashRegister>(
    ENDPOINT.cash_register.info,
    data,
  );
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutCashRegister({
  id,
  data,
}: {
  id: number;
  data: CashRegister;
}) {
  const response = await put<CashRegister>(
    ENDPOINT.cash_register.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteCashRegister(IdData: string | number) {
  const response = await remove<CashRegister>(
    ENDPOINT.cash_register.info + "/" + IdData,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
