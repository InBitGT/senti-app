import { CustomerType } from "@/src/types/customer_type/customer_type";
import { create } from "zustand";

interface CustomerTypeStoreState {
  data?: CustomerType;
  isEdit: boolean;
  setData: (data?: CustomerType) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useCustomerTypeStore = create<CustomerTypeStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
