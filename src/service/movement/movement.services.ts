import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { InventoryMovement } from "@/src/types/movement/movement.types";

export async function MovementFn() {
  const { claims } = useAuthStore.getState() 
   
  if (!claims){
    throw new Error();
  }
  const response = await get<InventoryMovement[]>(ENDPOINT.movement.detail(claims.tenant_id));
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

