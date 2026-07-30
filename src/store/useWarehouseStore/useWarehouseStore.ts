import { Warehouse } from "@/src/types/warehouse/warehouse.types";
import { create } from "zustand";

interface States {
  data: Warehouse | null;
  setData: (data: Warehouse) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

export const useWarehouseStore = create<States>()((set, get) => ({
  data: null,
  setData: (data: Warehouse) => {
    console.log(data, "data");
    set({ data: data });
  },
  getData: () => get().data,
  clearData: () => set({ data: null }),
  isEdit: false,
  setIsEdit: (data: boolean) => {
    set({ isEdit: data });
  },
}));
