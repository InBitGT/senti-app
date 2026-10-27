import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  CancelTransferBody,
  CreateTransferBody,
  DispatchTransferBody,
  ReceiveTransferBody,
  StockTransferDetail,
  StockTransferFilters,
  StockTransferPage,
  TransferReception,
} from "@/src/types/stock_transfer/stock_transfer.types";

function buildQuery(tenantId: number, filters: StockTransferFilters) {
  const params = new URLSearchParams({ tenant_id: String(tenantId) });
  if (filters.branch_id) params.set("branch_id", String(filters.branch_id));
  if (filters.status?.length) params.set("status", filters.status.join(","));
  if (filters.transfer_type) params.set("transfer_type", filters.transfer_type);
  if (filters.number?.trim()) params.set("number", filters.number.trim());
  if (filters.with_differences) params.set("with_differences", "true");
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.page_size ?? 10));
  return params.toString();
}

export async function stockTransferFn(filters: StockTransferFilters) {
  const { claims } = useAuthStore.getState();

  if (!claims) {
    throw new Error();
  }
  const response = await get<StockTransferPage>(
    ENDPOINT.stockTransfer.list(buildQuery(claims.tenant_id, filters)),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function incomingTransferFn(branchId: number | string) {
  const { claims } = useAuthStore.getState();

  if (!claims) {
    throw new Error();
  }
  const response = await get<StockTransferPage>(
    ENDPOINT.stockTransfer.incoming(claims.tenant_id, branchId),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function stockTransferByIDFn(ID: number | string) {
  const response = await get<StockTransferDetail>(
    ENDPOINT.stockTransfer.byID(ID),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function transferReceptionFn(ID: number | string) {
  const response = await get<TransferReception>(
    ENDPOINT.stockTransfer.reception(ID),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function createTransferFn(body: CreateTransferBody) {
  const response = await post<StockTransferDetail>(
    ENDPOINT.stockTransfer.info,
    body,
  );
  console.log(JSON.stringify(body));
  if (response.code !== "201" && response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function dispatchTransferFn({
  id,
  body,
}: {
  id: number;
  body: DispatchTransferBody;
}) {
  const response = await post<StockTransferDetail>(
    ENDPOINT.stockTransfer.dispatch(id),
    body,
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function receiveTransferFn({
  id,
  body,
}: {
  id: number;
  body: ReceiveTransferBody;
}) {
  const response = await post<StockTransferDetail>(
    ENDPOINT.stockTransfer.receive(id),
    body,
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function cancelTransferFn({
  id,
  body,
}: {
  id: number;
  body: CancelTransferBody;
}) {
  const response = await post<StockTransferDetail>(
    ENDPOINT.stockTransfer.cancel(id),
    body,
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
