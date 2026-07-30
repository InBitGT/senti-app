import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  DataResponse,
  StockCount,
  StockCountProduct,
} from "@/src/types/stock_count/stock_count.types";

export async function StockCountFn(idWarehouse: string | number) {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  const response = await get<StockCount[]>(
    ENDPOINT.stock_count.detailInfo(claims.tenant_id, idWarehouse),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostStockCount(data: StockCount): Promise<DataResponse> {
  const response = await post<DataResponse, StockCount>(
    ENDPOINT.stock_count.info,
    data,
  );

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  if (!response.data) {
    throw new Error("La respuesta no contiene datos.");
  }

  return response.data;
}

export async function ProductStockCountFn(idWarehouse: string | number) {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  const response = await get<StockCountProduct[]>(
    ENDPOINT.stock_count.detailInfoProduct(claims.tenant_id, idWarehouse),
  );
  console.log(JSON.stringify(claims), "claims");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
