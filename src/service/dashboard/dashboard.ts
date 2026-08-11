import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { AlertStock } from "@/src/types/dashboard/dashboard";

export async function dashboardFn(idRol: string | number) {
  const response = await get<AlertStock[]>(ENDPOINT.dashboard.detail(idRol));

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
