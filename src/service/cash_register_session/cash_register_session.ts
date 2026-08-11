import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CashMovementPayload,
  CashVoucher,
  CloseCashRegisterPayload,
} from "@/src/types/cash_register/cash_register";
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

export async function CloseCashRegisterFn(
  sessionId: number,
  payload: CloseCashRegisterPayload,
): Promise<CashVoucher> {
  if (__DEV__) {
    console.warn(
      `[CloseCashRegisterFn] cerrando sesión ${sessionId} con payload:`,
      payload,
    );
  }

  const response = await post<CashVoucher, CloseCashRegisterPayload>(
    ENDPOINT.cash_register.closed(sessionId),
    payload,
  );

  if (__DEV__) {
    console.warn("[CloseCashRegisterFn] respuesta del backend:", response);
  }

  if (response.code !== "200" && response.code !== "201") {
    throw new Error(response.message ?? `Error ${response.code}`);
  }

  if (!response.data) {
    throw new Error("La respuesta no trajo datos del voucher de cierre.");
  }

  return response.data;
}

export async function CashMovementFn(payload: CashMovementPayload) {
  const response = await post<CashRegisterSession>(
    ENDPOINT.cash_register.movement,
    payload,
  );

  if (__DEV__) {
    console.warn("[CashMovementFn] respuesta del backend:", response);
  }

  if (response.code !== "200" && response.code !== "201") {
    throw new Error(response.message ?? `Error ${response.code}`);
  }

  return response.data;
}
