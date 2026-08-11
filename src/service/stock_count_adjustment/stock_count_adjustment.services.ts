import { get, post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    ApprovedType,
    CreateAdjustmentCount,
    StatusAdjustmentStock,
  StatusAdjustmentStockSelect,
    StockAdjustmentCount,
} from "@/src/types/stock_adjustment/stock_adjustment.types";

export async function StockCountAdjusmentFn(
  idWarehouse: string | number,
  status: StatusAdjustmentStockSelect,
) {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }

  const response = await get<StockAdjustmentCount[]>(
    ENDPOINT.stock_count_adjustment.detailInfo(
      claims.tenant_id,
      idWarehouse,
      status,
    ),
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostStockCountAdjustment(data: CreateAdjustmentCount) {
  const response = await post<CreateAdjustmentCount>(
    ENDPOINT.stock_count_adjustment.info,
    data,
  );

  console.log(response, "valores de respuesta");

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  if (!response.data) {
    throw new Error("La respuesta no contiene datos.");
  }

  return response.data;
}

export async function ApprovedStockCountAdjustment(
  adjusmentCountId: number,
  data: ApprovedType,
  status: StatusAdjustmentStock,
) {
  const response = await post<ApprovedType>(
    ENDPOINT.stock_count_adjustment.changesStatus(adjusmentCountId, status),
    data,
  );
  console.log(data, adjusmentCountId, status);
  console.log(response, "valores de respuesta");

  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}
