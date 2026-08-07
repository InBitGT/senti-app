import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CashRegisterSession,
  OpenCashRegisterPayload,
} from "@/src/types/cash_register_session/cash_register_session";

export async function CashRegisterSessionFn(): Promise<CashRegisterSession | null> {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  const response = await get<CashRegisterSession[] | CashRegisterSession>(
    ENDPOINT.cash_register_session.detail(claims.sub),
  );
  console.log(response);

  if (response.message === "CLOSED_REGISTER_CASH") {
    return null;
  }

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  const data = response.data as CashRegisterSession[] | CashRegisterSession;
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function OpenCashRegisterFn(payload: OpenCashRegisterPayload) {
  const response = await post<CashRegisterSession>(
    ENDPOINT.cash_register_session.info,
    payload,
  );
  console.log("=================================");
  console.log(payload, "data");
  console.log(response, "reponse");

  if (response.code !== "201" && response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
