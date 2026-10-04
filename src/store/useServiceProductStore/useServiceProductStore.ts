import { ServiceProduct } from "@/src/types/service/service";
import { create } from "zustand";

interface ServiceProductStoreState {
  data?: ServiceProduct;
  isEdit: boolean;
  setData: (data?: ServiceProduct) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useServiceProductStore = create<ServiceProductStoreState>(
  (set) => ({
    data: undefined,
    isEdit: false,
    setData: (data) => set({ data }),
    setIsEdit: (isEdit) => set({ isEdit }),
    clearData: () => set({ data: undefined, isEdit: false }),
  }),
);
