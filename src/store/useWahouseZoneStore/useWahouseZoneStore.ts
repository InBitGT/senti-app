import { WarehouseZone } from "@/src/types/warehouse_zone/warehouse_zone";
import { create } from "zustand";

interface WarehouseZoneStoreState {
  data?: WarehouseZone;
  isEdit: boolean;
  warehouseId?: string | number;
  setData: (data?: WarehouseZone) => void;
  setIsEdit: (isEdit: boolean) => void;
  setWarehouseId: (warehouseId?: string | number) => void;
  clearData: () => void;
}

export const useWarehouseZoneStore = create<WarehouseZoneStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  warehouseId: undefined,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  setWarehouseId: (warehouseId) => set({ warehouseId }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
