import { ProductWholesaleRule } from "@/src/types/wholesale/wholesale";
import { create } from "zustand";

interface ProductWholesaleStoreState {
  data?: ProductWholesaleRule;
  isEdit: boolean;
  setData: (data?: ProductWholesaleRule) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useProductWholesaleStore = create<ProductWholesaleStoreState>(
  (set) => ({
    data: undefined,
    isEdit: false,
    setData: (data) => set({ data }),
    setIsEdit: (isEdit) => set({ isEdit }),
    clearData: () => set({ data: undefined, isEdit: false }),
  }),
);
