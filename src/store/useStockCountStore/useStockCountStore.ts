import { DataResponse } from "@/src/types/stock_count/stock_count.types";
import { create } from "zustand";

interface States {
  data: DataResponse | null;
  setData: (data: DataResponse) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

export const useStockCountStore = create<States>()((set, get) => ({
  data: null,
  setData: (data: DataResponse) => {
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
